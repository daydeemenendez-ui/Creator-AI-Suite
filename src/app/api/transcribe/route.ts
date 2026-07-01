import { NextRequest, NextResponse } from "next/server";
import { transcribeAudio } from "@/lib/groq";
import { prisma } from "@/lib/prisma";

export const maxDuration = 60;
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// POST /api/transcribe
// Body (JSON): { type: "storage-path", path: string, fileName: string }
// The client uploads the file directly to Supabase Storage (bypassing Vercel's 4.5MB limit),
// then calls this endpoint with only the storage path. The server downloads from Supabase
// and sends to Groq Whisper.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { type: string; path?: string; fileName?: string };

    if (body.type === "storage-path") {
      const { path, fileName } = body;
      if (!path || !fileName) {
        return NextResponse.json({ error: "Faltan path o fileName." }, { status: 400 });
      }

      // Download the file from Supabase Storage using service role
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
      const bucket = process.env.SUPABASE_BUCKET_AUDIOS ?? "creator-audios";

      const storageRes = await fetch(
        `${supabaseUrl}/storage/v1/object/${bucket}/${path}`,
        { headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey } }
      );

      if (!storageRes.ok) {
        return NextResponse.json(
          { error: `No se pudo descargar el archivo de Storage (${storageRes.status}).` },
          { status: 502 }
        );
      }

      const arrayBuffer = await storageRes.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const transcript = await transcribeAudio(buffer, fileName);

      // Persist (best-effort)
      let sourceId = "local", transcriptId = "local";
      try {
        const ext = fileName.split(".").pop()?.toLowerCase() ?? "mp3";
        const project = await prisma.project.findFirst({ orderBy: { createdAt: "asc" } })
          ?? await prisma.project.create({ data: { name: "Mi Proyecto" } });
        const sourceType = ext === "mp4" ? "UPLOAD_MP4" : ext === "wav" ? "UPLOAD_WAV" : "UPLOAD_MP3";
        const source = await prisma.source.create({
          data: { projectId: project.id, type: sourceType, fileName, title: fileName, status: "READY" },
        });
        const rec = await prisma.transcript.create({
          data: { sourceId: source.id, originalText: transcript, workspaceText: transcript, wordCount: transcript.split(/\s+/).length },
        });
        sourceId = source.id;
        transcriptId = rec.id;
      } catch { /* DB optional */ }

      return NextResponse.json({
        success: true,
        sourceId,
        transcriptId,
        title: fileName,
        originalText: transcript,
        wordCount: transcript.split(/\s+/).length,
      });
    }

    return NextResponse.json({ error: `Tipo desconocido: ${body.type}` }, { status: 400 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

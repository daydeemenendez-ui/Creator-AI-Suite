import { NextRequest, NextResponse } from "next/server";
import { transcribeAudio } from "@/lib/groq";
import { getYouTubeTranscript } from "@/lib/youtube-audio";
import { prisma } from "@/lib/prisma";

export const maxDuration = 60;
export const config = { api: { bodyParser: false } };
// Increase body size limit to 30 MB for audio/video uploads
export const fetchCache = "force-no-store";

// Next.js App Router: set request body size limit
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// ── POST /api/transcribe ──────────────────────────────────────────────────────
// body: FormData with either { type: "url", url: string }
//                         or { type: "file", file: File }
export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const type = form.get("type") as string;

    // ── URL ──────────────────────────────────────────────────────────────────
    if (type === "url") {
      const url = (form.get("url") as string)?.trim();
      if (!url) return NextResponse.json({ error: "URL requerida." }, { status: 400 });

      const videoId = extractVideoId(url);
      if (!videoId) return NextResponse.json({ error: "URL de YouTube no válida." }, { status: 400 });

      const transcript = await getYouTubeTranscript(videoId);

      // Metadata (best-effort)
      let title = `Video ${videoId}`;
      let channelName: string | null = null;
      try {
        const oembed = await fetch(
          `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`
        ).then((r) => (r.ok ? r.json() : null));
        if (oembed?.title) title = oembed.title;
        if (oembed?.author_name) channelName = oembed.author_name;
      } catch { /* optional */ }

      // Persist (best-effort)
      let sourceId = "local", transcriptId = "local";
      try {
        const project = await prisma.project.findFirst({ orderBy: { createdAt: "asc" } })
          ?? await prisma.project.create({ data: { name: "Mi Proyecto" } });
        const source = await prisma.source.create({
          data: { projectId: project.id, type: "YOUTUBE", url, status: "READY", title, channelName },
        });
        const rec = await prisma.transcript.create({
          data: { sourceId: source.id, originalText: transcript, workspaceText: transcript, language: "es", wordCount: transcript.split(/\s+/).length },
        });
        sourceId = source.id;
        transcriptId = rec.id;
      } catch { /* DB optional */ }

      return NextResponse.json({ success: true, sourceId, transcriptId, title, channelName, originalText: transcript, wordCount: transcript.split(/\s+/).length });
    }

    // ── FILE ─────────────────────────────────────────────────────────────────
    if (type === "file") {
      const file = form.get("file") as File | null;
      if (!file) return NextResponse.json({ error: "No se recibió archivo." }, { status: 400 });

      const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
      const supported = ["mp3", "mp4", "m4a", "wav", "webm", "mpeg", "ogg"];
      if (!supported.includes(ext)) {
        return NextResponse.json({ error: `Formato .${ext} no soportado. Usa MP4, MP3, M4A o WAV.` }, { status: 400 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const transcript = await transcribeAudio(buffer, file.name);

      // Persist (best-effort)
      let sourceId = "local", transcriptId = "local";
      try {
        const project = await prisma.project.findFirst({ orderBy: { createdAt: "asc" } })
          ?? await prisma.project.create({ data: { name: "Mi Proyecto" } });
        const sourceType = ext === "mp4" ? "UPLOAD_MP4" : ext === "wav" ? "UPLOAD_WAV" : "UPLOAD_MP3";
        const source = await prisma.source.create({
          data: { projectId: project.id, type: sourceType, fileName: file.name, title: file.name, status: "READY" },
        });
        const rec = await prisma.transcript.create({
          data: { sourceId: source.id, originalText: transcript, workspaceText: transcript, wordCount: transcript.split(/\s+/).length },
        });
        sourceId = source.id;
        transcriptId = rec.id;
      } catch { /* DB optional */ }

      return NextResponse.json({ success: true, sourceId, transcriptId, title: file.name, originalText: transcript, wordCount: transcript.split(/\s+/).length });
    }

    return NextResponse.json({ error: `Tipo desconocido: ${type}` }, { status: 400 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

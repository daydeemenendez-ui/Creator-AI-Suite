"use server";

import { prisma } from "@/lib/prisma";
import { transcribeAudio } from "@/lib/groq";
import { getYouTubeTranscript } from "@/lib/youtube-audio";

// ─────────────────────────────────────────────
// ANALYZE YOUTUBE URL
// ─────────────────────────────────────────────

export async function analyzeYouTubeUrl(formData: FormData) {
  const url = (formData.get("url") as string)?.trim();
  if (!url) return { error: "Ingresa una URL de YouTube." };

  const videoId = extractVideoId(url);
  if (!videoId) return { error: "No se pudo extraer el ID del video. Verifica el enlace." };

  try {
    // 1. Transcript from captions
    const transcript = await getYouTubeTranscript(videoId);

    // 2. Metadata (best-effort)
    let title = `Video ${videoId}`;
    let channelName: string | null = null;
    try {
      const oembed = await fetch(
        `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`
      ).then((r) => (r.ok ? r.json() : null));
      if (oembed?.title) title = oembed.title;
      if (oembed?.author_name) channelName = oembed.author_name;
    } catch { /* metadata is optional */ }

    // 3. Persist (best-effort — don't fail the whole request if DB is unavailable)
    let sourceId = "local";
    let transcriptId = "local";
    try {
      const project = await prisma.project.findFirst({ orderBy: { createdAt: "asc" } })
        ?? await prisma.project.create({ data: { name: "Mi Proyecto" } });

      const source = await prisma.source.create({
        data: { projectId: project.id, type: "YOUTUBE", url, status: "READY", title, channelName },
      });
      const rec = await prisma.transcript.create({
        data: {
          sourceId: source.id,
          originalText: transcript,
          workspaceText: transcript,
          language: "es",
          wordCount: transcript.split(/\s+/).length,
        },
      });
      sourceId = source.id;
      transcriptId = rec.id;
    } catch { /* DB failure is non-fatal */ }

    return { success: true, sourceId, transcriptId, title, channelName, originalText: transcript, wordCount: transcript.split(/\s+/).length };
  } catch (err) {
    return { error: String(err) };
  }
}

// ─────────────────────────────────────────────
// UPLOAD FILE — transcribe with Groq Whisper
// ─────────────────────────────────────────────

export async function uploadAndTranscribe(formData: FormData) {
  const file = formData.get("file") as File | null;
  if (!file) return { error: "No se recibió ningún archivo." };

  // Groq accepts: mp3, mp4, mpeg, mpga, m4a, wav, webm — no ffmpeg needed
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  const supported = ["mp3", "mp4", "m4a", "wav", "webm", "mpeg", "mpga", "ogg"];
  if (!supported.includes(ext)) {
    return { error: `Formato .${ext} no soportado. Usa MP4, MP3, M4A o WAV.` };
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const transcript = await transcribeAudio(buffer, file.name);

    // Persist (best-effort)
    let sourceId = "local";
    let transcriptId = "local";
    try {
      const project = await prisma.project.findFirst({ orderBy: { createdAt: "asc" } })
        ?? await prisma.project.create({ data: { name: "Mi Proyecto" } });

      const sourceType = ext === "mp4" ? "UPLOAD_MP4" : ext === "wav" ? "UPLOAD_WAV" : "UPLOAD_MP3";
      const source = await prisma.source.create({
        data: { projectId: project.id, type: sourceType, fileName: file.name, title: file.name, status: "READY" },
      });
      const rec = await prisma.transcript.create({
        data: {
          sourceId: source.id,
          originalText: transcript,
          workspaceText: transcript,
          wordCount: transcript.split(/\s+/).length,
        },
      });
      sourceId = source.id;
      transcriptId = rec.id;
    } catch { /* DB failure is non-fatal */ }

    return { success: true, sourceId, transcriptId, title: file.name, originalText: transcript, wordCount: transcript.split(/\s+/).length };
  } catch (err) {
    return { error: String(err) };
  }
}

// ─────────────────────────────────────────────
// SAVE WORKSPACE
// ─────────────────────────────────────────────

export async function saveWorkspace(formData: FormData) {
  const transcriptId = formData.get("transcriptId") as string;
  const workspaceText = formData.get("workspaceText") as string;
  if (!transcriptId || transcriptId === "local") return { success: true };

  try {
    await prisma.transcript.update({
      where: { id: transcriptId },
      data: { workspaceText },
    });
    return { success: true };
  } catch (err) {
    return { error: String(err) };
  }
}

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

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

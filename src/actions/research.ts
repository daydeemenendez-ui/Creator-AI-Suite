"use server";

import { prisma } from "@/lib/prisma";
import { uploadVideoFile } from "@/lib/supabase/storage";
import { transcribeAudio } from "@/lib/groq";
import { extractAudioFromVideo } from "@/lib/ffmpeg";
import { downloadYouTubeAudio } from "@/lib/youtube-audio";
import { z } from "zod";

// ─────────────────────────────────────────────
// SCHEMAS
// ─────────────────────────────────────────────

const AnalyzeUrlSchema = z.object({
  projectId: z.string().optional(),
  url: z.string().url(),
});

async function getOrCreateDefaultProject() {
  const existing = await prisma.project.findFirst({ orderBy: { createdAt: "asc" } });
  if (existing) return existing;
  return prisma.project.create({ data: { name: "Mi Proyecto" } });
}

const SaveWorkspaceSchema = z.object({
  transcriptId: z.string().min(1),
  workspaceText: z.string(),
});

// ─────────────────────────────────────────────
// ANALYZE YOUTUBE URL
// ─────────────────────────────────────────────

export async function analyzeYouTubeUrl(formData: FormData) {
  const raw = {
    url: formData.get("url") as string,
  };

  const parsed = AnalyzeUrlSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "URL inválida. Usa un enlace de YouTube." };
  }

  const { url } = parsed.data;
  const videoId = extractVideoId(url);
  if (!videoId) return { error: "No se pudo extraer el ID del video. Verifica el enlace." };

  try {
    // 1. Metadata via oEmbed (no auth needed)
    const oembedRes = await fetch(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`
    );
    const oembed = oembedRes.ok ? await oembedRes.json().catch(() => null) : null;

    // 2. Download audio and transcribe with Groq Whisper
    const { buffer: audioBuffer, fileName: audioFileName } = await downloadYouTubeAudio(videoId);
    const transcript = await transcribeAudio(audioBuffer, audioFileName, "es");

    // 3. Persist
    const project = await getOrCreateDefaultProject();
    const source = await prisma.source.create({
      data: { projectId: project.id, type: "YOUTUBE", url, status: "READY",
              title: oembed?.title ?? `Video ${videoId}`, channelName: oembed?.author_name },
    });
    const transcriptRecord = await prisma.transcript.create({
      data: {
        sourceId: source.id,
        originalText: transcript,
        workspaceText: transcript,
        language: "es",
        wordCount: transcript.split(/\s+/).length,
      },
    });

    return {
      success: true,
      sourceId: source.id,
      transcriptId: transcriptRecord.id,
      title: oembed?.title ?? `Video ${videoId}`,
      channelName: (oembed?.author_name as string) ?? null,
      wordCount: transcriptRecord.wordCount,
      originalText: transcript,
    };
  } catch (err) {
    return { error: String(err) };
  }
}

// ─────────────────────────────────────────────
// UPLOAD FILE (MP4 / MP3 / WAV)
// ─────────────────────────────────────────────

export async function uploadAndTranscribe(formData: FormData) {
  const file = formData.get("file") as File | null;

  if (!file) {
    return { error: "Missing file" };
  }

  const project = await getOrCreateDefaultProject();
  const projectId = project.id;

  const allowedTypes = ["video/mp4", "audio/mpeg", "audio/wav", "audio/mp3"];
  if (!allowedTypes.includes(file.type)) {
    return { error: "Unsupported file type. Use MP4, MP3 or WAV." };
  }

  const type = file.type.startsWith("video") ? "UPLOAD_MP4"
    : file.name.endsWith(".wav") ? "UPLOAD_WAV"
    : "UPLOAD_MP3";

  const source = await prisma.source.create({
    data: {
      projectId,
      type,
      fileName: file.name,
      status: "PROCESSING",
    },
  });

  try {
    let buffer = Buffer.from(await file.arrayBuffer());

    // Upload original file to Supabase Storage
    const fileUrl = await uploadVideoFile(buffer, file.name, file.type);

    await prisma.source.update({
      where: { id: source.id },
      data: { fileUrl, title: file.name, status: "READY" },
    });

    // Extract audio from MP4 before sending to Whisper
    let audioBuffer: Buffer = buffer;
    let audioFileName = file.name;
    if (file.type === "video/mp4" || file.name.toLowerCase().endsWith(".mp4")) {
      const extracted = await extractAudioFromVideo(buffer, "mp4");
      audioBuffer = Buffer.from(extracted) as Buffer;
      audioFileName = file.name.replace(/\.mp4$/i, ".mp3");
    }

    // Transcribe with Groq Whisper
    const transcript = await transcribeAudio(audioBuffer, audioFileName);

    const transcriptRecord = await prisma.transcript.create({
      data: {
        sourceId: source.id,
        originalText: transcript,
        workspaceText: transcript,
        wordCount: transcript.split(/\s+/).length,
      },
    });

    return {
      success: true,
      sourceId: source.id,
      transcriptId: transcriptRecord.id,
      fileUrl,
      originalText: transcript,
    };
  } catch (err) {
    await prisma.source.update({
      where: { id: source.id },
      data: { status: "ERROR" },
    });
    return { error: String(err) };
  }
}

// ─────────────────────────────────────────────
// SAVE WORKSPACE  (workspace is editable — originalText stays locked)
// ─────────────────────────────────────────────

export async function saveWorkspace(formData: FormData) {
  const parsed = SaveWorkspaceSchema.safeParse({
    transcriptId: formData.get("transcriptId"),
    workspaceText: formData.get("workspaceText"),
  });
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const { transcriptId, workspaceText } = parsed.data;

  // CRITICAL: Only update workspaceText — originalText is never touched
  const updated = await prisma.transcript.update({
    where: { id: transcriptId },
    data: { workspaceText },
    select: {
      id: true,
      workspaceText: true,
      updatedAt: true,
      // originalText intentionally excluded from update path
    },
  });

  return { success: true, transcript: updated };
}

// ─────────────────────────────────────────────
// GET TRANSCRIPT
// ─────────────────────────────────────────────

export async function getTranscript(transcriptId: string) {
  const transcript = await prisma.transcript.findUnique({
    where: { id: transcriptId },
    include: { source: true, outputs: true },
  });
  if (!transcript) return { error: "Transcript not found" };
  return { transcript };
}

// ─────────────────────────────────────────────
// LIST SOURCES (recent analyses)
// ─────────────────────────────────────────────

export async function listSources(projectId: string) {
  const sources = await prisma.source.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: { transcript: { select: { id: true, wordCount: true } } },
  });
  return { sources };
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
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}


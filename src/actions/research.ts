"use server";

import { prisma } from "@/lib/prisma";
import { uploadVideoFile } from "@/lib/supabase/storage";
import { z } from "zod";

// ─────────────────────────────────────────────
// SCHEMAS
// ─────────────────────────────────────────────

const AnalyzeUrlSchema = z.object({
  projectId: z.string().min(1),
  url: z.string().url().includes("youtube"),
});

const SaveWorkspaceSchema = z.object({
  transcriptId: z.string().min(1),
  workspaceText: z.string(),
});

// ─────────────────────────────────────────────
// ANALYZE YOUTUBE URL
// ─────────────────────────────────────────────

export async function analyzeYouTubeUrl(formData: FormData) {
  const raw = {
    projectId: formData.get("projectId") as string,
    url: formData.get("url") as string,
  };

  const parsed = AnalyzeUrlSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { projectId, url } = parsed.data;

  // Create source record
  const source = await prisma.source.create({
    data: {
      projectId,
      type: "YOUTUBE",
      url,
      status: "PROCESSING",
    },
  });

  try {
    // Extract metadata via oEmbed (no API key needed)
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
    const oembedRes = await fetch(oembedUrl);
    const oembed = oembedRes.ok ? await oembedRes.json() : null;

    // Extract transcript via youtube-transcript-api compatible endpoint
    const videoId = extractVideoId(url);
    if (!videoId) throw new Error("Invalid YouTube URL — could not extract video ID");

    const transcript = await fetchYouTubeTranscript(videoId);

    // Update source with metadata
    await prisma.source.update({
      where: { id: source.id },
      data: {
        title: oembed?.title ?? `Video ${videoId}`,
        channelName: oembed?.author_name,
        status: "READY",
      },
    });

    // Store transcript — originalText is IMMUTABLE, never modified after this point
    const transcriptRecord = await prisma.transcript.create({
      data: {
        sourceId: source.id,
        originalText: transcript,
        workspaceText: transcript, // starts as copy, user can edit workspace
        language: "es",
        wordCount: transcript.split(/\s+/).length,
      },
    });

    return {
      success: true,
      sourceId: source.id,
      transcriptId: transcriptRecord.id,
      title: oembed?.title,
      wordCount: transcriptRecord.wordCount,
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
// UPLOAD FILE (MP4 / MP3 / WAV)
// ─────────────────────────────────────────────

export async function uploadAndTranscribe(formData: FormData) {
  const projectId = formData.get("projectId") as string;
  const file = formData.get("file") as File | null;

  if (!file || !projectId) {
    return { error: "Missing file or projectId" };
  }

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
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileUrl = await uploadVideoFile(buffer, file.name, file.type);

    await prisma.source.update({
      where: { id: source.id },
      data: { fileUrl, title: file.name, status: "READY" },
    });

    // Transcription of uploaded files would integrate Whisper/AssemblyAI here.
    // Placeholder transcript for now — replace with actual STT call.
    const placeholderTranscript = `[Archivo subido: ${file.name}]\n\nLa transcripción del archivo de audio/video estará disponible aquí una vez procesado por el sistema STT (Whisper / AssemblyAI).`;

    const transcriptRecord = await prisma.transcript.create({
      data: {
        sourceId: source.id,
        originalText: placeholderTranscript,
        workspaceText: placeholderTranscript,
        wordCount: placeholderTranscript.split(/\s+/).length,
      },
    });

    return {
      success: true,
      sourceId: source.id,
      transcriptId: transcriptRecord.id,
      fileUrl,
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

async function fetchYouTubeTranscript(videoId: string): Promise<string> {
  // Fetch captions via YouTube's timedtext API (no auth required for public videos)
  const captionUrl = `https://www.youtube.com/api/timedtext?lang=es&v=${videoId}&fmt=json3`;
  const res = await fetch(captionUrl);

  if (res.ok) {
    const data = await res.json();
    if (data?.events?.length) {
      const text = data.events
        .filter((e: { segs?: unknown[] }) => e.segs)
        .map((e: { segs: Array<{ utf8: string }> }) =>
          e.segs.map((s) => s.utf8).join("")
        )
        .join(" ")
        .replace(/\n/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      if (text.length > 50) return text;
    }
  }

  // Fallback: try English
  const enRes = await fetch(
    `https://www.youtube.com/api/timedtext?lang=en&v=${videoId}&fmt=json3`
  );
  if (enRes.ok) {
    const data = await enRes.json();
    if (data?.events?.length) {
      return data.events
        .filter((e: { segs?: unknown[] }) => e.segs)
        .map((e: { segs: Array<{ utf8: string }> }) =>
          e.segs.map((s) => s.utf8).join("")
        )
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();
    }
  }

  throw new Error(
    "Could not fetch transcript. The video may not have captions enabled."
  );
}

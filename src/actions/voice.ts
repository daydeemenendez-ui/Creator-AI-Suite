"use server";

import { prisma } from "@/lib/prisma";
import { cloneVoice, textToSpeech, getVoiceStatus } from "@/lib/minimax";
import { mergeAudioChunks, extractAudioFromVideo } from "@/lib/ffmpeg";
import { chunkText, previewChunks } from "@/lib/chunker";
import { uploadAudioFile } from "@/lib/supabase/storage";
import { z } from "zod";

// ─────────────────────────────────────────────
// VOICE CLONING
// ─────────────────────────────────────────────

export async function createVoiceClone(formData: FormData) {
  const file = formData.get("file") as File | null;
  const name = formData.get("name") as string;
  const description = formData.get("description") as string | null;

  if (!file || !name) {
    return { error: "file and name are required" };
  }

  // Browsers report inconsistent MIME types (e.g. audio/x-wav, audio/mp4),
  // so accept by extension as well
  const allowedTypes = [
    "video/mp4", "audio/mp4", "audio/mpeg", "audio/wav",
    "audio/x-wav", "audio/wave", "audio/mp3", "audio/x-m4a",
  ];
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  const allowedExts = ["mp4", "mp3", "wav", "m4a"];
  if (!allowedTypes.includes(file.type) && !allowedExts.includes(ext)) {
    return { error: "Unsupported file type. Use MP4, MP3 or WAV." };
  }

  try {
    // eslint-disable-next-line prefer-const
    let audioBuffer: Buffer = Buffer.from(await file.arrayBuffer() as ArrayBuffer);

    // Extract audio from video if MP4
    if (file.type === "video/mp4" || ext === "mp4") {
      audioBuffer = (await extractAudioFromVideo(audioBuffer, "mp4")) as Buffer;
    }

    // Upload source audio to storage
    const sourceFileUrl = await uploadAudioFile(
      audioBuffer,
      `voice-sample-${Date.now()}.mp3`,
      "audio/mpeg"
    );

    // Clone voice via MiniMax
    const { voiceId: miniMaxVoiceId, status } = await cloneVoice(
      audioBuffer,
      file.name,
      name
    );

    // Persist voice profile
    const profile = await prisma.voiceProfile.create({
      data: {
        name,
        description: description ?? undefined,
        miniMaxVoiceId,
        sourceFileUrl,
        status: status === "success" ? "READY" : "PROCESSING",
      },
    });

    return { success: true, voiceId: profile.id, miniMaxVoiceId, status };
  } catch (err) {
    return { error: String(err) };
  }
}

// ─────────────────────────────────────────────
// POLL VOICE STATUS
// ─────────────────────────────────────────────

export async function pollVoiceStatus(voiceProfileId: string) {
  const profile = await prisma.voiceProfile.findUnique({
    where: { id: voiceProfileId },
  });
  if (!profile) return { error: "Voice profile not found" };
  if (profile.status === "READY") return { status: "READY" };

  const status = await getVoiceStatus(profile.miniMaxVoiceId);

  if (status !== profile.status.toLowerCase()) {
    await prisma.voiceProfile.update({
      where: { id: voiceProfileId },
      data: {
        status: status === "ready" ? "READY" : status === "error" ? "ERROR" : "PROCESSING",
      },
    });
  }

  return { status: status.toUpperCase() };
}

// ─────────────────────────────────────────────
// TEXT-TO-SPEECH (with chunking + merge)
// ─────────────────────────────────────────────

export async function generateAudio(formData: FormData) {
  const schema = z.object({
    voiceId: z.string().min(1),       // VoiceProfile.id (our DB id)
    text: z.string().min(1).max(50000),
    projectId: z.string().optional(),
    speed: z.coerce.number().min(0.5).max(2.0).optional(),
    pitch: z.coerce.number().min(-12).max(12).optional(),
  });

  const parsed = schema.safeParse({
    voiceId: formData.get("voiceId"),
    text: formData.get("text"),
    projectId: formData.get("projectId"),
    speed: formData.get("speed"),
    pitch: formData.get("pitch"),
  });

  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const { voiceId, text, projectId, speed, pitch } = parsed.data;

  // Fetch voice profile
  const profile = await prisma.voiceProfile.findUnique({ where: { id: voiceId } });
  if (!profile) return { error: "Voice profile not found" };
  if (profile.status !== "READY") return { error: "Voice is still processing — try again shortly" };

  // Create generation record
  const generation = await prisma.audioGeneration.create({
    data: {
      voiceId,
      projectId: projectId ?? null,
      textInput: text,
      status: "CHUNKING",
    },
  });

  try {
    // ── 1. CHUNK TEXT ────────────────────────────
    const chunks = chunkText(text);

    await prisma.audioGeneration.update({
      where: { id: generation.id },
      data: { chunkCount: chunks.length, status: "GENERATING" },
    });

    // Persist chunk records
    const chunkRecords = await Promise.all(
      chunks.map((c) =>
        prisma.audioChunk.create({
          data: {
            generationId: generation.id,
            index: c.index,
            text: c.text,
            status: "PENDING",
          },
        })
      )
    );

    // ── 2. GENERATE AUDIO PER CHUNK (parallel) ───
    const audioBuffers: Buffer[] = new Array(chunks.length);

    await Promise.all(
      chunks.map(async (chunk, i) => {
        const buffer = await textToSpeech({
          voiceId: profile.miniMaxVoiceId,
          text: chunk.text,
          speed: speed ?? 1.0,
          pitch: pitch ?? 0,
        });

        audioBuffers[i] = buffer;

        await prisma.audioChunk.update({
          where: { id: chunkRecords[i].id },
          data: { status: "DONE" },
        });
      })
    );

    // ── 3. MERGE WITH FFMPEG ─────────────────────
    await prisma.audioGeneration.update({
      where: { id: generation.id },
      data: { status: "MERGING" },
    });

    const merged = chunks.length === 1
      ? audioBuffers[0]
      : await mergeAudioChunks(audioBuffers);

    // ── 4. UPLOAD TO STORAGE ─────────────────────
    const audioUrl = await uploadAudioFile(
      merged,
      `audio-${generation.id}.mp3`,
      "audio/mpeg"
    );

    const final = await prisma.audioGeneration.update({
      where: { id: generation.id },
      data: {
        audioUrl,
        status: "READY",
        durationMs: Math.ceil((text.split(/\s+/).length / 150) * 60 * 1000),
      },
    });

    return {
      success: true,
      generationId: generation.id,
      audioUrl,
      chunkCount: chunks.length,
      durationMs: final.durationMs,
    };
  } catch (err) {
    await prisma.audioGeneration.update({
      where: { id: generation.id },
      data: { status: "ERROR", errorMessage: String(err) },
    });
    return { error: String(err) };
  }
}

// ─────────────────────────────────────────────
// PREVIEW CHUNK PLAN  (before generating)
// ─────────────────────────────────────────────

export async function previewAudioChunks(formData: FormData) {
  const text = formData.get("text") as string;
  if (!text) return { error: "text is required" };
  return { success: true, preview: previewChunks(text) };
}

// ─────────────────────────────────────────────
// UPDATE VOICE PERSONALITY
// ─────────────────────────────────────────────

export async function updateVoicePersonality(voiceProfileId: string, personality: string) {
  try {
    const profile = await prisma.voiceProfile.update({
      where: { id: voiceProfileId },
      data: { personality: personality.trim() || null },
      select: { id: true, personality: true },
    });
    return { success: true, personality: profile.personality };
  } catch (err) {
    return { error: String(err) };
  }
}

// ─────────────────────────────────────────────
// REWRITE TEXT WITH VOICE PERSONALITY
// ─────────────────────────────────────────────

export async function rewriteVoiceText(text: string, personality: string) {
  if (!text.trim()) return { error: "text is required" };
  if (!personality.trim()) return { error: "personality is required" };

  try {
    const { chat } = await import("@/lib/openrouter");
    const { PROMPTS } = await import("@/lib/prompts");
    const result = await chat(
      [{ role: "user", content: PROMPTS.VOICE_REWRITE(text, personality) }],
      { temperature: 0.75 }
    );
    return { success: true, text: result.trim() };
  } catch (err) {
    return { error: String(err) };
  }
}

// ─────────────────────────────────────────────
// COMPOSE NEW TEXT WITH VOICE PERSONALITY
// ─────────────────────────────────────────────

export async function composeVoiceText(personality: string) {
  if (!personality.trim()) return { error: "personality is required" };

  try {
    const { chat } = await import("@/lib/openrouter");
    const { PROMPTS } = await import("@/lib/prompts");
    const result = await chat(
      [{ role: "user", content: PROMPTS.VOICE_COMPOSE(personality) }],
      { temperature: 0.9 }
    );
    return { success: true, text: result.trim() };
  } catch (err) {
    return { error: String(err) };
  }
}

// ─────────────────────────────────────────────
// LIST VOICE PROFILES
// ─────────────────────────────────────────────

export async function listVoiceProfiles() {
  const profiles = await prisma.voiceProfile.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { audioGenerations: true } },
    },
  });
  return { profiles };
}

// ─────────────────────────────────────────────
// LIST AUDIO GENERATIONS
// ─────────────────────────────────────────────

export async function listAudioGenerations(projectId?: string) {
  const generations = await prisma.audioGeneration.findMany({
    where: projectId ? { projectId } : {},
    orderBy: { createdAt: "desc" },
    take: 20,
    include: {
      voice: { select: { name: true } },
    },
  });
  return { generations };
}

// ─────────────────────────────────────────────
// DELETE VOICE PROFILE
// ─────────────────────────────────────────────

export async function deleteVoiceProfile(voiceProfileId: string) {
  await prisma.voiceProfile.delete({ where: { id: voiceProfileId } });
  return { success: true };
}

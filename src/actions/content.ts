"use server";

import { prisma } from "@/lib/prisma";
import { chat } from "@/lib/openrouter";
import { PROMPTS } from "@/lib/prompts";
import { z } from "zod";

// ─────────────────────────────────────────────
// SCHEMAS
// ─────────────────────────────────────────────

const GenerateSchema = z.object({
  transcriptId: z.string().min(1),
  projectId: z.string().optional(),
});

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

async function getTranscriptText(transcriptId: string): Promise<string> {
  const t = await prisma.transcript.findUnique({
    where: { id: transcriptId },
    select: { originalText: true }, // always use originalText as AI context
  });
  if (!t) throw new Error("Transcript not found");
  return t.originalText;
}

function parseJsonSafe<T>(raw: string): T {
  // Strip markdown code fences if model wraps output in ```json
  const cleaned = raw
    .replace(/^```(?:json)?\n?/m, "")
    .replace(/\n?```$/m, "")
    .trim();
  return JSON.parse(cleaned) as T;
}

// ─────────────────────────────────────────────
// GENERATE IDEAS
// ─────────────────────────────────────────────

export async function generateIdeas(formData: FormData) {
  const parsed = GenerateSchema.safeParse({
    transcriptId: formData.get("transcriptId"),
    projectId: formData.get("projectId"),
  });
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const { transcriptId, projectId } = parsed.data;

  try {
    const transcript = await getTranscriptText(transcriptId);
    const raw = await chat(
      [{ role: "user", content: PROMPTS.IDEAS(transcript) }],
      { temperature: 0.8 }
    );

    const data = parseJsonSafe<{ ideas: Array<Record<string, unknown>> }>(raw);

    // Persist to ContentOutput
    const outputs = await Promise.all(
      data.ideas.map((idea) =>
        prisma.contentOutput.create({
          data: {
            transcriptId,
            type: "IDEA",
            title: idea.title as string,
            body: idea.description as string,
            metadata: idea as never,
            model: process.env.OPENROUTER_DEFAULT_MODEL,
          },
        })
      )
    );

    // Also save to ideas table if projectId given
    if (projectId) {
      await Promise.all(
        data.ideas.map((idea) =>
          prisma.idea.create({
            data: {
              projectId,
              title: idea.title as string,
              description: idea.description as string,
              tags: (idea.tags as string[]) ?? [],
              priority:
                (idea.ctr_potential as string) === "muy_alto" ? "alta"
                : (idea.ctr_potential as string) === "alto" ? "alta"
                : "media",
            },
          })
        )
      );
    }

    return { success: true, ideas: data.ideas, outputIds: outputs.map((o) => o.id) };
  } catch (err) {
    return { error: String(err) };
  }
}

// ─────────────────────────────────────────────
// GENERATE SCRIPT
// ─────────────────────────────────────────────

export async function generateScript(formData: FormData) {
  const parsed = GenerateSchema.safeParse({
    transcriptId: formData.get("transcriptId"),
    projectId: formData.get("projectId"),
  });
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const ideaTitle = formData.get("ideaTitle") as string;
  if (!ideaTitle) return { error: "ideaTitle is required" };

  const { transcriptId, projectId } = parsed.data;

  try {
    const transcript = await getTranscriptText(transcriptId);
    const raw = await chat(
      [{ role: "user", content: PROMPTS.SCRIPT(transcript, ideaTitle) }],
      { maxTokens: 4096, temperature: 0.7 }
    );

    const data = parseJsonSafe<{
      title: string;
      word_count: number;
      sections: Array<{ type: string; title: string; content: string }>;
    }>(raw);

    const fullBody = data.sections.map((s) => `## ${s.title}\n\n${s.content}`).join("\n\n");

    // Persist
    const output = await prisma.contentOutput.create({
      data: {
        transcriptId,
        type: "SCRIPT",
        title: data.title,
        body: fullBody,
        metadata: data as never,
        model: process.env.OPENROUTER_DEFAULT_MODEL,
      },
    });

    if (projectId) {
      await prisma.script.create({
        data: {
          projectId,
          title: data.title,
          body: fullBody,
          wordCount: data.word_count ?? fullBody.split(/\s+/).length,
        },
      });
    }

    return { success: true, script: data, outputId: output.id };
  } catch (err) {
    return { error: String(err) };
  }
}

// ─────────────────────────────────────────────
// GENERATE SHORTS
// ─────────────────────────────────────────────

export async function generateShorts(formData: FormData) {
  const parsed = GenerateSchema.safeParse({
    transcriptId: formData.get("transcriptId"),
    projectId: formData.get("projectId"),
  });
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const { transcriptId } = parsed.data;

  try {
    const transcript = await getTranscriptText(transcriptId);
    const raw = await chat(
      [{ role: "user", content: PROMPTS.SHORTS(transcript) }],
      { temperature: 0.9 }
    );

    const data = parseJsonSafe<{ shorts: Array<Record<string, unknown>> }>(raw);

    const outputs = await Promise.all(
      data.shorts.map((s) =>
        prisma.contentOutput.create({
          data: {
            transcriptId,
            type: "SHORTS_SCRIPT",
            title: s.title as string,
            body: s.script as string,
            metadata: s as never,
            model: process.env.OPENROUTER_DEFAULT_MODEL,
          },
        })
      )
    );

    return { success: true, shorts: data.shorts, outputIds: outputs.map((o) => o.id) };
  } catch (err) {
    return { error: String(err) };
  }
}

// ─────────────────────────────────────────────
// GENERATE SEO PACK
// ─────────────────────────────────────────────

export async function generateSEO(formData: FormData) {
  const parsed = GenerateSchema.safeParse({
    transcriptId: formData.get("transcriptId"),
    projectId: formData.get("projectId"),
  });
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const title = (formData.get("title") as string) ?? "Mi Video";
  const { transcriptId } = parsed.data;

  try {
    const transcript = await getTranscriptText(transcriptId);
    const raw = await chat(
      [{ role: "user", content: PROMPTS.SEO(transcript, title) }],
      { temperature: 0.5 }
    );

    const data = parseJsonSafe<Record<string, unknown>>(raw);

    await prisma.contentOutput.create({
      data: {
        transcriptId,
        type: "SEO_PACK",
        title: `SEO Pack — ${title}`,
        body: JSON.stringify(data, null, 2),
        metadata: data as never,
        model: process.env.OPENROUTER_DEFAULT_MODEL,
      },
    });

    return { success: true, seo: data };
  } catch (err) {
    return { error: String(err) };
  }
}

// ─────────────────────────────────────────────
// GENERATE EMAIL
// ─────────────────────────────────────────────

export async function generateEmail(formData: FormData) {
  const parsed = GenerateSchema.safeParse({
    transcriptId: formData.get("transcriptId"),
  });
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const channelName = (formData.get("channelName") as string) ?? undefined;
  const { transcriptId } = parsed.data;

  try {
    const transcript = await getTranscriptText(transcriptId);
    const raw = await chat(
      [{ role: "user", content: PROMPTS.EMAIL(transcript, channelName) }],
      { temperature: 0.7 }
    );

    const data = parseJsonSafe<Record<string, unknown>>(raw);

    await prisma.contentOutput.create({
      data: {
        transcriptId,
        type: "EMAIL",
        title: data.subject as string,
        body: data.body as string,
        metadata: data as never,
        model: process.env.OPENROUTER_DEFAULT_MODEL,
      },
    });

    return { success: true, email: data };
  } catch (err) {
    return { error: String(err) };
  }
}

// ─────────────────────────────────────────────
// FREE CHAT (Content Studio chat panel)
// ─────────────────────────────────────────────

export async function contentChat(formData: FormData) {
  const message = formData.get("message") as string;
  const transcriptId = formData.get("transcriptId") as string | null;
  const history = JSON.parse((formData.get("history") as string) ?? "[]");

  if (!message) return { error: "message is required" };

  try {
    let systemPrompt =
      "Eres un asistente experto en creación de contenido para YouTube y redes sociales. Responde siempre en español a menos que el usuario cambie de idioma.";

    if (transcriptId) {
      const transcript = await getTranscriptText(transcriptId);
      systemPrompt += `\n\nCONTEXTO — Transcripción del video activo:\n${transcript.slice(0, 3000)}`;
    }

    const messages = [
      { role: "system" as const, content: systemPrompt },
      ...history,
      { role: "user" as const, content: message },
    ];

    const response = await chat(messages, { temperature: 0.7 });
    return { success: true, response };
  } catch (err) {
    return { error: String(err) };
  }
}

// ─────────────────────────────────────────────
// LIST OUTPUTS
// ─────────────────────────────────────────────

export async function listOutputs(transcriptId: string) {
  const outputs = await prisma.contentOutput.findMany({
    where: { transcriptId },
    orderBy: { createdAt: "desc" },
  });
  return { outputs };
}

import type { ChatMessage, CompletionOptions } from "@/lib/openrouter";

async function resolveProvider(): Promise<"minimax" | "openrouter"> {
  // Env var takes priority
  if (process.env.AI_PROVIDER) {
    return process.env.AI_PROVIDER as "minimax" | "openrouter";
  }
  // Check which keys are set
  if (process.env.MINIMAX_API_KEY) return "minimax";
  if (process.env.OPENROUTER_API_KEY) return "openrouter";

  // Fall back to DB
  try {
    const { prisma } = await import("@/lib/prisma");
    const [mm, or] = await Promise.all([
      prisma.appSettings.findUnique({ where: { key: "minimax_api_key" } }),
      prisma.appSettings.findUnique({ where: { key: "openrouter_api_key" } }),
    ]);
    if (mm?.value) return "minimax";
    if (or?.value) return "openrouter";
  } catch { /* DB unavailable */ }

  return "openrouter";
}

export async function chat(
  messages: ChatMessage[],
  options: CompletionOptions = {}
): Promise<string> {
  const provider = await resolveProvider();

  if (provider === "minimax") {
    const { chat: minimaxChat } = await import("@/lib/minimax");
    return minimaxChat(messages, options);
  }

  const { chat: orChat } = await import("@/lib/openrouter");
  return orChat(messages, options);
}

export async function* chatStream(
  messages: ChatMessage[],
  options: CompletionOptions = {}
): AsyncGenerator<string> {
  const provider = await resolveProvider();

  if (provider === "minimax") {
    const { chatStream: minimaxStream } = await import("@/lib/minimax");
    yield* minimaxStream(messages, options);
    return;
  }

  const { chatStream: orStream } = await import("@/lib/openrouter");
  yield* orStream(messages, options);
}

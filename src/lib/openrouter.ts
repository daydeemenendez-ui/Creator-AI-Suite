const BASE_URL = process.env.OPENROUTER_BASE_URL ?? "https://openrouter.ai/api/v1";
const DEFAULT_MODEL = process.env.OPENROUTER_DEFAULT_MODEL ?? "anthropic/claude-sonnet-4-6";

async function resolveApiKey(): Promise<string> {
  // 1. Env var (.env / Vercel dashboard) takes priority
  if (process.env.OPENROUTER_API_KEY) return process.env.OPENROUTER_API_KEY;
  // 2. Fall back to key saved via Settings UI → stored in DB
  try {
    const { prisma } = await import("@/lib/prisma");
    const row = await prisma.appSettings.findUnique({ where: { key: "openrouter_api_key" } });
    if (row?.value) return row.value;
  } catch {
    // DB unavailable — continue to error
  }
  throw new Error("No OpenRouter API key configured. Add it in Settings → API Keys.");
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface CompletionOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export async function chat(
  messages: ChatMessage[],
  options: CompletionOptions = {}
): Promise<string> {
  const apiKey = await resolveApiKey();

  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
      "X-Title": "Creator AI Suite",
    },
    body: JSON.stringify({
      model: options.model ?? DEFAULT_MODEL,
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 2048,
    }),
  });

  if (!res.ok) {
    const raw = await res.text();
    let detail = raw;
    try {
      const parsed = JSON.parse(raw) as { error?: { message?: string } };
      if (parsed.error?.message) detail = parsed.error.message;
    } catch {}

    if (res.status === 401) {
      throw new Error("API key de OpenRouter inválida. Ve a Settings → API Keys y verifica tu key.");
    }
    if (res.status === 429) {
      throw new Error("Sin créditos en OpenRouter. Agrega saldo en openrouter.ai/credits e intenta de nuevo.");
    }
    throw new Error(`OpenRouter error ${res.status}: ${detail}`);
  }

  const data = await res.json();
  return data.choices[0].message.content as string;
}

/** Stream version — returns async iterable of text chunks */
export async function* chatStream(
  messages: ChatMessage[],
  options: CompletionOptions = {}
): AsyncGenerator<string> {
  const apiKey = await resolveApiKey();

  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
      "X-Title": "Creator AI Suite",
    },
    body: JSON.stringify({
      model: options.model ?? DEFAULT_MODEL,
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 2048,
      stream: true,
    }),
  });

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error(
        "API key de OpenRouter inválida o no encontrada. Ve a Settings → API Keys y verifica tu key."
      );
    }
    throw new Error(`OpenRouter stream error ${res.status}`);
  }

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split("\n").filter((l) => l.startsWith("data: "));

    for (const line of lines) {
      const json = line.slice(6);
      if (json === "[DONE]") return;
      try {
        const parsed = JSON.parse(json);
        const text = parsed.choices?.[0]?.delta?.content;
        if (text) yield text;
      } catch {
        // skip malformed chunks
      }
    }
  }
}

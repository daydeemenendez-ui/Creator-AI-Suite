const BASE_URL = process.env.MINIMAX_BASE_URL ?? "https://api.minimaxi.chat/v1";
const GROUP_ID = process.env.MINIMAX_GROUP_ID ?? "";
const DEFAULT_MODEL = process.env.MINIMAX_DEFAULT_MODEL ?? "MiniMax-Text-01";

async function resolveApiKey(): Promise<string> {
  if (process.env.MINIMAX_API_KEY) return process.env.MINIMAX_API_KEY;
  try {
    const { prisma } = await import("@/lib/prisma");
    const row = await prisma.appSettings.findUnique({ where: { key: "minimax_api_key" } });
    if (row?.value) return row.value;
  } catch {
    // DB unavailable
  }
  throw new Error("No MiniMax API key configured. Add it in Settings → API Keys.");
}

// ─────────────────────────────────────────────
// CHAT COMPLETIONS
// ─────────────────────────────────────────────

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

  const res = await fetch(`${BASE_URL}/text/chatcompletion_v2`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
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
    if (res.status === 401) throw new Error("API key de MiniMax inválida. Ve a Settings → API Keys y verifica tu key.");
    if (res.status === 429) throw new Error(`MiniMax 429 (rate limit): ${raw}`);
    throw new Error(`MiniMax error ${res.status}: ${raw}`);
  }

  const data = await res.json();
  return data.choices[0].message.content as string;
}

export async function* chatStream(
  messages: ChatMessage[],
  options: CompletionOptions = {}
): AsyncGenerator<string> {
  const apiKey = await resolveApiKey();

  const res = await fetch(`${BASE_URL}/text/chatcompletion_v2`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
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
    if (res.status === 401) throw new Error("API key de MiniMax inválida o no encontrada. Ve a Settings → API Keys y verifica tu key.");
    throw new Error(`MiniMax stream error ${res.status}`);
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

// ─────────────────────────────────────────────
// VOICE CLONING
// ─────────────────────────────────────────────

export interface CloneVoiceResult {
  voiceId: string;
  status: "success" | "processing" | "error";
}

export async function cloneVoice(
  audioBuffer: Uint8Array,
  fileName: string,
  voiceName: string
): Promise<CloneVoiceResult> {
  const apiKey = await resolveApiKey();
  const formData = new FormData();
  const blob = new Blob([audioBuffer.buffer as ArrayBuffer], { type: "audio/mpeg" });
  formData.append("file", blob, fileName);
  formData.append("voice_id", voiceName.replace(/\s+/g, "_").toLowerCase());

  const res = await fetch(`${BASE_URL}/voice_clone?GroupId=${GROUP_ID}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`MiniMax voice clone error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return {
    voiceId: data.voice_id ?? data.data?.voice_id,
    status: data.base_resp?.status_code === 0 ? "success" : "processing",
  };
}

// ─────────────────────────────────────────────
// TEXT-TO-SPEECH
// ─────────────────────────────────────────────

export interface TTSOptions {
  voiceId: string;
  text: string;
  speed?: number;
  vol?: number;
  pitch?: number;
}

export async function textToSpeech(options: TTSOptions): Promise<Buffer<ArrayBuffer>> {
  const apiKey = await resolveApiKey();

  const res = await fetch(`${BASE_URL}/t2a_v2?GroupId=${GROUP_ID}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "speech-01-turbo",
      text: options.text,
      stream: false,
      voice_setting: {
        voice_id: options.voiceId,
        speed: options.speed ?? 1.0,
        vol: options.vol ?? 1.0,
        pitch: options.pitch ?? 0,
      },
      audio_setting: {
        sample_rate: 32000,
        bitrate: 128000,
        format: "mp3",
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`MiniMax TTS error ${res.status}: ${err}`);
  }

  const data = await res.json();

  if (data.base_resp?.status_code !== 0) {
    throw new Error(`MiniMax TTS failed: ${data.base_resp?.status_msg}`);
  }

  const audioHex: string = data.data?.audio ?? data.audio;
  return Buffer.from(audioHex, "hex") as Buffer<ArrayBuffer>;
}

// ─────────────────────────────────────────────
// QUERY VOICE CLONE STATUS
// ─────────────────────────────────────────────

export async function getVoiceStatus(
  voiceId: string
): Promise<"ready" | "processing" | "error"> {
  const apiKey = await resolveApiKey();

  const res = await fetch(
    `${BASE_URL}/voice_clone/query?GroupId=${GROUP_ID}&voice_id=${voiceId}`,
    { headers: { Authorization: `Bearer ${apiKey}` } }
  );

  if (!res.ok) return "error";

  const data = await res.json();
  const code = data.base_resp?.status_code;
  if (code === 0) return "ready";
  if (code === 1) return "processing";
  return "error";
}

const BASE_URL = "https://dashscope.aliyuncs.com/api/v1/services/aigc/text2speech";

export interface AlibabaTTSOptions {
  text: string;
  model?: string;     // "cosyvoice-v2" | "cosyvoice-v1"
  voice?: string;     // preset voice ID
  speed?: number;     // -500 to 500, default 0
  pitch?: number;     // -500 to 500, default 0
  volume?: number;    // 0 to 100, default 50
}

async function resolveApiKey(): Promise<string> {
  if (process.env.ALIBABA_TTS_API_KEY) return process.env.ALIBABA_TTS_API_KEY;
  try {
    const { prisma } = await import("@/lib/prisma");
    const row = await prisma.appSettings.findUnique({ where: { key: "tts_api_key" } });
    if (row?.value) return row.value;
  } catch {
    // DB unavailable
  }
  throw new Error("No Alibaba TTS API key configured. Add it in Settings → API Keys (TTS API).");
}

export async function alibabaTTS(options: AlibabaTTSOptions): Promise<Buffer> {
  const apiKey = await resolveApiKey();

  const model = options.model ?? "cosyvoice-v2";
  const voice = options.voice ?? "longxiaochun"; // default Spanish-friendly preset

  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "X-DashScope-DataInspection": "enable",
    },
    body: JSON.stringify({
      model,
      input: {
        text: options.text,
        voice,
      },
      parameters: {
        text_type: "PlainText",
        rate: options.speed ?? 0,
        pitch: options.pitch ?? 0,
        volume: options.volume ?? 50,
        format: "mp3",
        sample_rate: 16000,
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Alibaba TTS error ${res.status}: ${err}`);
  }

  const contentType = res.headers.get("content-type") ?? "";
  if (contentType.includes("audio")) {
    const arrayBuffer = await res.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  const data = await res.json() as {
    output?: { audio?: string };
    code?: string;
    message?: string;
  };

  if (data.code && data.code !== "200") {
    throw new Error(`Alibaba TTS failed: ${data.message ?? data.code}`);
  }

  if (data.output?.audio) {
    return Buffer.from(data.output.audio, "base64");
  }

  throw new Error("Alibaba TTS: unexpected response format");
}

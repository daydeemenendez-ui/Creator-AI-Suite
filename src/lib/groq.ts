const GROQ_BASE_URL = "https://api.groq.com/openai/v1";

async function getApiKey(): Promise<string> {
  if (process.env.GROQ_API_KEY) return process.env.GROQ_API_KEY;
  try {
    const { prisma } = await import("@/lib/prisma");
    const row = await prisma.appSettings.findUnique({ where: { key: "groq_api_key" } });
    if (row?.value) return row.value;
  } catch {
    // DB unavailable
  }
  throw new Error("Groq API key no configurada. Ve a Configuración → API Keys y añade tu clave de Groq.");
}

/**
 * Transcribe an audio/video buffer using Groq Whisper.
 * Max file size: 25 MB. For video files, extract audio first with ffmpeg.
 * Supports: mp3, mp4, mpeg, mpga, m4a, wav, webm
 */
export async function transcribeAudio(
  audioBuffer: Buffer,
  fileName: string,
  language?: string
): Promise<string> {
  const apiKey = await getApiKey();

  const form = new FormData();
  const blob = new Blob([new Uint8Array(audioBuffer)], { type: guessMime(fileName) });
  form.append("file", blob, fileName);
  form.append("model", "whisper-large-v3-turbo"); // faster + cheaper, same quality
  form.append("response_format", "text");
  if (language) form.append("language", language);

  const res = await fetch(`${GROQ_BASE_URL}/audio/transcriptions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
  });

  if (!res.ok) {
    const err = await res.text();
    if (res.status === 413) throw new Error("El archivo es demasiado grande. Máximo 25 MB.");
    throw new Error(`Groq Whisper error ${res.status}: ${err}`);
  }

  const text = await res.text();
  return text.trim();
}

function guessMime(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase();
  const map: Record<string, string> = {
    mp3: "audio/mpeg",
    mp4: "video/mp4",
    m4a: "audio/mp4",
    wav: "audio/wav",
    webm: "audio/webm",
    ogg: "audio/ogg",
    mpga: "audio/mpeg",
  };
  return map[ext ?? ""] ?? "audio/mpeg";
}

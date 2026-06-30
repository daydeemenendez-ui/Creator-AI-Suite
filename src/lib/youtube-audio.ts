"use server";

// Downloads audio from a YouTube video using YouTube's internal Innertube API.
// No external packages required — uses plain fetch.

const INNERTUBE_URL = "https://www.youtube.com/youtubei/v1/player";

const ANDROID_CLIENT = {
  clientName: "ANDROID",
  clientVersion: "19.09.37",
  androidSdkVersion: 30,
  hl: "es",
  gl: "US",
};

const USER_AGENT =
  "com.google.android.youtube/19.09.37 (Linux; U; Android 11) gzip";

interface AudioFormat {
  url: string;
  mimeType: string;
  bitrate: number;
  contentLength?: string;
}

export async function downloadYouTubeAudio(
  videoId: string
): Promise<{ buffer: Buffer; fileName: string }> {
  // 1. Call Innertube player API to get stream manifest
  const res = await fetch(INNERTUBE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": USER_AGENT,
      "X-YouTube-Client-Name": "3",
      "X-YouTube-Client-Version": ANDROID_CLIENT.clientVersion,
      Origin: "https://www.youtube.com",
    },
    body: JSON.stringify({
      context: { client: ANDROID_CLIENT },
      videoId,
      contentCheckOk: true,
      racyCheckOk: true,
    }),
  });

  if (!res.ok) {
    throw new Error(`YouTube Innertube API respondió ${res.status}. Verifica que el video sea público.`);
  }

  const data = await res.json();

  if (data?.playabilityStatus?.status === "UNPLAYABLE" || data?.playabilityStatus?.status === "ERROR") {
    const reason = data?.playabilityStatus?.reason ?? "Video no disponible";
    throw new Error(`Video no accesible: ${reason}`);
  }

  // 2. Find best audio-only stream with a direct URL (no cipher needed on ANDROID client)
  const formats: AudioFormat[] = (data?.streamingData?.adaptiveFormats ?? [])
    .filter((f: AudioFormat) => f.mimeType?.startsWith("audio/") && f.url)
    .sort((a: AudioFormat, b: AudioFormat) => (b.bitrate ?? 0) - (a.bitrate ?? 0));

  if (!formats.length) {
    throw new Error("No se encontraron streams de audio para este video. Puede estar restringido.");
  }

  // Prefer mp4 audio (m4a) for Groq compatibility, fallback to webm
  const best =
    formats.find((f) => f.mimeType.includes("mp4")) ?? formats[0];

  // 3. Download — cap at 24 MB to stay within Groq's 25 MB limit
  const MAX_BYTES = 24 * 1024 * 1024;
  const audioRes = await fetch(best.url, {
    headers: {
      "User-Agent": USER_AGENT,
      Range: `bytes=0-${MAX_BYTES}`,
    },
  });

  if (!audioRes.ok && audioRes.status !== 206) {
    throw new Error(`Error al descargar audio del video: ${audioRes.status}`);
  }

  const arrayBuffer = await audioRes.arrayBuffer();
  const ext = best.mimeType.includes("webm") ? "webm" : "m4a";

  return {
    buffer: Buffer.from(arrayBuffer),
    fileName: `audio-${videoId}.${ext}`,
  };
}

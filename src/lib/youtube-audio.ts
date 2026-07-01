// Extracts transcript from YouTube by parsing the page HTML directly.
// Works from server without API keys. Uses the same data source that
// youtube-transcript npm package uses internally.

export async function downloadYouTubeAudio(
  videoId: string
): Promise<{ buffer: Buffer; fileName: string }> {
  // This function is kept for file upload compatibility.
  // For YouTube URLs we use getYouTubeTranscript() instead.
  throw new Error("Use getYouTubeTranscript() for YouTube URLs.");
}

export async function getYouTubeTranscript(videoId: string): Promise<string> {
  const pageUrl = `https://www.youtube.com/watch?v=${videoId}`;

  // Fetch the watch page like a browser would
  const pageRes = await fetch(pageUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
  });

  if (!pageRes.ok) {
    throw new Error(`No se pudo acceder al video (${pageRes.status}).`);
  }

  const html = await pageRes.text();

  // Extract ytInitialPlayerResponse from the page script
  const playerMatch = html.match(/ytInitialPlayerResponse\s*=\s*(\{.+?\})\s*;/);
  if (!playerMatch) {
    throw new Error(
      "No se pudo leer la información del video. Puede ser privado o estar restringido."
    );
  }

  let playerData: {
    playabilityStatus?: { status: string; reason?: string };
    captions?: {
      playerCaptionsTracklistRenderer?: {
        captionTracks?: { baseUrl: string; languageCode: string; kind?: string }[];
      };
    };
    videoDetails?: { title?: string };
  };

  try {
    playerData = JSON.parse(playerMatch[1]);
  } catch {
    throw new Error("Error al procesar los datos del video.");
  }

  // Check playability
  const status = playerData?.playabilityStatus?.status;
  if (status && status !== "OK" && status !== "LIVE_STREAM_OFFLINE") {
    const reason = playerData?.playabilityStatus?.reason ?? status;
    throw new Error(`Video no disponible: ${reason}`);
  }

  // Get caption tracks
  const tracks =
    playerData?.captions?.playerCaptionsTracklistRenderer?.captionTracks ?? [];

  if (!tracks.length) {
    throw new Error(
      "Este video no tiene subtítulos ni captions disponibles. Sube el archivo de video directamente para transcribirlo con Groq Whisper."
    );
  }

  // Priority: Spanish → Spanish auto-generated → English → first available
  const preferred =
    tracks.find((t) => t.languageCode.startsWith("es") && t.kind !== "asr") ??
    tracks.find((t) => t.languageCode.startsWith("es")) ??
    tracks.find((t) => t.languageCode.startsWith("en") && t.kind !== "asr") ??
    tracks.find((t) => t.languageCode.startsWith("en")) ??
    tracks[0];

  // Fetch the caption XML
  const captionUrl = preferred.baseUrl + "&fmt=json3";
  const captionRes = await fetch(captionUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
  });

  if (!captionRes.ok) {
    throw new Error(`Error al obtener los subtítulos (${captionRes.status}).`);
  }

  const captionBody = await captionRes.text();
  if (!captionBody.trim()) {
    throw new Error("Los subtítulos están vacíos.");
  }

  let captionData: { events?: { segs?: { utf8: string }[]; tStartMs?: number }[] };
  try {
    captionData = JSON.parse(captionBody);
  } catch {
    throw new Error("Error al procesar los subtítulos del video.");
  }

  const text = (captionData.events ?? [])
    .filter((e) => e.segs)
    .map((e) =>
      e.segs!
        .map((s) => s.utf8)
        .join("")
        .replace(/\n/g, " ")
    )
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  if (!text || text.length < 20) {
    throw new Error(
      "No se pudo extraer texto de los subtítulos. Sube el archivo de video directamente."
    );
  }

  return text;
}

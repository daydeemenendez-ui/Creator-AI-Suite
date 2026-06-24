const BASE_URL = process.env.MINIMAX_BASE_URL ?? "https://api.minimaxi.chat/v1";
const GROUP_ID = process.env.MINIMAX_GROUP_ID ?? "";
const API_KEY = process.env.MINIMAX_API_KEY ?? "";

// ─────────────────────────────────────────────
// VOICE CLONING
// ─────────────────────────────────────────────

export interface CloneVoiceResult {
  voiceId: string;
  status: "success" | "processing" | "error";
}

/**
 * Upload an audio file to MiniMax and initiate voice cloning.
 * Returns the voice_id assigned by MiniMax.
 */
export async function cloneVoice(
  audioBuffer: Uint8Array,
  fileName: string,
  voiceName: string
): Promise<CloneVoiceResult> {
  const formData = new FormData();
  const blob = new Blob([audioBuffer.buffer as ArrayBuffer], { type: "audio/mpeg" });
  formData.append("file", blob, fileName);
  formData.append("voice_id", voiceName.replace(/\s+/g, "_").toLowerCase());

  const res = await fetch(
    `${BASE_URL}/voice_clone?GroupId=${GROUP_ID}`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${API_KEY}` },
      body: formData,
    }
  );

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
  speed?: number;   // 0.5 – 2.0
  vol?: number;     // 0.1 – 10.0
  pitch?: number;   // -12 – 12
}

/**
 * Convert text to speech using a cloned voice.
 * Returns raw audio buffer (mp3).
 */
export async function textToSpeech(options: TTSOptions): Promise<Buffer<ArrayBuffer>> {
  const res = await fetch(
    `${BASE_URL}/t2a_v2?GroupId=${GROUP_ID}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
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
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`MiniMax TTS error ${res.status}: ${err}`);
  }

  const data = await res.json();

  if (data.base_resp?.status_code !== 0) {
    throw new Error(`MiniMax TTS failed: ${data.base_resp?.status_msg}`);
  }

  // MiniMax returns audio as hex-encoded string in data.audio
  const audioHex: string = data.data?.audio ?? data.audio;
  const audioBuffer = Buffer.from(audioHex, "hex") as Buffer<ArrayBuffer>;
  return audioBuffer;
}

// ─────────────────────────────────────────────
// QUERY VOICE CLONE STATUS
// ─────────────────────────────────────────────

export async function getVoiceStatus(
  voiceId: string
): Promise<"ready" | "processing" | "error"> {
  const res = await fetch(
    `${BASE_URL}/voice_clone/query?GroupId=${GROUP_ID}&voice_id=${voiceId}`,
    { headers: { Authorization: `Bearer ${API_KEY}` } }
  );

  if (!res.ok) return "error";

  const data = await res.json();
  const code = data.base_resp?.status_code;
  if (code === 0) return "ready";
  if (code === 1) return "processing";
  return "error";
}

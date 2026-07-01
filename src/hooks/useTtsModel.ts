"use client";

import { useEffect, useState } from "react";

export interface TtsModel {
  id: string;
  name: string;
  provider: string;
}

export const TTS_MODELS: TtsModel[] = [
  { id: "alibaba/cosyvoice-v2",    name: "CosyVoice v2",       provider: "Alibaba" },
  { id: "alibaba/cosyvoice-v1",    name: "CosyVoice v1",       provider: "Alibaba" },
  { id: "minimax/speech-02-hd",    name: "Speech-02 HD",       provider: "MiniMax" },
  { id: "minimax/speech-02-turbo", name: "Speech-02 Turbo",    provider: "MiniMax" },
  { id: "elevenlabs/multilingual", name: "Multilingual v2",    provider: "ElevenLabs" },
  { id: "elevenlabs/turbo-v2",     name: "Turbo v2.5",         provider: "ElevenLabs" },
  { id: "openai/tts-1-hd",         name: "TTS-1 HD",           provider: "OpenAI" },
  { id: "openai/tts-1",            name: "TTS-1",              provider: "OpenAI" },
  { id: "google/cloud-tts",        name: "Cloud TTS",          provider: "Google" },
  { id: "azure/neural-tts",        name: "Neural TTS",         provider: "Azure" },
];

// Persisted in the DB (voice_studio_tts_model in app_settings), not
// localStorage, so it survives across devices/browsers.
export function useTtsModel() {
  const [model, setModelState] = useState<TtsModel>(TTS_MODELS[0]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/voice/preferences");
        if (!res.ok) return;
        const data = (await res.json()) as { ttsModel?: string };
        if (cancelled || !data.ttsModel) return;
        const found = TTS_MODELS.find((m) => m.id === data.ttsModel);
        if (found) setModelState(found);
      } catch {
        // Keep default model if the DB is unreachable
      }
    })();
    return () => { cancelled = true; };
  }, []);

  function setModel(m: TtsModel) {
    setModelState(m);
    void fetch("/api/voice/preferences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ttsModel: m.id }),
    });
  }

  return { model, setModel };
}

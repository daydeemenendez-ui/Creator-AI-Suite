"use client";

import { useState } from "react";

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

const STORAGE_KEY = "creator_ai_tts_model";

function readFromStorage(): TtsModel {
  if (typeof window === "undefined") return TTS_MODELS[0];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as TtsModel) : TTS_MODELS[0];
  } catch {
    return TTS_MODELS[0];
  }
}

export function useTtsModel() {
  const [model, setModelState] = useState<TtsModel>(readFromStorage);

  function setModel(m: TtsModel) {
    setModelState(m);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(m));
  }

  return { model, setModel };
}

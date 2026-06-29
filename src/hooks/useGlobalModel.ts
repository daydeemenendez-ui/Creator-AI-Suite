"use client";

import { useState, useEffect } from "react";

export interface GlobalModel {
  id: string;
  name: string;
}

const STORAGE_KEY = "creator_ai_global_model";
const DEFAULT: GlobalModel = {
  id: "anthropic/claude-sonnet-4-6",
  name: "Claude Sonnet 4.6",
};

function readLocalCache(): GlobalModel {
  if (typeof window === "undefined") return DEFAULT;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as GlobalModel) : DEFAULT;
  } catch {
    return DEFAULT;
  }
}

function writeLocalCache(m: GlobalModel) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(m));
  } catch {}
}

export function useGlobalModel() {
  // Start with localStorage cache so UI shows something instantly
  const [model, setModelState] = useState<GlobalModel>(readLocalCache);

  // On mount, fetch the real value from Supabase and update if different
  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data: Record<string, string>) => {
        const raw = data.playgroundModel;
        if (!raw) return;
        try {
          const saved = JSON.parse(raw) as GlobalModel;
          if (saved.id && saved.id !== model.id) {
            setModelState(saved);
            writeLocalCache(saved);
          }
        } catch {}
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function setModel(m: GlobalModel) {
    setModelState(m);
    writeLocalCache(m);
    // Persist to Supabase
    fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playgroundModel: JSON.stringify(m) }),
    }).catch(() => {});
  }

  return { model, setModel };
}

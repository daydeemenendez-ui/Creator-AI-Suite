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

export function useGlobalModel() {
  const [model, setModelState] = useState<GlobalModel>(() => {
    if (typeof window === "undefined") return DEFAULT;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as GlobalModel) : DEFAULT;
    } catch {
      return DEFAULT;
    }
  });

  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          setModelState(JSON.parse(e.newValue) as GlobalModel);
        } catch {}
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  function setModel(m: GlobalModel) {
    setModelState(m);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(m));
    // Notify other tabs/components
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: STORAGE_KEY,
        newValue: JSON.stringify(m),
      })
    );
  }

  return { model, setModel };
}

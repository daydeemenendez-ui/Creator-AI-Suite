"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Send, Bot, User, Sparkles, Trash2, Sliders, ChevronDown,
  Loader2, AlertCircle, Search, X, Zap, DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useGlobalModel } from "@/hooks/useGlobalModel";

type Message = { role: "user" | "assistant"; content: string };

interface ORModel {
  id: string;
  name: string;
  context: number;
  promptPrice: number;
  completionPrice: number;
}

const FEATURED = [
  "anthropic/claude-sonnet-4-6",
  "anthropic/claude-haiku-4-5",
  "openai/gpt-4o",
  "openai/gpt-4o-mini",
  "google/gemini-2.0-flash-001",
  "meta-llama/llama-3.3-70b-instruct",
  "deepseek/deepseek-r1",
  "mistralai/mistral-large",
];

const EXAMPLE_PROMPTS = [
  "Explica qué es el CTR en YouTube y cómo mejorarlo",
  "Dame 5 ganchos para un video sobre productividad",
  "Escribe una descripción SEO para un video de cocina",
  "¿Cuál es la diferencia entre Shorts y videos largos?",
];

function formatCtx(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

function formatPrice(p: number) {
  if (p === 0) return "gratis";
  if (p < 0.01) return `$${p.toFixed(4)}`;
  return `$${p.toFixed(3)}`;
}

export function PlaygroundPage() {
  const { model: globalModel, setModel: setGlobalModel } = useGlobalModel();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [model, setModel] = useState<ORModel | null>(null);
  const [allModels, setAllModels] = useState<ORModel[]>([]);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [modelsError, setModelsError] = useState<string | null>(null);
  const [temperature, setTemperature] = useState(0.7);
  const [showSettings, setShowSettings] = useState(false);
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [modelSearch, setModelSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const loadModels = useCallback(async () => {
    setModelsLoading(true);
    setModelsError(null);
    try {
      const res = await fetch("/api/playground/models");
      const data = await res.json() as { models?: ORModel[]; error?: string };
      if (data.error) { setModelsError(data.error); return; }
      setAllModels(data.models ?? []);
      if (!model && data.models?.length) {
        // Read saved model id directly from localStorage to avoid stale closure
        let savedId = "anthropic/claude-sonnet-4-6";
        try {
          const raw = localStorage.getItem("creator_ai_global_model");
          if (raw) savedId = (JSON.parse(raw) as { id: string }).id;
        } catch {}
        const restored =
          data.models.find((m) => m.id === savedId)
          ?? data.models.find((m) => m.id === "anthropic/claude-sonnet-4-6")
          ?? data.models[0];
        setModel(restored);
      }
    } catch {
      setModelsError("No se pudieron cargar los modelos");
    } finally {
      setModelsLoading(false);
    }
  }, [model]);

  useEffect(() => { loadModels(); }, []);

  useEffect(() => {
    if (showModelPicker) setTimeout(() => searchRef.current?.focus(), 50);
  }, [showModelPicker]);

  const filteredModels = allModels.filter((m) =>
    m.name.toLowerCase().includes(modelSearch.toLowerCase()) ||
    m.id.toLowerCase().includes(modelSearch.toLowerCase())
  );

  const featuredModels = filteredModels.filter((m) => FEATURED.includes(m.id));
  const otherModels    = filteredModels.filter((m) => !FEATURED.includes(m.id));

  async function handleSend() {
    const text = input.trim();
    if (!text || loading || !model) return;

    const userMsg: Message = { role: "user", content: text };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/playground", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages, model: model.id, temperature }),
      });
      const data = await res.json() as { content?: string; error?: string };
      if (!res.ok || data.error) {
        setError(data.error ?? "Error al conectar con la IA");
      } else {
        setMessages((prev) => [...prev, { role: "assistant", content: data.content! }]);
      }
    } catch {
      setError("No se pudo conectar. Verifica tu API key en Settings → API Keys.");
    } finally {
      setLoading(false);
    }
  }

  function selectModel(m: ORModel) {
    setModel(m);
    setGlobalModel({ id: m.id, name: m.name }); // persist globally for all pages
    setShowModelPicker(false);
    setModelSearch("");
  }

  return (
    <div className="flex h-full overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="border-b border-white/[0.07] px-6 py-3 flex items-center gap-3 bg-[#0d0d0d]/60">
          <div className="relative">
            <button
              onClick={() => setShowModelPicker((v) => !v)}
              className="flex items-center gap-2 bg-[#141414] border border-white/10 rounded-xl px-3 py-1.5 text-sm text-white hover:border-white/[0.18] transition-all max-w-[260px]"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#FF0033] flex-shrink-0" />
              <span className="truncate">{modelsLoading ? "Cargando modelos..." : (model?.name ?? "Selecciona un modelo")}</span>
              <ChevronDown className="w-3 h-3 text-zinc-600 flex-shrink-0" />
            </button>

            {/* Model picker dropdown */}
            {showModelPicker && (
              <div className="absolute top-full mt-1 left-0 z-30 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-[0_16px_48px_rgba(0,0,0,0.7)] w-[420px] flex flex-col max-h-[520px]">
                {/* Search */}
                <div className="p-3 border-b border-white/[0.07] flex items-center gap-2 flex-shrink-0">
                  <Search className="w-3.5 h-3.5 text-zinc-600 flex-shrink-0" />
                  <input
                    ref={searchRef}
                    value={modelSearch}
                    onChange={(e) => setModelSearch(e.target.value)}
                    placeholder="Buscar modelos..."
                    className="flex-1 bg-transparent text-sm text-white placeholder:text-zinc-600 outline-none"
                  />
                  {modelSearch && (
                    <button onClick={() => setModelSearch("")} className="text-zinc-600 hover:text-white transition-colors">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="overflow-y-auto flex-1 p-2">
                  {modelsError && (
                    <div className="flex items-center gap-2 text-red-400 text-xs p-3">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {modelsError}
                    </div>
                  )}

                  {!modelsError && filteredModels.length === 0 && (
                    <p className="text-xs text-zinc-600 text-center py-6">No se encontraron modelos</p>
                  )}

                  {featuredModels.length > 0 && (
                    <>
                      <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider px-3 py-2">Destacados</p>
                      {featuredModels.map((m) => (
                        <ModelRow key={m.id} m={m} active={model?.id === m.id} onSelect={selectModel} />
                      ))}
                    </>
                  )}

                  {otherModels.length > 0 && (
                    <>
                      <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider px-3 py-2 mt-1">
                        Todos los modelos ({otherModels.length})
                      </p>
                      {otherModels.map((m) => (
                        <ModelRow key={m.id} m={m} active={model?.id === m.id} onSelect={selectModel} />
                      ))}
                    </>
                  )}
                </div>

                <div className="border-t border-white/[0.07] p-2 flex-shrink-0">
                  <p className="text-[10px] text-zinc-700 text-center">{allModels.length} modelos disponibles vía OpenRouter</p>
                </div>
              </div>
            )}
          </div>

          {model && (
            <div className="flex items-center gap-2">
              <Badge className="text-[10px] bg-[#FF0033]/10 text-[#FF0033] border-[#FF0033]/20">OpenRouter</Badge>
              <span className="text-[10px] text-zinc-600 flex items-center gap-1">
                <Zap className="w-2.5 h-2.5" />
                {formatCtx(model.context)} ctx
              </span>
              <span className="text-[10px] text-zinc-600 flex items-center gap-1">
                <DollarSign className="w-2.5 h-2.5" />
                {formatPrice(model.promptPrice)}/M tokens
              </span>
            </div>
          )}

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setShowSettings((v) => !v)}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl border transition-all ${
                showSettings ? "bg-[#FF0033]/10 border-[#FF0033]/25 text-[#FF0033]" : "border-white/10 text-zinc-500 hover:text-white hover:border-white/[0.18]"
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              Parámetros
            </button>
            {messages.length > 0 && (
              <button
                onClick={() => { setMessages([]); setError(null); }}
                className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-red-400 border border-white/10 hover:border-red-500/25 px-3 py-1.5 rounded-xl transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Limpiar
              </button>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6" onClick={() => setShowModelPicker(false)}>
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-6">
              <div className="w-14 h-14 rounded-2xl bg-[#FF0033]/10 flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-[#FF0033]" />
              </div>
              <div className="text-center">
                <h2 className="text-lg font-bold text-white mb-1 tracking-tight">AI Playground</h2>
                <p className="text-sm text-zinc-600 max-w-xs">
                  {allModels.length > 0
                    ? `${allModels.length} modelos disponibles vía OpenRouter. Selecciona uno arriba.`
                    : "Cargando modelos de OpenRouter..."}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 w-full max-w-lg">
                {EXAMPLE_PROMPTS.map((p) => (
                  <button
                    key={p}
                    onClick={() => setInput(p)}
                    className="text-left text-xs text-zinc-600 hover:text-zinc-200 bg-[#141414] hover:bg-[#181818] border border-white/[0.08] hover:border-[#FF0033]/25 rounded-xl p-3 transition-all"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
              <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                msg.role === "assistant" ? "bg-[#FF0033]/15 border border-[#FF0033]/25" : "bg-white/[0.06] border border-white/10"
              }`}>
                {msg.role === "assistant" ? <Bot className="w-4 h-4 text-[#FF0033]" /> : <User className="w-4 h-4 text-zinc-500" />}
              </div>
              <div className={`max-w-2xl rounded-2xl px-4 py-3 text-sm leading-6 whitespace-pre-wrap ${
                msg.role === "assistant"
                  ? "bg-[#141414] border border-white/[0.08] text-zinc-200 rounded-tl-sm"
                  : "bg-[#FF0033]/10 border border-[#FF0033]/20 text-white rounded-tr-sm"
              }`}>
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center bg-[#FF0033]/15 border border-[#FF0033]/25">
                <Bot className="w-4 h-4 text-[#FF0033]" />
              </div>
              <div className="bg-[#141414] border border-white/[0.08] rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 text-[#FF0033] animate-spin" />
                <span className="text-xs text-zinc-600">{model?.name} está respondiendo...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-white/[0.07] bg-[#0d0d0d]/60">
          <div className="flex gap-3 items-end">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder={model ? `Mensaje a ${model.name}...` : "Selecciona un modelo primero..."}
              className="flex-1 bg-[#141414] border-white/10 text-white placeholder:text-zinc-700 text-sm resize-none min-h-[44px] max-h-40 focus:border-[#FF0033]/40"
              rows={1}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || loading || !model}
              className="bg-[#FF0033] hover:bg-[#e8002e] text-white h-11 w-11 p-0 flex-shrink-0 shadow-[0_0_16px_rgba(255,0,51,0.2)] hover:shadow-[0_0_20px_rgba(255,0,51,0.3)] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Settings panel */}
      {showSettings && (
        <div className="w-60 flex-shrink-0 border-l border-white/[0.07] bg-[#0d0d0d] p-5 space-y-6 overflow-y-auto">
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-zinc-600 uppercase tracking-wider">Temperature</p>
              <span className="text-xs font-mono text-[#FF0033]">{temperature.toFixed(1)}</span>
            </div>
            <input
              type="range" min={0} max={1} step={0.1} value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full accent-[#FF0033]"
            />
            <div className="flex justify-between text-[10px] text-zinc-700 mt-1">
              <span>Preciso</span><span>Creativo</span>
            </div>
          </div>

          {model && (
            <Card className="bg-[#141414] border-white/[0.08] p-3 space-y-2">
              <p className="text-xs font-semibold text-white truncate">{model.name}</p>
              <div className="space-y-1 text-[10px] text-zinc-600">
                <div className="flex justify-between"><span>Contexto</span><span className="text-zinc-400">{formatCtx(model.context)} tokens</span></div>
                <div className="flex justify-between"><span>Input</span><span className="text-zinc-400">{formatPrice(model.promptPrice)}/M</span></div>
                <div className="flex justify-between"><span>Output</span><span className="text-zinc-400">{formatPrice(model.completionPrice)}/M</span></div>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

function ModelRow({ m, active, onSelect }: { m: ORModel; active: boolean; onSelect: (m: ORModel) => void }) {
  return (
    <button
      onClick={() => onSelect(m)}
      className={`w-full text-left px-3 py-2.5 rounded-xl transition-all flex items-center justify-between gap-3 ${
        active ? "bg-[#FF0033]/10 border border-[#FF0033]/20" : "hover:bg-white/[0.04] border border-transparent"
      }`}
    >
      <div className="min-w-0">
        <p className={`text-sm truncate ${active ? "text-white" : "text-zinc-300"}`}>{m.name}</p>
        <p className="text-[10px] text-zinc-600 truncate">{m.id}</p>
      </div>
      <div className="flex-shrink-0 text-right space-y-0.5">
        <p className="text-[10px] text-zinc-600">{formatCtx(m.context)} ctx</p>
        <p className="text-[10px] text-zinc-700">{formatPrice(m.promptPrice)}/M</p>
      </div>
    </button>
  );
}

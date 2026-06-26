"use client";

import { useState } from "react";
import { Send, Bot, User, Sparkles, Trash2, Sliders, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

type Message = { role: "user" | "assistant"; content: string };

const MODELS = [
  { id: "claude-sonnet", label: "Claude Sonnet 4.6" },
  { id: "claude-haiku",  label: "Claude Haiku 4.5" },
  { id: "gpt-4o",        label: "GPT-4o" },
  { id: "gpt-4o-mini",   label: "GPT-4o mini" },
];

const EXAMPLE_PROMPTS = [
  "Explica qué es el CTR en YouTube y cómo mejorarlo",
  "Dame 5 ganchos para un video sobre productividad",
  "Escribe una descripción SEO para un video de cocina",
  "¿Cuál es la diferencia entre Shorts y videos largos?",
];

export function PlaygroundPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [model, setModel] = useState(MODELS[0]);
  const [temperature, setTemperature] = useState(0.7);
  const [showSettings, setShowSettings] = useState(false);
  const [showModelMenu, setShowModelMenu] = useState(false);

  function handleSend() {
    const text = input.trim();
    if (!text) return;
    const userMsg: Message = { role: "user", content: text };
    const assistantMsg: Message = {
      role: "assistant",
      content: `[${model.label} · temp ${temperature}] Conecta OpenRouter para respuestas reales. Tu mensaje fue: "${text}"`,
    };
    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setInput("");
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Main chat */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="border-b border-white/[0.07] px-6 py-3 flex items-center gap-3 bg-[#0d0d0d]/60">
          <div className="relative">
            <button
              onClick={() => setShowModelMenu((v) => !v)}
              className="flex items-center gap-2 bg-[#141414] border border-white/10 rounded-xl px-3 py-1.5 text-sm text-white hover:border-white/[0.18] transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#FF0033]" />
              {model.label}
              <ChevronDown className="w-3 h-3 text-zinc-600" />
            </button>
            {showModelMenu && (
              <div className="absolute top-full mt-1 left-0 z-20 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] overflow-hidden w-48">
                {MODELS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => { setModel(m); setShowModelMenu(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                      model.id === m.id
                        ? "bg-[#FF0033]/10 text-white"
                        : "text-zinc-500 hover:bg-white/[0.04] hover:text-white"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Badge className="text-[10px] bg-[#FF0033]/10 text-[#FF0033] border-[#FF0033]/20">
            Playground
          </Badge>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setShowSettings((v) => !v)}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl border transition-all ${
                showSettings
                  ? "bg-[#FF0033]/10 border-[#FF0033]/25 text-[#FF0033]"
                  : "border-white/10 text-zinc-500 hover:text-white hover:border-white/[0.18]"
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              Parámetros
            </button>
            {messages.length > 0 && (
              <button
                onClick={() => setMessages([])}
                className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-red-400 border border-white/10 hover:border-red-500/25 px-3 py-1.5 rounded-xl transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Limpiar
              </button>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-6">
              <div className="w-14 h-14 rounded-2xl bg-[#FF0033]/10 flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-[#FF0033]" />
              </div>
              <div className="text-center">
                <h2 className="text-lg font-bold text-white mb-1 tracking-tight">AI Playground</h2>
                <p className="text-sm text-zinc-600 max-w-xs">Chat libre sin estructura. Experimenta con prompts y modelos.</p>
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
              <div
                className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                  msg.role === "assistant"
                    ? "bg-[#FF0033]/15 border border-[#FF0033]/25"
                    : "bg-white/[0.06] border border-white/10"
                }`}
              >
                {msg.role === "assistant"
                  ? <Bot className="w-4 h-4 text-[#FF0033]" />
                  : <User className="w-4 h-4 text-zinc-500" />}
              </div>
              <div
                className={`max-w-2xl rounded-2xl px-4 py-3 text-sm leading-6 ${
                  msg.role === "assistant"
                    ? "bg-[#141414] border border-white/[0.08] text-zinc-200 rounded-tl-sm"
                    : "bg-[#FF0033]/10 border border-[#FF0033]/20 text-white rounded-tr-sm"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-white/[0.07] bg-[#0d0d0d]/60">
          <div className="flex gap-3 items-end">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
              }}
              placeholder="Escribe tu prompt aquí... (Enter para enviar, Shift+Enter nueva línea)"
              className="flex-1 bg-[#141414] border-white/10 text-white placeholder:text-zinc-700 text-sm resize-none min-h-[44px] max-h-40 focus:border-[#FF0033]/40"
              rows={1}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim()}
              className="bg-[#FF0033] hover:bg-[#e8002e] text-white h-11 w-11 p-0 flex-shrink-0 shadow-[0_0_16px_rgba(255,0,51,0.2)] hover:shadow-[0_0_20px_rgba(255,0,51,0.3)] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Settings panel */}
      {showSettings && (
        <div className="w-64 flex-shrink-0 border-l border-white/[0.07] bg-[#0d0d0d] p-5 space-y-6 overflow-y-auto">
          <div>
            <p className="text-xs font-semibold text-zinc-600 uppercase tracking-wider mb-3">Modelo</p>
            <div className="space-y-1.5">
              {MODELS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setModel(m)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all ${
                    model.id === m.id
                      ? "bg-[#FF0033]/10 text-white border border-[#FF0033]/25"
                      : "text-zinc-500 hover:bg-white/[0.04] hover:text-white border border-transparent"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-zinc-600 uppercase tracking-wider">Temperature</p>
              <span className="text-xs font-mono text-[#FF0033]">{temperature.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.1}
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full accent-[#FF0033]"
            />
            <div className="flex justify-between text-[10px] text-zinc-700 mt-1">
              <span>Preciso</span>
              <span>Creativo</span>
            </div>
          </div>

          <Card className="bg-[#141414] border-white/[0.08] p-3">
            <p className="text-[10px] text-zinc-600 leading-4">
              Conecta tu API Key de OpenRouter en Settings para activar los modelos reales.
            </p>
          </Card>
        </div>
      )}
    </div>
  );
}

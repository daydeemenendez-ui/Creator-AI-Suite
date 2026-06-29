"use client";

import { useState, useEffect, useRef } from "react";
import {
  Send, FileText, Lightbulb, Scissors, Search, Mail, Wand2,
  Copy, Download, RefreshCw, Sparkles, Bot, User, Trash2,
  Library, Loader2, BookmarkPlus, Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// ── Types ──────────────────────────────────────────────────────────────────

interface ContentOutput {
  id: string;
  type: string;
  title: string;
  body: string;
  createdAt: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// ── Constants ──────────────────────────────────────────────────────────────

const TYPE_MAP: Record<string, string> = {
  ideas:      "IDEA",
  guiones:    "SCRIPT",
  shorts:     "SHORTS_SCRIPT",
  "seo pack": "SEO_PACK",
  email:      "EMAIL",
  posts:      "POST",
};

const TYPE_LABEL: Record<string, string> = {
  IDEA:          "Idea",
  SCRIPT:        "Guión",
  SHORTS_SCRIPT: "Short",
  SEO_PACK:      "SEO Pack",
  EMAIL:         "Email",
  POST:          "Post",
};

const SAVE_OPTIONS = [
  { label: "Idea",     value: "IDEA",          color: "#F59E0B" },
  { label: "Guión",    value: "SCRIPT",         color: "#3B82F6" },
  { label: "Short",    value: "SHORTS_SCRIPT",  color: "#A855F7" },
  { label: "SEO Pack", value: "SEO_PACK",       color: "#10B981" },
  { label: "Email",    value: "EMAIL",           color: "#FF6B00" },
  { label: "Post",     value: "POST",            color: "#EC4899" },
];

const contentTypes = [
  { icon: Lightbulb, label: "Ideas",    color: "#F59E0B" },
  { icon: FileText,  label: "Guiones",  color: "#3B82F6" },
  { icon: Scissors,  label: "Shorts",   color: "#A855F7" },
  { icon: Search,    label: "SEO Pack", color: "#10B981" },
  { icon: Mail,      label: "Email",    color: "#FF6B00" },
  { icon: FileText,  label: "Posts",    color: "#EC4899" },
];

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    role: "assistant",
    content:
      "¡Hola! Soy tu asistente de contenido IA. Puedo ayudarte a crear guiones, ideas de videos, posts para redes sociales, descripciones SEO y mucho más. ¿Con qué quieres empezar?",
  },
];

// ── Save Dropdown ──────────────────────────────────────────────────────────

function SaveDropdown({
  content,
  onSaved,
}: {
  content: string;
  onSaved: (type: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleSave(type: string) {
    setSaving(true);
    setOpen(false);
    const firstLine = content.replace(/[#*`]/g, "").split("\n")[0].trim().slice(0, 80);
    const fd = new FormData();
    fd.append("action", "save_output");
    fd.append("type", type);
    fd.append("title", firstLine || "Contenido desde chat");
    fd.append("body", content);
    await fetch("/api/content", { method: "POST", body: fd });
    setSaving(false);
    setSaved(true);
    onSaved(type);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-[11px] text-zinc-600 hover:text-white transition-colors"
      >
        {saving ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : saved ? (
          <Check className="w-3 h-3 text-emerald-400" />
        ) : (
          <BookmarkPlus className="w-3 h-3" />
        )}
        {saved ? "Guardado" : "Guardar"}
      </button>

      {open && (
        <div className="absolute bottom-7 left-0 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-xl z-50 py-1.5 min-w-[140px]">
          <p className="text-[10px] text-zinc-600 px-3 py-1 uppercase tracking-wider">
            Guardar como…
          </p>
          {SAVE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleSave(opt.value)}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-zinc-300 hover:bg-white/[0.05] hover:text-white transition-colors"
            >
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: opt.color }}
              />
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Component ──────────────────────────────────────────────────────────────

export function ContentPage() {
  const [message, setMessage]             = useState("");
  const [activeContent, setActiveContent] = useState("todos");
  const [activeTab, setActiveTab]         = useState("chat");
  const [messages, setMessages]           = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [isSending, setIsSending]         = useState(false);
  const [outputs, setOutputs]             = useState<ContentOutput[]>([]);
  const [loadingLib, setLoadingLib]       = useState(false);
  const [deletingId, setDeletingId]       = useState<string | null>(null);
  const [copiedIdx, setCopiedIdx]         = useState<number | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  function goToSection(key: string) {
    setActiveContent(key);
    setActiveTab("library");
  }

  // ── Fetch library ──────────────────────────────────────────────────────

  async function fetchOutputs() {
    setLoadingLib(true);
    try {
      const res = await fetch("/api/content");
      if (res.ok) {
        const data = await res.json() as { outputs: ContentOutput[] };
        setOutputs(data.outputs ?? []);
      }
    } finally {
      setLoadingLib(false);
    }
  }

  useEffect(() => { fetchOutputs(); }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Chat ──────────────────────────────────────────────────────────────

  async function sendMessage(text: string) {
    if (!text.trim() || isSending) return;

    const userMsg: ChatMessage = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setMessage("");
    setIsSending(true);

    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      const fd = new FormData();
      fd.append("action", "chat");
      fd.append("message", text);
      fd.append("history", JSON.stringify(history));

      const res = await fetch("/api/content", { method: "POST", body: fd });
      const data = await res.json() as { response?: string; error?: string };

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response ?? data.error ?? "Error al obtener respuesta." },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Error de conexión. Verifica tu API key de OpenRouter." },
      ]);
    } finally {
      setIsSending(false);
    }
  }

  function handleSend() { sendMessage(message.trim()); }

  // ── Message actions ────────────────────────────────────────────────────

  function copyMessage(content: string, idx: number) {
    navigator.clipboard.writeText(content);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  }

  function exportMessage(content: string) {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "contenido-ai.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  function regenerate(idx: number) {
    // Find the user message right before this assistant message
    const userMsg = messages.slice(0, idx).reverse().find((m) => m.role === "user");
    if (!userMsg) return;
    // Remove this assistant message and resend
    setMessages((prev) => prev.slice(0, idx));
    sendMessage(userMsg.content);
  }

  // ── Delete ─────────────────────────────────────────────────────────────

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const fd = new FormData();
      fd.append("action", "delete_output");
      fd.append("id", id);
      const res = await fetch("/api/content", { method: "POST", body: fd });
      if (res.ok) setOutputs((prev) => prev.filter((o) => o.id !== id));
    } finally {
      setDeletingId(null);
    }
  }

  // ── Filtered outputs ───────────────────────────────────────────────────

  const filtered = activeContent === "todos"
    ? outputs
    : outputs.filter((o) => o.type === TYPE_MAP[activeContent]);

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left sidebar */}
      <div className="w-64 flex-shrink-0 border-r border-white/[0.07] bg-[#0d0d0d] flex flex-col">
        <div className="p-5 border-b border-white/[0.07]">
          <h2 className="font-bold text-white text-base tracking-tight">Content Studio</h2>
          <p className="text-xs text-zinc-600 mt-0.5">Genera cualquier tipo de contenido</p>
        </div>

        <div className="p-3 space-y-1 flex-1 overflow-y-auto">
          <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider px-2 mb-2">
            Tipo de contenido
          </p>

          <button
            onClick={() => goToSection("todos")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left ${
              activeContent === "todos" && activeTab === "library"
                ? "bg-white/[0.06] border border-white/10"
                : "border border-transparent hover:bg-white/[0.03]"
            }`}
          >
            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 bg-white/[0.05]">
              <Library className="w-3.5 h-3.5 text-zinc-400" />
            </div>
            <span className="text-sm text-zinc-300 flex-1">Biblioteca</span>
            <Badge className="text-[10px] bg-white/[0.04] border-white/10 text-zinc-600">
              {outputs.length}
            </Badge>
          </button>

          <div className="border-t border-white/[0.05] my-2" />

          {contentTypes.map((type) => {
            const Icon = type.icon;
            const key = type.label.toLowerCase() as string;
            const dbType = TYPE_MAP[key];
            const count = outputs.filter((o) => o.type === dbType).length;
            return (
              <button
                key={type.label}
                onClick={() => goToSection(key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left ${
                  activeContent === key && activeTab === "library"
                    ? "bg-white/[0.06] border border-white/10"
                    : "border border-transparent hover:bg-white/[0.03]"
                }`}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${type.color}15` }}
                >
                  <Icon className="w-3.5 h-3.5" style={{ color: type.color, width: 14, height: 14 }} />
                </div>
                <span className="text-sm text-zinc-300 flex-1">{type.label}</span>
                <Badge className="text-[10px] bg-white/[0.04] border-white/10 text-zinc-600">
                  {count}
                </Badge>
              </button>
            );
          })}

          <div className="pt-4">
            <Button className="w-full bg-[#FF0033]/10 hover:bg-[#FF0033]/20 text-[#FF0033] border border-[#FF0033]/20 gap-2 text-sm transition-all">
              <Wand2 className="w-3.5 h-3.5" />
              Generar nuevo
            </Button>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <div className="border-b border-white/[0.07] px-6 bg-transparent flex items-center justify-between">
            <TabsList className="bg-transparent gap-1 h-auto py-2">
              <TabsTrigger
                value="chat"
                className="data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-[#FF0033] data-[state=active]:shadow-none rounded-none text-zinc-500 hover:text-zinc-300 text-sm px-4 py-1.5 transition-colors"
              >
                Chat IA
              </TabsTrigger>
              <TabsTrigger
                value="library"
                className="data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-[#FF0033] data-[state=active]:shadow-none rounded-none text-zinc-500 hover:text-zinc-300 text-sm px-4 py-1.5 transition-colors"
              >
                Biblioteca
              </TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-2 py-2">
              <Badge className="text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                OpenRouter
              </Badge>
            </div>
          </div>

          {/* Chat Tab */}
          <TabsContent value="chat" className="flex-1 flex flex-col overflow-hidden m-0">
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                  <div
                    className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                      msg.role === "assistant"
                        ? "bg-[#FF0033]/15 border border-[#FF0033]/25"
                        : "bg-white/[0.06] border border-white/10"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <Bot className="w-4 h-4 text-[#FF0033]" />
                    ) : (
                      <User className="w-4 h-4 text-zinc-500" />
                    )}
                  </div>
                  <div
                    className={`max-w-2xl rounded-2xl px-4 py-3 ${
                      msg.role === "assistant"
                        ? "bg-[#141414] border border-white/[0.08] rounded-tl-sm"
                        : "bg-[#FF0033]/10 border border-[#FF0033]/20 rounded-tr-sm"
                    }`}
                  >
                    <p
                      className="text-sm text-zinc-200 leading-6 whitespace-pre-line"
                      dangerouslySetInnerHTML={{
                        __html: msg.content
                          .replace(/\*\*(.*?)\*\*/g, "<strong class='text-white'>$1</strong>")
                          .replace(/↳/g, "<span class='text-zinc-600'>↳</span>"),
                      }}
                    />
                    {msg.role === "assistant" && (
                      <div className="flex items-center gap-3 mt-3 pt-2 border-t border-white/[0.05]">
                        <button
                          onClick={() => copyMessage(msg.content, i)}
                          className="flex items-center gap-1.5 text-[11px] text-zinc-600 hover:text-white transition-colors"
                        >
                          {copiedIdx === i ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                          {copiedIdx === i ? "Copiado" : "Copiar"}
                        </button>
                        <button
                          onClick={() => regenerate(i)}
                          disabled={isSending}
                          className="flex items-center gap-1.5 text-[11px] text-zinc-600 hover:text-white transition-colors disabled:opacity-40"
                        >
                          <RefreshCw className="w-3 h-3" />
                          Regenerar
                        </button>
                        <button
                          onClick={() => exportMessage(msg.content)}
                          className="flex items-center gap-1.5 text-[11px] text-zinc-600 hover:text-white transition-colors"
                        >
                          <Download className="w-3 h-3" />
                          Exportar
                        </button>
                        <SaveDropdown
                          content={msg.content}
                          onSaved={(type) => {
                            fetchOutputs();
                            const sectionKey = Object.entries(TYPE_MAP).find(([, v]) => v === type)?.[0] ?? "todos";
                            goToSection(sectionKey);
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isSending && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center bg-[#FF0033]/15 border border-[#FF0033]/25">
                    <Bot className="w-4 h-4 text-[#FF0033]" />
                  </div>
                  <div className="bg-[#141414] border border-white/[0.08] rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 text-zinc-500 animate-spin" />
                    <span className="text-sm text-zinc-500">Pensando...</span>
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Quick prompts */}
            <div className="px-6 pb-2 flex gap-2 overflow-x-auto">
              {[
                "Generar guión completo",
                "Crear 10 ideas de shorts",
                "Optimizar SEO",
                "Email para suscriptores",
              ].map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => setMessage(prompt)}
                  className="flex-shrink-0 text-xs text-zinc-600 hover:text-zinc-200 border border-white/[0.08] hover:border-[#FF0033]/35 rounded-full px-3 py-1.5 transition-all"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/[0.07] bg-[#0d0d0d]/60">
              <div className="flex gap-3 items-end">
                <div className="flex-1 relative">
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
                    }}
                    placeholder="Describe qué contenido necesitas generar..."
                    className="bg-[#141414] border-white/10 text-white placeholder:text-zinc-700 text-sm resize-none min-h-[44px] max-h-32 focus:border-[#FF0033]/40 pr-12"
                    rows={1}
                  />
                  <button className="absolute right-3 bottom-3">
                    <Sparkles className="w-4 h-4 text-zinc-700 hover:text-[#FF0033] transition-colors" />
                  </button>
                </div>
                <Button
                  onClick={handleSend}
                  disabled={!message.trim() || isSending}
                  className="bg-[#FF0033] hover:bg-[#e8002e] text-white h-11 w-11 p-0 flex-shrink-0 shadow-[0_0_16px_rgba(255,0,51,0.2)] hover:shadow-[0_0_20px_rgba(255,0,51,0.3)] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Library Tab */}
          <TabsContent value="library" className="flex-1 overflow-y-auto m-0 p-6">
            {loadingLib ? (
              <div className="flex items-center justify-center h-40 gap-3 text-zinc-600">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm">Cargando biblioteca...</span>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-zinc-700 gap-2">
                <Library className="w-8 h-8" />
                <p className="text-sm">No hay elementos en esta categoría aún.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {filtered.map((item) => (
                  <Card
                    key={item.id}
                    className="bg-[#141414] border-white/[0.08] p-4 hover:border-white/[0.14] hover:bg-[#181818] cursor-pointer transition-all group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <Badge className="text-[10px] bg-[#FF0033]/10 text-[#FF0033] border-[#FF0033]/20">
                        {TYPE_LABEL[item.type] ?? item.type}
                      </Badge>
                      <span className="text-[11px] text-zinc-600">
                        {new Date(item.createdAt).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-white mb-2 group-hover:text-[#FF0033] transition-colors tracking-tight line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-zinc-600">{item.body?.split(/\s+/).length ?? 0} palabras</p>
                    <div className="flex gap-2 mt-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1 h-7 text-xs text-zinc-600 hover:text-white border border-white/[0.08] hover:border-white/[0.14]"
                        onClick={() => navigator.clipboard.writeText(item.body)}
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        Copiar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={deletingId === item.id}
                        onClick={() => handleDelete(item.id)}
                        className="h-7 w-7 p-0 text-zinc-600 hover:text-red-400 border border-white/[0.08] hover:border-red-500/30 transition-colors"
                      >
                        {deletingId === item.id
                          ? <Loader2 className="w-3 h-3 animate-spin" />
                          : <Trash2 className="w-3 h-3" />
                        }
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

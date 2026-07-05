"use client";

import { useEffect, useState } from "react";
import { Copy, Check, Search, Plus, Star, Tag, BookOpen, Trash2, X, Loader2, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const CATEGORIES = ["Todos", "YouTube", "Guiones", "SEO", "Redes", "Email", "Ideas"];
const NEW_PROMPT_CATEGORIES = CATEGORIES.filter((c) => c !== "Todos");

interface Prompt {
  id: string;
  category: string;
  title: string;
  text: string;
  starred: boolean;
  createdAt?: string;
}

export function PromptsPage() {
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewPrompt, setShowNewPrompt] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState(NEW_PROMPT_CATEGORIES[0]);
  const [newText, setNewText] = useState("");
  const [saving, setSaving] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [copiedCard, setCopiedCard] = useState(false);

  useEffect(() => {
    fetchPrompts();
  }, []);

  async function fetchPrompts() {
    try {
      const res = await fetch("/api/prompts");
      const data = await res.json();
      setPrompts(data.prompts ?? []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  const filtered = prompts.filter((p) => {
    const matchesCat = activeCategory === "Todos" || p.category === activeCategory;
    const matchesSearch =
      !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.text.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  function handleCopy(id: string, text: string) {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(id);
    setTimeout(() => setCopied(null), 1800);
  }

  async function toggleStar(id: string, starred: boolean) {
    setPrompts((prev) => prev.map((p) => (p.id === id ? { ...p, starred } : p)));
    const formData = new FormData();
    formData.set("action", "toggle_starred");
    formData.set("id", id);
    formData.set("starred", String(starred));
    await fetch("/api/prompts", { method: "POST", body: formData });
  }

  async function handleDelete(id: string) {
    setPrompts((prev) => prev.filter((p) => p.id !== id));
    const formData = new FormData();
    formData.set("action", "delete");
    formData.set("id", id);
    await fetch("/api/prompts", { method: "POST", body: formData });
  }

  async function handleCreate() {
    if (!newTitle.trim() || !newText.trim()) return;
    setSaving(true);
    try {
      const formData = new FormData();
      formData.set("action", "create");
      formData.set("title", newTitle.trim());
      formData.set("category", newCategory);
      formData.set("text", newText.trim());
      const res = await fetch("/api/prompts", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success && data.prompt) {
        setPrompts((prev) => [data.prompt, ...prev]);
      }
      setNewTitle("");
      setNewText("");
      setNewCategory(NEW_PROMPT_CATEGORIES[0]);
      setShowNewPrompt(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2 tracking-tight">
            <BookOpen className="w-6 h-6 text-[#FF0033]" />
            Prompt Library
          </h1>
          <p className="text-zinc-500 text-sm mt-0.5">{prompts.length} prompts optimizados para creadores</p>
        </div>
        <Button
          onClick={() => setShowNewPrompt(true)}
          className="bg-[#FF0033] hover:bg-[#e8002e] text-white gap-2 shadow-[0_0_16px_rgba(255,0,51,0.2)] hover:shadow-[0_0_24px_rgba(255,0,51,0.3)] transition-all"
        >
          <Plus className="w-4 h-4" />
          Nuevo prompt
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar prompts..."
            className="pl-9 bg-[#141414] border-white/10 text-white placeholder:text-zinc-700 text-sm h-9 w-56 focus:border-[#FF0033]/40"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full border transition-all ${
                activeCategory === cat
                  ? "bg-[#FF0033]/12 border-[#FF0033]/35 text-white"
                  : "border-white/10 text-zinc-500 hover:text-zinc-200 hover:border-white/[0.18]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20 text-zinc-600">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          Cargando prompts...
        </div>
      )}

      {/* Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((prompt) => (
            <Card
              key={prompt.id}
              onClick={() => setSelectedPrompt(prompt)}
              className="bg-[#141414] border-white/[0.08] p-5 flex flex-col gap-3 hover:border-white/[0.14] hover:bg-[#181818] transition-all group cursor-pointer h-[260px]"
            >
              <div className="flex items-start justify-between">
                <Badge className="text-[10px] bg-[#FF0033]/10 text-[#FF0033] border-[#FF0033]/20">
                  <Tag className="w-2.5 h-2.5 mr-1" />
                  {prompt.category}
                </Badge>
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => toggleStar(prompt.id, !prompt.starred)}
                    className={`transition-colors ${
                      prompt.starred ? "text-yellow-400" : "text-zinc-700 hover:text-yellow-400"
                    }`}
                  >
                    <Star className="w-4 h-4" fill={prompt.starred ? "currentColor" : "none"} />
                  </button>
                  <button
                    onClick={() => handleDelete(prompt.id)}
                    className="text-zinc-700 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="text-sm font-semibold text-white group-hover:text-[#FF0033] transition-colors tracking-tight line-clamp-1">
                {prompt.title}
              </h3>

              <p className="text-xs text-zinc-600 leading-5 flex-1 font-mono bg-[#0f0f0f] rounded-xl p-3 border border-white/[0.06] line-clamp-5 overflow-hidden">
                {prompt.text}
              </p>

              <button
                onClick={(e) => { e.stopPropagation(); handleCopy(prompt.id, prompt.text); }}
                className={`flex items-center justify-center gap-2 w-full py-2 rounded-xl text-xs border transition-all ${
                  copied === prompt.id
                    ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400"
                    : "border-white/10 text-zinc-600 hover:text-white hover:border-[#FF0033]/25 hover:bg-[#FF0033]/[0.04]"
                }`}
              >
                {copied === prompt.id ? (
                  <><Check className="w-3.5 h-3.5" /> Copiado</>
                ) : (
                  <><Copy className="w-3.5 h-3.5" /> Copiar prompt</>
                )}
              </button>
            </Card>
          ))}

          {/* Add new prompt card */}
          <Card
            onClick={() => setShowNewPrompt(true)}
            className="bg-[#0f0f0f] border-white/[0.06] border-dashed p-5 hover:border-[#FF0033]/25 hover:bg-[#FF0033]/[0.02] transition-all group cursor-pointer flex flex-col items-center justify-center h-[260px]"
          >
            <div className="w-10 h-10 rounded-xl bg-[#FF0033]/10 flex items-center justify-center mb-3 group-hover:bg-[#FF0033]/15 transition-colors">
              <Plus className="w-5 h-5 text-[#FF0033]" />
            </div>
            <p className="text-sm font-semibold text-zinc-600 group-hover:text-zinc-200 transition-colors">
              Nuevo prompt
            </p>
            <p className="text-xs text-zinc-700 mt-1">Haz clic para agregar</p>
          </Card>
        </div>
      )}

      {/* New Prompt Modal */}
      {showNewPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setShowNewPrompt(false)} />
          <div className="relative bg-[#161616] border border-white/10 rounded-2xl p-6 w-full max-w-md mx-4 shadow-[0_24px_80px_rgba(0,0,0,0.8)]">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-white flex items-center gap-2 tracking-tight">
                <BookOpen className="w-5 h-5 text-[#FF0033]" />
                Nuevo prompt
              </h2>
              <button onClick={() => setShowNewPrompt(false)} className="text-zinc-600 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-600 uppercase tracking-wider block mb-2">
                  Título
                </label>
                <Input
                  autoFocus
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ej: Gancho de apertura viral"
                  className="bg-[#111111] border-white/10 text-white placeholder:text-zinc-700 focus:border-[#FF0033]/40"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-600 uppercase tracking-wider block mb-2">
                  Categoría
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {NEW_PROMPT_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setNewCategory(cat)}
                      className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full border transition-all ${
                        newCategory === cat
                          ? "bg-[#FF0033]/12 border-[#FF0033]/35 text-white"
                          : "border-white/10 text-zinc-500 hover:text-zinc-200 hover:border-white/[0.18]"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-600 uppercase tracking-wider block mb-2">
                  Texto del prompt
                </label>
                <Textarea
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  placeholder="Escribe el prompt, usa [VARIABLES] entre corchetes..."
                  className="bg-[#111111] border-white/10 text-white placeholder:text-zinc-700 focus:border-[#FF0033]/40 resize-none font-mono text-xs"
                  rows={5}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="ghost"
                onClick={() => setShowNewPrompt(false)}
                className="flex-1 border border-white/10 text-zinc-500 hover:text-white hover:border-white/[0.18]"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreate}
                disabled={!newTitle.trim() || !newText.trim() || saving}
                className="flex-1 bg-[#FF0033] hover:bg-[#e8002e] text-white disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_16px_rgba(255,0,51,0.2)] transition-all"
              >
                {saving ? "Guardando..." : "Guardar prompt"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Prompt Detail Modal */}
      {selectedPrompt && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setSelectedPrompt(null)}
        >
          <div
            className="bg-[#141414] border border-white/[0.1] rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/[0.07]">
              <div className="flex items-center gap-3 min-w-0">
                <Badge className="text-[10px] bg-[#FF0033]/10 text-[#FF0033] border-[#FF0033]/20 flex-shrink-0">
                  <Tag className="w-2.5 h-2.5 mr-1" />
                  {selectedPrompt.category}
                </Badge>
                <h2 className="text-sm font-semibold text-white tracking-tight line-clamp-1">
                  {selectedPrompt.title}
                </h2>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => toggleStar(selectedPrompt.id, !selectedPrompt.starred)}
                  className={`transition-colors ${
                    selectedPrompt.starred ? "text-yellow-400" : "text-zinc-600 hover:text-yellow-400"
                  }`}
                >
                  <Star className="w-4 h-4" fill={selectedPrompt.starred ? "currentColor" : "none"} />
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(selectedPrompt.text).catch(() => {});
                    setCopiedCard(true);
                    setTimeout(() => setCopiedCard(false), 2000);
                  }}
                  className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-white border border-white/[0.08] hover:border-white/20 rounded-lg px-3 py-1.5 transition-all"
                >
                  {copiedCard ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copiedCard ? "Copiado" : "Copiar"}
                </button>
                <button
                  onClick={() => {
                    const blob = new Blob([selectedPrompt.text], { type: "text/plain;charset=utf-8" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `${selectedPrompt.title ?? "prompt"}.txt`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-white border border-white/[0.08] hover:border-white/20 rounded-lg px-3 py-1.5 transition-all"
                >
                  <Download className="w-3 h-3" />
                  Exportar
                </button>
                <button
                  onClick={() => {
                    handleDelete(selectedPrompt.id);
                    setSelectedPrompt(null);
                  }}
                  className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-red-400 border border-white/[0.08] hover:border-red-500/30 rounded-lg px-3 py-1.5 transition-all"
                >
                  <Trash2 className="w-3 h-3" />
                  Eliminar
                </button>
                <button
                  onClick={() => setSelectedPrompt(null)}
                  className="text-zinc-600 hover:text-white ml-1 transition-colors text-lg leading-none"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5">
              <p className="text-sm text-zinc-300 leading-7 whitespace-pre-line font-mono bg-[#0f0f0f] rounded-xl p-4 border border-white/[0.06]">
                {selectedPrompt.text}
              </p>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-white/[0.07] flex items-center justify-between">
              <span className="text-[11px] text-zinc-600">
                {selectedPrompt.text.split(/\s+/).length} palabras
                {selectedPrompt.createdAt &&
                  ` · ${new Date(selectedPrompt.createdAt).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}`}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

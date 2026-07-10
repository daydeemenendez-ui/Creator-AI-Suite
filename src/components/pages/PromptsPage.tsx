"use client";

import { useEffect, useState } from "react";
import {
  Copy, Check, Search, Plus, Star, Tag, BookOpen, Trash2, X, Loader2, Download,
  ImagePlus, Image as ImageIcon, Layers, ZoomIn,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const CATEGORIES = ["Todos", "YouTube", "Guiones", "SEO", "Redes", "Email", "Ideas"];
const NEW_PROMPT_CATEGORIES = CATEGORIES.filter((c) => c !== "Todos");

interface PromptImage {
  path: string;
  url: string;
}

interface Prompt {
  id: string;
  category: string;
  title: string;
  text: string;
  starred: boolean;
  createdAt?: string;
  images?: PromptImage[] | null;
  parentId?: string | null;
  children?: Prompt[];
}

async function uploadImageFile(file: File): Promise<PromptImage | null> {
  const urlRes = await fetch("/api/upload-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileName: file.name, kind: "image" }),
  });
  if (!urlRes.ok) return null;
  const { signedURL, path, publicURL } = await urlRes.json() as { signedURL: string; path: string; publicURL: string };

  const uploadRes = await fetch(signedURL, {
    method: "PUT",
    headers: { "Content-Type": file.type || "application/octet-stream" },
    body: file,
  });
  if (!uploadRes.ok) return null;

  return { path, url: publicURL };
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
  const [newImages, setNewImages] = useState<PromptImage[]>([]);
  const [uploadingNewImage, setUploadingNewImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedPromptId, setSelectedPromptId] = useState<string | null>(null);
  const [copiedCard, setCopiedCard] = useState(false);
  const [showChildForm, setShowChildForm] = useState(false);
  const [childTitle, setChildTitle] = useState("");
  const [childText, setChildText] = useState("");
  const [childImages, setChildImages] = useState<PromptImage[]>([]);
  const [uploadingChildImage, setUploadingChildImage] = useState(false);
  const [savingChild, setSavingChild] = useState(false);
  const [uploadingDetailImage, setUploadingDetailImage] = useState(false);
  const [viewingImage, setViewingImage] = useState<string | null>(null);

  const selectedPrompt = prompts.find((p) => p.id === selectedPromptId) ?? null;

  useEffect(() => {
    if (!viewingImage) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setViewingImage(null);
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [viewingImage]);

  useEffect(() => {
    setShowChildForm(false);
  }, [selectedPromptId]);

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
    setSelectedPromptId((prev) => (prev === id ? null : prev));
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
      if (newImages.length > 0) formData.set("images", JSON.stringify(newImages));
      const res = await fetch("/api/prompts", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success && data.prompt) {
        setPrompts((prev) => [{ ...data.prompt, children: [] }, ...prev]);
      }
      setNewTitle("");
      setNewText("");
      setNewCategory(NEW_PROMPT_CATEGORIES[0]);
      setNewImages([]);
      setShowNewPrompt(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleNewImageSelect(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploadingNewImage(true);
    try {
      for (const file of Array.from(files)) {
        const img = await uploadImageFile(file);
        if (img) setNewImages((prev) => [...prev, img]);
      }
    } finally {
      setUploadingNewImage(false);
    }
  }

  async function persistPromptImages(promptId: string, images: PromptImage[]) {
    setPrompts((prev) => prev.map((p) => (p.id === promptId ? { ...p, images } : p)));
    const formData = new FormData();
    formData.set("action", "update_images");
    formData.set("id", promptId);
    formData.set("images", JSON.stringify(images));
    await fetch("/api/prompts", { method: "POST", body: formData });
  }

  async function handleDetailImageSelect(promptId: string, currentImages: PromptImage[], files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploadingDetailImage(true);
    try {
      const uploaded: PromptImage[] = [];
      for (const file of Array.from(files)) {
        const img = await uploadImageFile(file);
        if (img) uploaded.push(img);
      }
      if (uploaded.length > 0) await persistPromptImages(promptId, [...currentImages, ...uploaded]);
    } finally {
      setUploadingDetailImage(false);
    }
  }

  function handleRemoveImage(promptId: string, currentImages: PromptImage[], path: string) {
    void persistPromptImages(promptId, currentImages.filter((img) => img.path !== path));
  }

  function closeNewPromptModal() {
    setShowNewPrompt(false);
    setNewTitle("");
    setNewText("");
    setNewCategory(NEW_PROMPT_CATEGORIES[0]);
    setNewImages([]);
  }

  function openChildForm() {
    setChildTitle("");
    setChildText("");
    setChildImages([]);
    setShowChildForm(true);
  }

  async function handleChildImageSelect(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploadingChildImage(true);
    try {
      for (const file of Array.from(files)) {
        const img = await uploadImageFile(file);
        if (img) setChildImages((prev) => [...prev, img]);
      }
    } finally {
      setUploadingChildImage(false);
    }
  }

  async function handleCreateChild(parentId: string) {
    if (!childTitle.trim() || !childText.trim() || savingChild) return;
    setSavingChild(true);
    try {
      const formData = new FormData();
      formData.set("action", "create");
      formData.set("title", childTitle.trim());
      formData.set("text", childText.trim());
      formData.set("parentId", parentId);
      if (childImages.length > 0) formData.set("images", JSON.stringify(childImages));
      const res = await fetch("/api/prompts", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success && data.prompt) {
        setPrompts((prev) => prev.map((p) => (
          p.id === parentId ? { ...p, children: [...(p.children ?? []), data.prompt] } : p
        )));
      }
      setShowChildForm(false);
    } finally {
      setSavingChild(false);
    }
  }

  async function handleDeleteChild(parentId: string, childId: string) {
    setPrompts((prev) => prev.map((p) => (
      p.id === parentId ? { ...p, children: (p.children ?? []).filter((c) => c.id !== childId) } : p
    )));
    const formData = new FormData();
    formData.set("action", "delete");
    formData.set("id", childId);
    await fetch("/api/prompts", { method: "POST", body: formData });
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
              onClick={() => setSelectedPromptId(prompt.id)}
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

              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-white group-hover:text-[#FF0033] transition-colors tracking-tight line-clamp-1 flex-1 min-w-0">
                  {prompt.title}
                </h3>
                {!!prompt.images?.length && (
                  <span className="flex items-center gap-0.5 text-[10px] text-zinc-600 flex-shrink-0">
                    <ImageIcon className="w-3 h-3" /> {prompt.images.length}
                  </span>
                )}
                {!!prompt.children?.length && (
                  <span className="flex items-center gap-0.5 text-[10px] text-zinc-600 flex-shrink-0">
                    <Layers className="w-3 h-3" /> {prompt.children.length}
                  </span>
                )}
              </div>

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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={closeNewPromptModal} />
          <div className="relative bg-[#161616] border border-white/10 rounded-2xl w-full max-w-md shadow-[0_24px_80px_rgba(0,0,0,0.8)] max-h-[85vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-6 pb-5 flex-shrink-0">
              <h2 className="text-lg font-bold text-white flex items-center gap-2 tracking-tight">
                <BookOpen className="w-5 h-5 text-[#FF0033]" />
                Nuevo prompt
              </h2>
              <button onClick={closeNewPromptModal} className="text-zinc-600 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 px-6 overflow-y-auto flex-1 min-h-0">
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
                  className="bg-[#111111] border-white/10 text-white placeholder:text-zinc-700 focus:border-[#FF0033]/40 resize-none font-mono text-xs max-h-40 overflow-y-auto"
                  rows={5}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-600 uppercase tracking-wider block mb-2">
                  Imágenes de referencia
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {newImages.map((img) => (
                    <div key={img.path} className="relative w-14 h-14 rounded-lg overflow-hidden border border-white/10 group/img">
                      <button
                        onClick={() => setViewingImage(img.url)}
                        className="w-full h-full block"
                      >
                        <img src={img.url} alt="" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity">
                          <ZoomIn className="w-4 h-4 text-white" />
                        </div>
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setNewImages((prev) => prev.filter((i) => i.path !== img.path)); }}
                        className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-black border border-white/20 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity hover:bg-red-500/80"
                      >
                        <X className="w-2.5 h-2.5 text-white" />
                      </button>
                    </div>
                  ))}
                  <label className="w-14 h-14 rounded-lg border border-dashed border-white/15 flex items-center justify-center cursor-pointer hover:border-[#FF0033]/40 transition-colors flex-shrink-0">
                    {uploadingNewImage ? (
                      <Loader2 className="w-4 h-4 text-zinc-500 animate-spin" />
                    ) : (
                      <ImagePlus className="w-4 h-4 text-zinc-500" />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => { void handleNewImageSelect(e.target.files); e.target.value = ""; }}
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="flex gap-3 p-6 pt-4 flex-shrink-0">
              <Button
                variant="ghost"
                onClick={closeNewPromptModal}
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
          onClick={() => setSelectedPromptId(null)}
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
                  onClick={() => handleDelete(selectedPrompt.id)}
                  className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-red-400 border border-white/[0.08] hover:border-red-500/30 rounded-lg px-3 py-1.5 transition-all"
                >
                  <Trash2 className="w-3 h-3" />
                  Eliminar
                </button>
                <button
                  onClick={() => setSelectedPromptId(null)}
                  className="text-zinc-600 hover:text-white ml-1 transition-colors text-lg leading-none"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              <p className="text-sm text-zinc-300 leading-7 whitespace-pre-line font-mono bg-[#0f0f0f] rounded-xl p-4 border border-white/[0.06]">
                {selectedPrompt.text}
              </p>

              {/* Reference images */}
              <div>
                <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider mb-2">
                  Imágenes de referencia
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  {(selectedPrompt.images ?? []).map((img) => (
                    <div key={img.path} className="relative w-16 h-16 rounded-lg overflow-hidden border border-white/10 group/img">
                      <button
                        onClick={() => setViewingImage(img.url)}
                        className="w-full h-full block"
                      >
                        <img src={img.url} alt="" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity">
                          <ZoomIn className="w-4 h-4 text-white" />
                        </div>
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleRemoveImage(selectedPrompt.id, selectedPrompt.images ?? [], img.path); }}
                        className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-black border border-white/20 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity hover:bg-red-500/80"
                      >
                        <X className="w-2.5 h-2.5 text-white" />
                      </button>
                    </div>
                  ))}
                  <label className="w-16 h-16 rounded-lg border border-dashed border-white/15 flex items-center justify-center cursor-pointer hover:border-[#FF0033]/40 transition-colors flex-shrink-0">
                    {uploadingDetailImage ? (
                      <Loader2 className="w-4 h-4 text-zinc-500 animate-spin" />
                    ) : (
                      <ImagePlus className="w-4 h-4 text-zinc-500" />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        void handleDetailImageSelect(selectedPrompt.id, selectedPrompt.images ?? [], e.target.files);
                        e.target.value = "";
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Sub-prompts */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider">
                    Subtarjetas
                  </p>
                  <button
                    onClick={openChildForm}
                    className="flex items-center gap-1 text-[11px] text-zinc-500 hover:text-white transition-colors"
                  >
                    <Plus className="w-3 h-3" /> Añadir subtarjeta
                  </button>
                </div>

                <div className="space-y-2">
                  {(selectedPrompt.children ?? []).map((child) => (
                    <div key={child.id} className="bg-[#0f0f0f] rounded-xl p-3 border border-white/[0.06]">
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <h4 className="text-xs font-semibold text-white line-clamp-1">{child.title}</h4>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => handleCopy(child.id, child.text)}
                            className="text-zinc-600 hover:text-white transition-colors"
                          >
                            {copied === child.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          </button>
                          <button
                            onClick={() => handleDeleteChild(selectedPrompt.id, child.id)}
                            className="text-zinc-600 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <p className="text-[11px] text-zinc-500 font-mono line-clamp-3 whitespace-pre-line">{child.text}</p>
                      {!!child.images?.length && (
                        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                          {child.images.map((img) => (
                            <button key={img.path} onClick={() => setViewingImage(img.url)} className="flex-shrink-0">
                              <img src={img.url} alt="" className="w-8 h-8 rounded object-cover border border-white/10 hover:border-[#FF0033]/40 transition-colors" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  {showChildForm && (
                    <div className="bg-[#0f0f0f] rounded-xl p-3 border border-[#FF0033]/25 space-y-2">
                      <Input
                        autoFocus
                        value={childTitle}
                        onChange={(e) => setChildTitle(e.target.value)}
                        placeholder="Título de la subtarjeta"
                        className="bg-[#111111] border-white/10 text-white placeholder:text-zinc-700 text-xs h-8 focus:border-[#FF0033]/40"
                      />
                      <Textarea
                        value={childText}
                        onChange={(e) => setChildText(e.target.value)}
                        placeholder="Texto del prompt..."
                        className="bg-[#111111] border-white/10 text-white placeholder:text-zinc-700 focus:border-[#FF0033]/40 resize-none font-mono text-xs max-h-32 overflow-y-auto"
                        rows={3}
                      />
                      <div className="flex items-center gap-2 flex-wrap">
                        {childImages.map((img) => (
                          <div key={img.path} className="relative w-10 h-10 rounded-lg overflow-hidden border border-white/10 group/img">
                            <button onClick={() => setViewingImage(img.url)} className="w-full h-full block">
                              <img src={img.url} alt="" className="w-full h-full object-cover" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); setChildImages((prev) => prev.filter((i) => i.path !== img.path)); }}
                              className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-black border border-white/20 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity hover:bg-red-500/80"
                            >
                              <X className="w-2 h-2 text-white" />
                            </button>
                          </div>
                        ))}
                        <label className="w-10 h-10 rounded-lg border border-dashed border-white/15 flex items-center justify-center cursor-pointer hover:border-[#FF0033]/40 transition-colors flex-shrink-0">
                          {uploadingChildImage ? (
                            <Loader2 className="w-3.5 h-3.5 text-zinc-500 animate-spin" />
                          ) : (
                            <ImagePlus className="w-3.5 h-3.5 text-zinc-500" />
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={(e) => { void handleChildImageSelect(e.target.files); e.target.value = ""; }}
                          />
                        </label>
                      </div>
                      <div className="flex gap-2 pt-1">
                        <Button
                          variant="ghost"
                          onClick={() => setShowChildForm(false)}
                          className="flex-1 h-8 text-xs border border-white/10 text-zinc-500 hover:text-white hover:border-white/[0.18]"
                        >
                          Cancelar
                        </Button>
                        <Button
                          onClick={() => handleCreateChild(selectedPrompt.id)}
                          disabled={!childTitle.trim() || !childText.trim() || savingChild}
                          className="flex-1 h-8 text-xs bg-[#FF0033] hover:bg-[#e8002e] text-white disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {savingChild ? "Guardando..." : "Guardar"}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
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

      {/* Image Lightbox */}
      {viewingImage && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm p-6"
          onClick={() => setViewingImage(null)}
        >
          <button
            onClick={() => setViewingImage(null)}
            className="absolute top-5 right-5 text-white/70 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={viewingImage}
            alt=""
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <a
            href={viewingImage}
            download
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-5 right-5 flex items-center gap-1.5 text-xs text-white/80 hover:text-white border border-white/20 hover:border-white/40 rounded-lg px-3 py-1.5 transition-all bg-black/40"
          >
            <Download className="w-3.5 h-3.5" />
            Descargar
          </a>
        </div>
      )}
    </div>
  );
}

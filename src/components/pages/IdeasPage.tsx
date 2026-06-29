"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Filter,
  Tag,
  Star,
  ArrowRight,
  FileText,
  Mail,
  MoreHorizontal,
  Lightbulb,
  Zap,
  Clock,
  X,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const tags = ["Todos", "YouTube", "Shorts", "Tutorial", "Tendencia", "SEO", "Monetización", "IA"];

interface Idea {
  id: string;
  title: string;
  description: string | null;
  tags: string[];
  priority: string;
  starred: boolean;
  createdAt: string;
}

const priorityColors: Record<string, string> = {
  alta: "#FF0033",
  media: "#F59E0B",
  baja: "#71717a",
};

const priorities = ["alta", "media", "baja"];

function formatDate(iso: string) {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return "hoy";
  if (diffDays === 1) return "ayer";
  return `hace ${diffDays} días`;
}

export function IdeasPage() {
  const [activeTag, setActiveTag] = useState("Todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewIdea, setShowNewIdea] = useState(false);
  const [newIdeaTitle, setNewIdeaTitle] = useState("");
  const [newIdeaDesc, setNewIdeaDesc] = useState("");
  const [saving, setSaving] = useState(false);

  async function fetchIdeas() {
    try {
      const res = await fetch("/api/ideas");
      const data = await res.json();
      setIdeas(data.ideas ?? []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchIdeas();
  }, []);

  async function handleCreateIdea() {
    if (!newIdeaTitle.trim()) return;
    setSaving(true);
    try {
      const formData = new FormData();
      formData.set("action", "create");
      formData.set("title", newIdeaTitle.trim());
      formData.set("description", newIdeaDesc.trim());
      formData.set("tags", "YouTube");
      formData.set("priority", "media");
      const res = await fetch("/api/ideas", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success && data.idea) {
        setIdeas((prev) => [data.idea, ...prev]);
      }
      setNewIdeaTitle("");
      setNewIdeaDesc("");
      setShowNewIdea(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setIdeas((prev) => prev.filter((i) => i.id !== id));
    const formData = new FormData();
    formData.set("action", "delete");
    formData.set("id", id);
    await fetch("/api/ideas", { method: "POST", body: formData });
  }

  async function handleSetPriority(id: string, priority: string) {
    setIdeas((prev) => prev.map((i) => (i.id === id ? { ...i, priority } : i)));
    const formData = new FormData();
    formData.set("action", "update_priority");
    formData.set("id", id);
    formData.set("priority", priority);
    await fetch("/api/ideas", { method: "POST", body: formData });
  }

  async function handleToggleStar(id: string, starred: boolean) {
    setIdeas((prev) => prev.map((i) => (i.id === id ? { ...i, starred } : i)));
    const formData = new FormData();
    formData.set("action", "toggle_starred");
    formData.set("id", id);
    formData.set("starred", String(starred));
    await fetch("/api/ideas", { method: "POST", body: formData });
  }

  const filtered = ideas.filter((idea) => {
    const matchesTag = activeTag === "Todos" || idea.tags.includes(activeTag);
    const matchesSearch =
      !searchQuery || idea.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTag && matchesSearch;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2 tracking-tight">
            <Lightbulb className="w-6 h-6 text-[#FF0033]" />
            Banco de Ideas
          </h1>
          <p className="text-zinc-500 text-sm mt-0.5">{ideas.length} ideas guardadas</p>
        </div>
        <Button
          onClick={() => setShowNewIdea(true)}
          className="bg-[#FF0033] hover:bg-[#e8002e] text-white gap-2 shadow-[0_0_16px_rgba(255,0,51,0.2)] hover:shadow-[0_0_24px_rgba(255,0,51,0.3)] transition-all"
        >
          <Plus className="w-4 h-4" />
          Nueva idea
        </Button>
      </div>

      {/* Filters bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar ideas..."
            className="pl-9 bg-[#141414] border-white/10 text-white placeholder:text-zinc-700 text-sm h-9 w-56 focus:border-[#FF0033]/40"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full border transition-all ${
                activeTag === tag
                  ? "bg-[#FF0033]/12 border-[#FF0033]/35 text-white"
                  : "border-white/10 text-zinc-500 hover:text-zinc-200 hover:border-white/[0.18]"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        <button className="ml-auto flex items-center gap-1.5 text-xs text-zinc-500 hover:text-white border border-white/10 hover:border-white/[0.18] rounded-xl px-3 py-1.5 transition-all">
          <Filter className="w-3 h-3" />
          Filtros
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20 text-zinc-600">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          Cargando ideas...
        </div>
      )}

      {/* Ideas grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((idea) => (
            <Card
              key={idea.id}
              className="bg-[#141414] border-white/[0.08] p-5 hover:border-white/[0.14] hover:bg-[#181818] transition-all group flex flex-col"
            >
              {/* Card header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: priorityColors[idea.priority] }}
                    title={`Prioridad ${idea.priority}`}
                  />
                  <DropdownMenu>
                    <DropdownMenuTrigger className="text-[10px] capitalize outline-none cursor-pointer" style={{ color: priorityColors[idea.priority] }}>
                      {idea.priority}
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="start"
                      className="w-32 bg-[#1a1a1a] border-white/10 text-white shadow-[0_8px_32px_rgba(0,0,0,0.6)]"
                    >
                      {priorities.map((p) => (
                        <DropdownMenuItem
                          key={p}
                          onClick={() => handleSetPriority(idea.id, p)}
                          className="text-sm hover:bg-white/[0.05] gap-2 cursor-pointer capitalize"
                        >
                          <div className="w-1.5 h-1.5 rounded-full" style={{ background: priorityColors[p] }} />
                          {p}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleToggleStar(idea.id, !idea.starred)}
                    className={`transition-colors ${
                      idea.starred ? "text-yellow-400" : "text-zinc-700 hover:text-yellow-400"
                    }`}
                  >
                    <Star className="w-3.5 h-3.5" fill={idea.starred ? "currentColor" : "none"} />
                  </button>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="text-zinc-700 hover:text-white transition-colors p-0.5 outline-none cursor-pointer">
                      <MoreHorizontal className="w-3.5 h-3.5" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-44 bg-[#1a1a1a] border-white/10 text-white shadow-[0_8px_32px_rgba(0,0,0,0.6)]"
                    >
                      <DropdownMenuItem className="text-sm hover:bg-white/[0.05] gap-2 cursor-pointer">
                        <FileText className="w-3.5 h-3.5" />
                        Convertir a guión
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-sm hover:bg-white/[0.05] gap-2 cursor-pointer">
                        <Zap className="w-3.5 h-3.5" />
                        Convertir a post
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-sm hover:bg-white/[0.05] gap-2 cursor-pointer">
                        <Mail className="w-3.5 h-3.5" />
                        Convertir a email
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-white/[0.06]" />
                      <DropdownMenuItem
                        onClick={() => handleDelete(idea.id)}
                        className="text-sm hover:bg-white/[0.05] gap-2 cursor-pointer text-red-400"
                      >
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Title */}
              <h3 className="text-sm font-semibold text-white leading-5 mb-2 group-hover:text-[#FF0033] transition-colors tracking-tight">
                {idea.title}
              </h3>

              {/* Description */}
              <p className="text-xs text-zinc-600 leading-5 flex-1">{idea.description}</p>

              {/* Footer */}
              <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between">
                <div className="flex items-center gap-2 flex-wrap">
                  {idea.tags.map((tag) => (
                    <Badge
                      key={tag}
                      className="text-[10px] px-2 py-0 bg-white/[0.04] border-white/10 text-zinc-600"
                    >
                      <Tag className="w-2 h-2 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center gap-1 text-zinc-700 flex-shrink-0 ml-2">
                  <Clock className="w-3 h-3" />
                  <span className="text-[10px]">{formatDate(idea.createdAt)}</span>
                </div>
              </div>

              {/* Convert actions */}
              <div className="mt-3 flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 h-7 text-xs text-zinc-600 hover:text-white border border-white/[0.08] hover:border-[#FF0033]/25 gap-1"
                >
                  <FileText className="w-3 h-3" />
                  → Guión
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 h-7 text-xs text-zinc-600 hover:text-white border border-white/[0.08] hover:border-[#FF0033]/25 gap-1"
                >
                  <Zap className="w-3 h-3" />
                  → Post
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-zinc-600 hover:text-white border border-white/[0.08] hover:border-[#FF0033]/25"
                >
                  <ArrowRight className="w-3 h-3" />
                </Button>
              </div>
            </Card>
          ))}

          {/* Add new idea card */}
          <Card
            onClick={() => setShowNewIdea(true)}
            className="bg-[#0f0f0f] border-white/[0.06] border-dashed p-5 hover:border-[#FF0033]/25 hover:bg-[#FF0033]/[0.02] transition-all group cursor-pointer flex flex-col items-center justify-center min-h-[180px]"
          >
            <div className="w-10 h-10 rounded-xl bg-[#FF0033]/10 flex items-center justify-center mb-3 group-hover:bg-[#FF0033]/15 transition-colors">
              <Plus className="w-5 h-5 text-[#FF0033]" />
            </div>
            <p className="text-sm font-semibold text-zinc-600 group-hover:text-zinc-200 transition-colors">
              Nueva idea
            </p>
            <p className="text-xs text-zinc-700 mt-1">Haz clic para agregar</p>
          </Card>
        </div>
      )}

      {/* New Idea Modal */}
      {showNewIdea && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setShowNewIdea(false)} />
          <div className="relative bg-[#161616] border border-white/10 rounded-2xl p-6 w-full max-w-md mx-4 shadow-[0_24px_80px_rgba(0,0,0,0.8)]">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-white flex items-center gap-2 tracking-tight">
                <Lightbulb className="w-5 h-5 text-[#FF0033]" />
                Nueva idea
              </h2>
              <button onClick={() => setShowNewIdea(false)} className="text-zinc-600 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-600 uppercase tracking-wider block mb-2">
                  Título del video
                </label>
                <Input
                  autoFocus
                  value={newIdeaTitle}
                  onChange={(e) => setNewIdeaTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreateIdea()}
                  placeholder="Ej: Cómo crecer en YouTube sin mostrar tu cara..."
                  className="bg-[#111111] border-white/10 text-white placeholder:text-zinc-700 focus:border-[#FF0033]/40"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-600 uppercase tracking-wider block mb-2">
                  Descripción <span className="normal-case font-normal text-zinc-700">(opcional)</span>
                </label>
                <Textarea
                  value={newIdeaDesc}
                  onChange={(e) => setNewIdeaDesc(e.target.value)}
                  placeholder="Contexto, ángulo o estrategia para este video..."
                  className="bg-[#111111] border-white/10 text-white placeholder:text-zinc-700 focus:border-[#FF0033]/40 resize-none"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="ghost"
                onClick={() => setShowNewIdea(false)}
                className="flex-1 border border-white/10 text-zinc-500 hover:text-white hover:border-white/[0.18]"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreateIdea}
                disabled={!newIdeaTitle.trim() || saving}
                className="flex-1 bg-[#FF0033] hover:bg-[#e8002e] text-white disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_16px_rgba(255,0,51,0.2)] transition-all"
              >
                {saving ? "Guardando..." : "Guardar idea"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

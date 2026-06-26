"use client";

import { useState } from "react";
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
  TrendingUp,
  X,
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

const ideas = [
  {
    id: 1,
    title: "Cómo hice $10K en 6 meses con YouTube sin mostrar mi cara",
    description: "Story + estrategia paso a paso. Muy viral en Reddit Creator. Alto CTR esperado.",
    tags: ["YouTube", "Monetización"],
    priority: "alta",
    date: "hoy",
    starred: true,
    trending: true,
  },
  {
    id: 2,
    title: "5 herramientas de IA que uso CADA DÍA para crear contenido",
    description: "Stack de herramientas con demo en pantalla. Sponsorship potencial con varias apps.",
    tags: ["IA", "Tutorial"],
    priority: "alta",
    date: "hoy",
    starred: true,
    trending: false,
  },
  {
    id: 3,
    title: "El error que el 90% de YouTubers comete al editar",
    description: "Video de negación + solución. Formato probado. Fácil de producir.",
    tags: ["Tutorial", "YouTube"],
    priority: "media",
    date: "ayer",
    starred: false,
    trending: false,
  },
  {
    id: 4,
    title: "De 0 a 10K suscriptores usando SOLO Shorts en 90 días",
    description: "Challenge personal. Documentar el proceso. Mucho potencial de serie.",
    tags: ["Shorts", "YouTube"],
    priority: "alta",
    date: "ayer",
    starred: false,
    trending: true,
  },
  {
    id: 5,
    title: "SEO para YouTube 2025: La guía definitiva",
    description: "Actualización del algoritmo. Keywords research incluido. Evergreen content.",
    tags: ["SEO", "Tutorial"],
    priority: "media",
    date: "hace 2 días",
    starred: false,
    trending: false,
  },
  {
    id: 6,
    title: "Por qué el 95% de canales no llegan a 1000 subs (y cómo evitarlo)",
    description: "Análisis de datos + soluciones. Formato de lista. Alta tasa de comentarios esperada.",
    tags: ["YouTube"],
    priority: "baja",
    date: "hace 3 días",
    starred: false,
    trending: false,
  },
];

const priorityColors: Record<string, string> = {
  alta: "#FF0033",
  media: "#F59E0B",
  baja: "#71717a",
};

export function IdeasPage() {
  const [activeTag, setActiveTag] = useState("Todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [starredIds, setStarredIds] = useState<Set<number>>(
    () => new Set(ideas.filter((i) => i.starred).map((i) => i.id))
  );
  const [localIdeas, setLocalIdeas] = useState(ideas);
  const [showNewIdea, setShowNewIdea] = useState(false);
  const [newIdeaTitle, setNewIdeaTitle] = useState("");
  const [newIdeaDesc, setNewIdeaDesc] = useState("");

  function handleCreateIdea() {
    if (!newIdeaTitle.trim()) return;
    const newIdea = {
      id: Date.now(),
      title: newIdeaTitle.trim(),
      description: newIdeaDesc.trim() || "Idea nueva — agrega una descripción.",
      tags: ["YouTube"],
      priority: "media" as const,
      date: "ahora",
      starred: false,
      trending: false,
    };
    setLocalIdeas((prev) => [newIdea, ...prev]);
    setNewIdeaTitle("");
    setNewIdeaDesc("");
    setShowNewIdea(false);
  }

  const filtered = localIdeas.filter((idea) => {
    const matchesTag = activeTag === "Todos" || idea.tags.includes(activeTag);
    const matchesSearch =
      !searchQuery ||
      idea.title.toLowerCase().includes(searchQuery.toLowerCase());
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

      {/* Ideas grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((idea) => (
          <Card
            key={idea.id}
            className="bg-[#141414] border-white/[0.08] p-5 hover:border-white/[0.14] hover:bg-[#181818] transition-all group cursor-pointer flex flex-col"
          >
            {/* Card header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2 flex-wrap">
                {idea.trending && (
                  <Badge className="text-[9px] px-1.5 py-0 bg-[#FF0033]/10 text-[#FF0033] border-[#FF0033]/20 gap-1">
                    <TrendingUp className="w-2.5 h-2.5" />
                    Trending
                  </Badge>
                )}
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: priorityColors[idea.priority] }}
                  title={`Prioridad ${idea.priority}`}
                />
                <span className="text-[10px] capitalize" style={{ color: priorityColors[idea.priority] }}>
                  {idea.priority}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setStarredIds((prev) => {
                      const next = new Set(prev);
                      if (next.has(idea.id)) next.delete(idea.id);
                      else next.add(idea.id);
                      return next;
                    });
                  }}
                  className={`transition-colors ${
                    starredIds.has(idea.id) ? "text-yellow-400" : "text-zinc-700 hover:text-yellow-400"
                  }`}
                >
                  <Star className="w-3.5 h-3.5" fill={starredIds.has(idea.id) ? "currentColor" : "none"} />
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
                    <DropdownMenuItem className="text-sm hover:bg-white/[0.05] gap-2 cursor-pointer text-red-400">
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
                <span className="text-[10px]">{idea.date}</span>
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
                disabled={!newIdeaTitle.trim()}
                className="flex-1 bg-[#FF0033] hover:bg-[#e8002e] text-white disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_16px_rgba(255,0,51,0.2)] transition-all"
              >
                Guardar idea
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

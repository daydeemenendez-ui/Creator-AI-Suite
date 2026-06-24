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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  baja: "#888",
};

export function IdeasPage() {
  const [activeTag, setActiveTag] = useState("Todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");

  const filtered = ideas.filter((idea) => {
    const matchesTag = activeTag === "Todos" || idea.tags.includes(activeTag);
    const matchesSearch =
      !searchQuery ||
      idea.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTag && matchesSearch;
  });

  return (
    <div className="p-6 space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Lightbulb className="w-6 h-6 text-[#FF0033]" />
            Banco de Ideas
          </h1>
          <p className="text-[#888] text-sm mt-0.5">{ideas.length} ideas guardadas</p>
        </div>
        <Button className="bg-[#FF0033] hover:bg-[#CC0029] text-white gap-2 shadow-lg shadow-red-950/30">
          <Plus className="w-4 h-4" />
          Nueva idea
        </Button>
      </div>

      {/* Filters bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#666]" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar ideas..."
            className="pl-9 bg-[#171717] border-[#2A2A2A] text-white placeholder:text-[#444] text-sm h-9 w-56 focus:border-[#FF0033]/50"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full border transition-all ${
                activeTag === tag
                  ? "bg-[#FF0033]/15 border-[#FF0033]/40 text-white"
                  : "border-[#2A2A2A] text-[#888] hover:text-white hover:border-[#444]"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        <button className="ml-auto flex items-center gap-1.5 text-xs text-[#888] hover:text-white border border-[#2A2A2A] hover:border-[#444] rounded-lg px-3 py-1.5 transition-all">
          <Filter className="w-3 h-3" />
          Filtros
        </button>
      </div>

      {/* Ideas grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((idea) => (
          <Card
            key={idea.id}
            className="bg-[#171717] border-[#2A2A2A] p-5 hover:border-[#333] transition-all group cursor-pointer flex flex-col"
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
                <span
                  className="text-[10px] capitalize"
                  style={{ color: priorityColors[idea.priority] }}
                >
                  {idea.priority}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  className={`transition-colors ${
                    idea.starred ? "text-yellow-400" : "text-[#555] hover:text-yellow-400"
                  }`}
                >
                  <Star className="w-3.5 h-3.5" fill={idea.starred ? "currentColor" : "none"} />
                </button>
                <DropdownMenu>
                  <DropdownMenuTrigger className="text-[#555] hover:text-white transition-colors p-0.5 outline-none cursor-pointer">
                    <MoreHorizontal className="w-3.5 h-3.5" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-44 bg-[#1A1A1A] border-[#2A2A2A] text-white"
                  >
                    <DropdownMenuItem className="text-sm hover:bg-white/5 gap-2 cursor-pointer">
                      <FileText className="w-3.5 h-3.5" />
                      Convertir a guión
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-sm hover:bg-white/5 gap-2 cursor-pointer">
                      <Zap className="w-3.5 h-3.5" />
                      Convertir a post
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-sm hover:bg-white/5 gap-2 cursor-pointer">
                      <Mail className="w-3.5 h-3.5" />
                      Convertir a email
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-[#2A2A2A]" />
                    <DropdownMenuItem className="text-sm hover:bg-white/5 gap-2 cursor-pointer text-[#FF4444]">
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Title */}
            <h3 className="text-sm font-semibold text-white leading-5 mb-2 group-hover:text-[#FF0033] transition-colors">
              {idea.title}
            </h3>

            {/* Description */}
            <p className="text-xs text-[#777] leading-5 flex-1">{idea.description}</p>

            {/* Footer */}
            <div className="mt-4 pt-3 border-t border-[#222] flex items-center justify-between">
              <div className="flex items-center gap-2 flex-wrap">
                {idea.tags.map((tag) => (
                  <Badge
                    key={tag}
                    className="text-[10px] px-2 py-0 bg-[#1E1E1E] border-[#333] text-[#777]"
                  >
                    <Tag className="w-2 h-2 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center gap-1 text-[#555] flex-shrink-0 ml-2">
                <Clock className="w-3 h-3" />
                <span className="text-[10px]">{idea.date}</span>
              </div>
            </div>

            {/* Convert actions */}
            <div className="mt-3 flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 h-7 text-xs text-[#888] hover:text-white border border-[#2A2A2A] hover:border-[#FF0033]/30 gap-1"
              >
                <FileText className="w-3 h-3" />
                → Guión
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 h-7 text-xs text-[#888] hover:text-white border border-[#2A2A2A] hover:border-[#FF0033]/30 gap-1"
              >
                <Zap className="w-3 h-3" />
                → Post
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-[#888] hover:text-white border border-[#2A2A2A] hover:border-[#FF0033]/30"
              >
                <ArrowRight className="w-3 h-3" />
              </Button>
            </div>
          </Card>
        ))}

        {/* Add new idea card */}
        <Card className="bg-[#131313] border-[#2A2A2A] border-dashed p-5 hover:border-[#FF0033]/30 hover:bg-[#FF0033]/3 transition-all group cursor-pointer flex flex-col items-center justify-center min-h-[180px]">
          <div className="w-10 h-10 rounded-xl bg-[#FF0033]/10 flex items-center justify-center mb-3 group-hover:bg-[#FF0033]/20 transition-colors">
            <Plus className="w-5 h-5 text-[#FF0033]" />
          </div>
          <p className="text-sm font-semibold text-[#888] group-hover:text-white transition-colors">
            Nueva idea
          </p>
          <p className="text-xs text-[#555] mt-1">Haz clic para agregar</p>
        </Card>
      </div>
    </div>
  );
}

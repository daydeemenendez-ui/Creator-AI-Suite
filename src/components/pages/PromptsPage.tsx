"use client";

import { useState } from "react";
import { Copy, Check, Search, Plus, Star, Tag, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const CATEGORIES = ["Todos", "YouTube", "Guiones", "SEO", "Redes", "Email", "Ideas"];

const PROMPTS = [
  {
    id: 1, category: "YouTube", title: "Gancho de apertura viral",
    text: "Escribe 5 ganchos de apertura para un video sobre [TEMA]. Cada gancho debe crear curiosidad o urgencia en los primeros 5 segundos. El público objetivo es [AUDIENCIA].",
    starred: true,
  },
  {
    id: 2, category: "Guiones", title: "Guión completo estructura PRO",
    text: "Crea un guión completo de [DURACIÓN] minutos sobre [TEMA]. Incluye: gancho (0-30s), presentación del problema, desarrollo con 3 puntos clave, ejemplos prácticos y CTA final. Tono: [TONO].",
    starred: true,
  },
  {
    id: 3, category: "SEO", title: "Descripción SEO para YouTube",
    text: "Escribe una descripción optimizada para SEO de un video de YouTube sobre [TEMA]. Incluye la keyword principal en el primer párrafo, 3-5 keywords secundarias, timestamps y CTA. Máximo 400 palabras.",
    starred: false,
  },
  {
    id: 4, category: "Ideas", title: "10 ideas de video con alto CTR",
    text: "Genera 10 ideas de video para un canal de [NICHO]. Cada idea debe incluir: título con alta probabilidad de click, descripción de 2 líneas, formato sugerido (short/largo/serie) y nivel de dificultad de producción.",
    starred: false,
  },
  {
    id: 5, category: "Redes", title: "Hilo de Twitter/X viral",
    text: "Convierte este contenido de video en un hilo de Twitter de 8-10 tweets: [CONTENIDO]. El primer tweet debe ser el gancho. Cada tweet debe poder leerse de forma independiente. Incluye emojis relevantes.",
    starred: false,
  },
  {
    id: 6, category: "Email", title: "Email newsletter de nuevo video",
    text: "Escribe un email para mi lista de suscriptores anunciando mi nuevo video sobre [TEMA]. Incluye: asunto atractivo, preview text, 2 párrafos de contexto, 3 puntos que aprenderán y botón CTA. Tono [TONO].",
    starred: true,
  },
  {
    id: 7, category: "SEO", title: "Keywords para YouTube",
    text: "Encuentra 20 keywords para YouTube relacionadas con [TEMA]. Clasifícalas en: alta competencia, media y baja. Para cada una indica el tipo de intención de búsqueda y si es adecuada para el título, descripción o tags.",
    starred: false,
  },
  {
    id: 8, category: "Guiones", title: "Script de Shorts (60 segundos)",
    text: "Crea un script para un YouTube Short de máximo 60 segundos sobre [TEMA]. Estructura: gancho (0-3s) → problema o dato sorprendente (3-15s) → solución o revelación (15-50s) → CTA (50-60s). Sin introducciones.",
    starred: false,
  },
];

export function PromptsPage() {
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState<number | null>(null);
  const [starredIds, setStarredIds] = useState<Set<number>>(
    () => new Set(PROMPTS.filter((p) => p.starred).map((p) => p.id))
  );

  const filtered = PROMPTS.filter((p) => {
    const matchesCat = activeCategory === "Todos" || p.category === activeCategory;
    const matchesSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.text.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  function handleCopy(id: number, text: string) {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(id);
    setTimeout(() => setCopied(null), 1800);
  }

  function toggleStar(id: number) {
    setStarredIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="p-6 space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-[#FF0033]" />
            Prompt Library
          </h1>
          <p className="text-[#888] text-sm mt-0.5">{PROMPTS.length} prompts optimizados para creadores</p>
        </div>
        <Button className="bg-[#FF0033] hover:bg-[#CC0029] text-white gap-2 shadow-lg shadow-red-950/30">
          <Plus className="w-4 h-4" />
          Nuevo prompt
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#666]" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar prompts..."
            className="pl-9 bg-[#171717] border-[#2A2A2A] text-white placeholder:text-[#444] text-sm h-9 w-56 focus:border-[#FF0033]/50"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full border transition-all ${
                activeCategory === cat
                  ? "bg-[#FF0033]/15 border-[#FF0033]/40 text-white"
                  : "border-[#2A2A2A] text-[#888] hover:text-white hover:border-[#444]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((prompt) => (
          <Card key={prompt.id} className="bg-[#171717] border-[#2A2A2A] p-5 flex flex-col gap-3 hover:border-[#333] transition-colors group">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Badge className="text-[10px] bg-[#FF0033]/10 text-[#FF0033] border-[#FF0033]/20">
                  <Tag className="w-2.5 h-2.5 mr-1" />
                  {prompt.category}
                </Badge>
              </div>
              <button
                onClick={() => toggleStar(prompt.id)}
                className={`transition-colors ${starredIds.has(prompt.id) ? "text-yellow-400" : "text-[#555] hover:text-yellow-400"}`}
              >
                <Star className="w-4 h-4" fill={starredIds.has(prompt.id) ? "currentColor" : "none"} />
              </button>
            </div>

            <h3 className="text-sm font-semibold text-white group-hover:text-[#FF0033] transition-colors">
              {prompt.title}
            </h3>

            <p className="text-xs text-[#777] leading-5 flex-1 font-mono bg-[#131313] rounded-lg p-3 border border-[#222]">
              {prompt.text}
            </p>

            <button
              onClick={() => handleCopy(prompt.id, prompt.text)}
              className={`flex items-center justify-center gap-2 w-full py-2 rounded-lg text-xs border transition-all ${
                copied === prompt.id
                  ? "bg-green-500/10 border-green-500/30 text-green-400"
                  : "border-[#2A2A2A] text-[#888] hover:text-white hover:border-[#FF0033]/30 hover:bg-[#FF0033]/5"
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
      </div>
    </div>
  );
}

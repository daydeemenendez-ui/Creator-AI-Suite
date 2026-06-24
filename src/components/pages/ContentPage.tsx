"use client";

import { useState } from "react";
import {
  Send,
  FileText,
  Lightbulb,
  Scissors,
  Search,
  Mail,
  Wand2,
  Copy,
  Download,
  RefreshCw,
  Sparkles,
  Bot,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const contentTypes = [
  { icon: Lightbulb, label: "Ideas", count: 12, color: "#F59E0B" },
  { icon: FileText, label: "Guiones", count: 5, color: "#3B82F6" },
  { icon: Scissors, label: "Shorts", count: 8, color: "#A855F7" },
  { icon: Search, label: "SEO Pack", count: 3, color: "#10B981" },
  { icon: Mail, label: "Email", count: 2, color: "#FF6B00" },
  { icon: FileText, label: "Posts", count: 6, color: "#EC4899" },
];

const chatHistory = [
  {
    role: "assistant",
    content:
      "¡Hola! Soy tu asistente de contenido IA. Puedo ayudarte a crear guiones, ideas de videos, posts para redes sociales, descripciones SEO y mucho más. ¿Con qué quieres empezar?",
  },
  {
    role: "user",
    content:
      "Genera 5 ideas para videos sobre productividad para YouTubers basadas en las tendencias de 2025.",
  },
  {
    role: "assistant",
    content: `Aquí tienes 5 ideas de alto potencial para tu canal:

**1. "La Rutina Matutina del YouTuber Exitoso en 2025"**
↳ Sistema de 90 minutos que maximiza la creación. CTR potencial muy alto.

**2. "Cómo Automaticé 80% de Mi Canal con IA"**
↳ Tutorial práctico mostrando herramientas reales. Trending topic.

**3. "El Stack de Apps que Uso Para 3 Videos a la Semana"**
↳ Video de herramientas — alto CPM, fácil de monetizar.

**4. "Por Qué Dejé de Hacer Videos Perfectos (Y Tripling Mi Canal)"**
↳ Historia personal + estrategia. Alta retención esperada.

**5. "Script → Video en 4 Horas: Mi Proceso Completo"**
↳ Behind-the-scenes + productividad. Muy compartible.

¿Quieres que desarrolle alguna de estas ideas en un guión completo?`,
  },
];

export function ContentPage() {
  const [message, setMessage] = useState("");
  const [activeContent, setActiveContent] = useState("ideas");

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left sidebar - Content types */}
      <div className="w-64 flex-shrink-0 border-r border-[#2A2A2A] bg-[#111111] flex flex-col">
        <div className="p-5 border-b border-[#2A2A2A]">
          <h2 className="font-bold text-white text-base">Content Studio</h2>
          <p className="text-xs text-[#666] mt-0.5">Genera cualquier tipo de contenido</p>
        </div>

        <div className="p-3 space-y-1.5 flex-1 overflow-y-auto">
          <p className="text-[10px] font-semibold text-[#555] uppercase tracking-wider px-2 mb-2">
            Tipo de contenido
          </p>
          {contentTypes.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.label}
                onClick={() => setActiveContent(type.label.toLowerCase())}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left ${
                  activeContent === type.label.toLowerCase()
                    ? "bg-[#1E1E1E] border border-[#333]"
                    : "hover:bg-white/5"
                }`}
              >
                <div
                  className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
                  style={{ background: `${type.color}15` }}
                >
                  <Icon className="w-3.5 h-3.5" style={{ color: type.color, width: 14, height: 14 }} />
                </div>
                <span className="text-sm text-white flex-1">{type.label}</span>
                <Badge className="text-[10px] bg-[#2A2A2A] border-[#333] text-[#888]">
                  {type.count}
                </Badge>
              </button>
            );
          })}

          <div className="pt-4">
            <Button
              className="w-full bg-[#FF0033]/10 hover:bg-[#FF0033]/20 text-[#FF0033] border border-[#FF0033]/20 gap-2 text-sm"
            >
              <Wand2 className="w-3.5 h-3.5" />
              Generar nuevo
            </Button>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Tabs defaultValue="chat" className="flex-1 flex flex-col overflow-hidden">
          <div className="border-b border-[#2A2A2A] px-6 bg-[#111111]/30 flex items-center justify-between">
            <TabsList className="bg-transparent gap-1 h-auto py-2">
              <TabsTrigger
                value="chat"
                className="data-[state=active]:bg-[#FF0033]/15 data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-[#FF0033] rounded-none text-[#888] text-sm px-4 py-1.5"
              >
                Chat IA
              </TabsTrigger>
              <TabsTrigger
                value="library"
                className="data-[state=active]:bg-[#FF0033]/15 data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-[#FF0033] rounded-none text-[#888] text-sm px-4 py-1.5"
              >
                Biblioteca
              </TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-2 py-2">
              <Badge className="text-[10px] bg-green-500/10 text-green-400 border-green-500/20">
                Claude Sonnet
              </Badge>
            </div>
          </div>

          {/* Chat Tab */}
          <TabsContent value="chat" className="flex-1 flex flex-col overflow-hidden m-0">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {chatHistory.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                      msg.role === "assistant"
                        ? "bg-[#FF0033]/15 border border-[#FF0033]/30"
                        : "bg-[#1E1E1E] border border-[#333]"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <Bot className="w-4 h-4 text-[#FF0033]" />
                    ) : (
                      <User className="w-4 h-4 text-[#888]" />
                    )}
                  </div>
                  <div
                    className={`max-w-2xl rounded-2xl px-4 py-3 ${
                      msg.role === "assistant"
                        ? "bg-[#171717] border border-[#2A2A2A] rounded-tl-sm"
                        : "bg-[#FF0033]/10 border border-[#FF0033]/20 rounded-tr-sm"
                    }`}
                  >
                    <p
                      className="text-sm text-[#E0E0E0] leading-6 whitespace-pre-line"
                      dangerouslySetInnerHTML={{
                        __html: msg.content
                          .replace(/\*\*(.*?)\*\*/g, "<strong class='text-white'>$1</strong>")
                          .replace(/↳/g, "<span class='text-[#666]'>↳</span>"),
                      }}
                    />
                    {msg.role === "assistant" && (
                      <div className="flex items-center gap-2 mt-3 pt-2 border-t border-[#222]">
                        <button className="flex items-center gap-1.5 text-[11px] text-[#666] hover:text-white transition-colors">
                          <Copy className="w-3 h-3" />
                          Copiar
                        </button>
                        <button className="flex items-center gap-1.5 text-[11px] text-[#666] hover:text-white transition-colors">
                          <RefreshCw className="w-3 h-3" />
                          Regenerar
                        </button>
                        <button className="flex items-center gap-1.5 text-[11px] text-[#666] hover:text-white transition-colors">
                          <Download className="w-3 h-3" />
                          Exportar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
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
                  className="flex-shrink-0 text-xs text-[#888] hover:text-white border border-[#2A2A2A] hover:border-[#FF0033]/40 rounded-full px-3 py-1.5 transition-all"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-[#2A2A2A] bg-[#111111]/50">
              <div className="flex gap-3 items-end">
                <div className="flex-1 relative">
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe qué contenido necesitas generar..."
                    className="bg-[#1A1A1A] border-[#2A2A2A] text-white placeholder:text-[#444] text-sm resize-none min-h-[44px] max-h-32 focus:border-[#FF0033]/40 pr-12"
                    rows={1}
                  />
                  <button className="absolute right-3 bottom-3">
                    <Sparkles className="w-4 h-4 text-[#555] hover:text-[#FF0033] transition-colors" />
                  </button>
                </div>
                <Button
                  className="bg-[#FF0033] hover:bg-[#CC0029] text-white h-11 w-11 p-0 flex-shrink-0 shadow-lg shadow-red-950/30"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Library Tab */}
          <TabsContent value="library" className="flex-1 overflow-y-auto m-0 p-6">
            <div className="grid grid-cols-2 gap-4">
              {[
                { title: "Guión: Cómo usar IA en 2025", type: "Guión", date: "hoy", words: 1240 },
                { title: "5 Ideas Trending YouTube", type: "Ideas", date: "ayer", words: 430 },
                { title: "Descripción SEO Canal", type: "SEO", date: "ayer", words: 280 },
                { title: "Email de Bienvenida", type: "Email", date: "hace 2 días", words: 350 },
              ].map((item) => (
                <Card
                  key={item.title}
                  className="bg-[#171717] border-[#2A2A2A] p-4 hover:border-[#333] cursor-pointer transition-colors group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <Badge className="text-[10px] bg-[#FF0033]/10 text-[#FF0033] border-[#FF0033]/20">
                      {item.type}
                    </Badge>
                    <span className="text-[11px] text-[#555]">{item.date}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-white mb-2 group-hover:text-[#FF0033] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-[#666]">{item.words} palabras</p>
                  <div className="flex gap-2 mt-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1 h-7 text-xs text-[#888] hover:text-white border border-[#2A2A2A]"
                    >
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-[#888] hover:text-white border border-[#2A2A2A]"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

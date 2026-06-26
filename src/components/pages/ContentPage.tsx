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
  { icon: Lightbulb, label: "Ideas",   count: 12, color: "#F59E0B" },
  { icon: FileText,  label: "Guiones", count: 5,  color: "#3B82F6" },
  { icon: Scissors,  label: "Shorts",  count: 8,  color: "#A855F7" },
  { icon: Search,    label: "SEO Pack",count: 3,  color: "#10B981" },
  { icon: Mail,      label: "Email",   count: 2,  color: "#FF6B00" },
  { icon: FileText,  label: "Posts",   count: 6,  color: "#EC4899" },
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
  const [messages, setMessages] = useState(chatHistory);

  function handleSend() {
    const text = message.trim();
    if (!text) return;
    const userMsg = { role: "user" as const, content: text };
    const assistantMsg = {
      role: "assistant" as const,
      content: "Procesando tu solicitud con IA... (conecta OpenRouter para respuestas reales)",
    };
    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setMessage("");
  }

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
          {contentTypes.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.label}
                onClick={() => setActiveContent(type.label.toLowerCase())}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left ${
                  activeContent === type.label.toLowerCase()
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
                  {type.count}
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
        <Tabs defaultValue="chat" className="flex-1 flex flex-col overflow-hidden">
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
                Claude Sonnet
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
                      <div className="flex items-center gap-2 mt-3 pt-2 border-t border-white/[0.05]">
                        <button className="flex items-center gap-1.5 text-[11px] text-zinc-600 hover:text-white transition-colors">
                          <Copy className="w-3 h-3" />
                          Copiar
                        </button>
                        <button className="flex items-center gap-1.5 text-[11px] text-zinc-600 hover:text-white transition-colors">
                          <RefreshCw className="w-3 h-3" />
                          Regenerar
                        </button>
                        <button className="flex items-center gap-1.5 text-[11px] text-zinc-600 hover:text-white transition-colors">
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
                  disabled={!message.trim()}
                  className="bg-[#FF0033] hover:bg-[#e8002e] text-white h-11 w-11 p-0 flex-shrink-0 shadow-[0_0_16px_rgba(255,0,51,0.2)] hover:shadow-[0_0_20px_rgba(255,0,51,0.3)] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
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
                { title: "Guión: Cómo usar IA en 2025", type: "Guión", date: "hoy",         words: 1240 },
                { title: "5 Ideas Trending YouTube",     type: "Ideas", date: "ayer",         words: 430  },
                { title: "Descripción SEO Canal",        type: "SEO",   date: "ayer",         words: 280  },
                { title: "Email de Bienvenida",          type: "Email", date: "hace 2 días",  words: 350  },
              ].map((item) => (
                <Card
                  key={item.title}
                  className="bg-[#141414] border-white/[0.08] p-4 hover:border-white/[0.14] hover:bg-[#181818] cursor-pointer transition-all group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <Badge className="text-[10px] bg-[#FF0033]/10 text-[#FF0033] border-[#FF0033]/20">
                      {item.type}
                    </Badge>
                    <span className="text-[11px] text-zinc-600">{item.date}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-white mb-2 group-hover:text-[#FF0033] transition-colors tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-zinc-600">{item.words} palabras</p>
                  <div className="flex gap-2 mt-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1 h-7 text-xs text-zinc-600 hover:text-white border border-white/[0.08] hover:border-white/[0.14]"
                    >
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-zinc-600 hover:text-white border border-white/[0.08] hover:border-white/[0.14]"
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

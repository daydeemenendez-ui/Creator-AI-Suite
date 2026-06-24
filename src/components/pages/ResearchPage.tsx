"use client";

import { useState } from "react";
import {
  Link2,
  Upload,
  Lock,
  Copy,
  Download,
  RefreshCw,
  Wand2,
  Video,
  FileAudio,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

const mockTranscription = `[00:00:01] Hola a todos, bienvenidos a este video donde vamos a hablar sobre las mejores estrategias para hacer crecer tu canal de YouTube en 2025.

[00:00:12] En los últimos años, el algoritmo de YouTube ha cambiado dramáticamente, y lo que funcionaba antes ya no es suficiente. Hoy vamos a ver qué necesitas hacer diferente.

[00:00:28] Lo primero y más importante es la retención de audiencia. YouTube premia los videos que mantienen a la gente viendo. Si tus espectadores se van en los primeros 30 segundos, tu video no va a ser recomendado.

[00:00:45] La segunda estrategia es optimizar tu miniatura y título para el CTR. Un buen CTR combinado con alta retención es la fórmula perfecta para el algoritmo.

[00:01:02] Tercer punto: consistencia. No se trata solo de publicar frecuentemente, sino de publicar en los momentos donde tu audiencia está activa.

[00:01:18] Y por último, los primeros 30 minutos después de publicar son cruciales. Necesitas generar engagement inmediato compartiendo en redes sociales y comunidades relevantes.`;

const aiOutputs = [
  { label: "Ideas de videos", count: 8 },
  { label: "Guión principal", count: 1 },
  { label: "Shorts ideas", count: 5 },
  { label: "Post para LinkedIn", count: 1 },
  { label: "Hilos de Twitter", count: 3 },
  { label: "Descripción SEO", count: 1 },
];

export function ResearchPage() {
  const [url, setUrl] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzed, setIsAnalyzed] = useState(true); // Show analyzed state for demo

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left Panel - Input */}
      <div className="w-80 flex-shrink-0 border-r border-[#2A2A2A] bg-[#111111] flex flex-col">
        <div className="p-5 border-b border-[#2A2A2A]">
          <h2 className="font-bold text-white text-base">Research Studio</h2>
          <p className="text-xs text-[#666] mt-0.5">Analiza cualquier contenido de video</p>
        </div>

        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
          {/* URL Input */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#888] uppercase tracking-wider flex items-center gap-2">
              <Video className="w-3.5 h-3.5 text-[#FF0033]" />
              URL de YouTube
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#666]" />
                <Input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  className="pl-9 bg-[#1A1A1A] border-[#2A2A2A] text-white placeholder:text-[#444] text-sm h-9 focus:border-[#FF0033]/50 focus:ring-[#FF0033]/20"
                />
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-[#222]" />
            <span className="text-[11px] text-[#555]">o sube un archivo</span>
            <div className="flex-1 h-px bg-[#222]" />
          </div>

          {/* Drag & Drop */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => { e.preventDefault(); setIsDragging(false); }}
            className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
              isDragging
                ? "border-[#FF0033] bg-[#FF0033]/5"
                : "border-[#2A2A2A] hover:border-[#FF0033]/40 hover:bg-[#FF0033]/3"
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-[#FF0033]/10 flex items-center justify-center mx-auto mb-3">
              <Upload className="w-5 h-5 text-[#FF0033]" />
            </div>
            <p className="text-sm font-medium text-white">Arrastra tu archivo aquí</p>
            <p className="text-xs text-[#666] mt-1">MP4, MP3, WAV — hasta 500MB</p>
            <div className="flex items-center justify-center gap-2 mt-3">
              {["MP4", "MP3", "WAV"].map((ext) => (
                <Badge
                  key={ext}
                  className="text-[10px] bg-[#1E1E1E] border-[#333] text-[#888]"
                >
                  {ext}
                </Badge>
              ))}
            </div>
          </div>

          {/* File icon hint */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1A1A1A] border border-[#2A2A2A]">
            <FileAudio className="w-4 h-4 text-[#666]" />
            <span className="text-xs text-[#666]">Ningún archivo seleccionado</span>
          </div>

          <Button
            className="w-full bg-[#FF0033] hover:bg-[#CC0029] text-white shadow-lg shadow-red-950/30 gap-2"
            onClick={() => setIsAnalyzed(true)}
          >
            <Wand2 className="w-4 h-4" />
            Analizar contenido
          </Button>

          {/* Previous analyses */}
          {isAnalyzed && (
            <div className="space-y-2">
              <p className="text-[10px] font-semibold text-[#555] uppercase tracking-wider">
                Análisis recientes
              </p>
              {[
                "YouTube Growth 2025",
                "SEO Tips for Creators",
                "Monetization Guide",
              ].map((item) => (
                <button
                  key={item}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 text-left transition-colors"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-[#FF0033]" />
                  <span className="text-xs text-[#888] hover:text-white transition-colors flex-1 truncate">
                    {item}
                  </span>
                  <ChevronRight className="w-3 h-3 text-[#555]" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Results */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {isAnalyzed ? (
          <>
            {/* Video info bar */}
            <div className="border-b border-[#2A2A2A] px-6 py-3 bg-[#111111]/50 flex items-center gap-4">
              <div className="w-16 h-10 rounded bg-[#1E1E1E] border border-[#2A2A2A] flex items-center justify-center flex-shrink-0">
                <Video className="w-5 h-5 text-[#FF0033]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  10 Estrategias para Crecer en YouTube en 2025
                </p>
                <p className="text-xs text-[#666]">Canal Principal • 12:34 min • 45K vistas</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="text-[10px] bg-green-500/10 text-green-400 border-green-500/20">
                  Analizado
                </Badge>
                <Button variant="ghost" size="sm" className="text-[#888] hover:text-white h-7 px-2">
                  <RefreshCw className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            <Tabs defaultValue="transcription" className="flex-1 flex flex-col overflow-hidden">
              <div className="border-b border-[#2A2A2A] px-6 bg-[#111111]/30">
                <TabsList className="bg-transparent gap-1 h-auto py-2">
                  {["transcription", "workspace", "outputs"].map((tab) => (
                    <TabsTrigger
                      key={tab}
                      value={tab}
                      className="data-[state=active]:bg-[#FF0033]/15 data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-[#FF0033] rounded-none text-[#888] text-sm px-4 py-1.5 capitalize"
                    >
                      {tab === "transcription"
                        ? "Transcripción Original"
                        : tab === "workspace"
                        ? "Workspace"
                        : "Outputs"}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {/* Transcription Tab - LOCKED */}
              <TabsContent value="transcription" className="flex-1 overflow-hidden m-0">
                <div className="flex flex-col h-full">
                  {/* Lock banner */}
                  <div className="flex items-center gap-3 px-6 py-3 bg-[#1A1A1A] border-b border-[#2A2A2A]">
                    <div className="w-6 h-6 rounded-md bg-[#FF0033]/10 flex items-center justify-center">
                      <Lock className="w-3.5 h-3.5 text-[#FF0033]" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white">Transcripción Original — Solo lectura</p>
                      <p className="text-[11px] text-[#666]">
                        Este bloque está protegido. Usa el Workspace para editar.
                      </p>
                    </div>
                    <div className="ml-auto flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[#888] hover:text-white h-7 px-2 gap-1.5"
                      >
                        <Copy className="w-3 h-3" />
                        <span className="text-xs">Copiar</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[#888] hover:text-white h-7 px-2 gap-1.5"
                      >
                        <Download className="w-3 h-3" />
                        <span className="text-xs">Exportar</span>
                      </Button>
                    </div>
                  </div>

                  {/* Locked transcription block */}
                  <div className="flex-1 overflow-y-auto p-6">
                    <div className="relative rounded-xl border border-[#2A2A2A] bg-[#131313] overflow-hidden">
                      {/* Overlay lock pattern */}
                      <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-0 right-0 w-full h-full opacity-5"
                          style={{
                            backgroundImage: "repeating-linear-gradient(45deg, #FF0033 0, #FF0033 1px, transparent 0, transparent 50%)",
                            backgroundSize: "10px 10px",
                          }}
                        />
                      </div>
                      {/* Corner lock badge */}
                      <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 rounded-md bg-[#FF0033]/15 border border-[#FF0033]/30">
                        <Lock className="w-2.5 h-2.5 text-[#FF0033]" />
                        <span className="text-[10px] font-semibold text-[#FF0033]">PROTEGIDO</span>
                      </div>
                      <div className="p-5 select-none opacity-80">
                        {mockTranscription.split("\n\n").map((para, i) => (
                          <p
                            key={i}
                            className="text-sm text-[#999] leading-7 mb-4 font-mono"
                          >
                            {para}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Workspace Tab */}
              <TabsContent value="workspace" className="flex-1 overflow-hidden m-0 p-6">
                <div className="h-full flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-white">Workspace editable</p>
                    <Button size="sm" className="bg-[#FF0033] hover:bg-[#CC0029] text-white h-7 text-xs gap-1.5">
                      <Wand2 className="w-3 h-3" />
                      Generar con IA
                    </Button>
                  </div>
                  <Textarea
                    className="flex-1 bg-[#131313] border-[#2A2A2A] text-[#E0E0E0] text-sm leading-7 resize-none focus:border-[#FF0033]/40 font-mono"
                    placeholder="El contenido analizado aparecerá aquí para que puedas editarlo, agregar notas y trabajar con la IA..."
                    defaultValue={mockTranscription}
                  />
                </div>
              </TabsContent>

              {/* Outputs Tab */}
              <TabsContent value="outputs" className="flex-1 overflow-y-auto m-0 p-6">
                <div className="space-y-4">
                  <p className="text-sm font-semibold text-white">Contenido generado por IA</p>
                  <div className="grid grid-cols-2 gap-3">
                    {aiOutputs.map((output) => (
                      <Card
                        key={output.label}
                        className="bg-[#171717] border-[#2A2A2A] p-4 hover:border-[#FF0033]/30 cursor-pointer transition-colors group"
                      >
                        <div className="flex items-start justify-between">
                          <p className="text-sm font-medium text-white">{output.label}</p>
                          <Badge className="text-[10px] bg-[#FF0033]/10 text-[#FF0033] border-[#FF0033]/20">
                            {output.count}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-3 w-full text-xs text-[#888] hover:text-white border border-[#2A2A2A] hover:border-[#FF0033]/30 h-7"
                        >
                          Ver y editar
                        </Button>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#FF0033]/10 flex items-center justify-center mx-auto mb-4">
                <Video className="w-8 h-8 text-[#FF0033]" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Listo para analizar</h3>
              <p className="text-sm text-[#666] max-w-xs">
                Ingresa una URL de YouTube o sube un archivo de audio/video para comenzar el análisis.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

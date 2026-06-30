"use client";

import { useState, useRef } from "react";
import {
  Link2, Upload, Lock, Copy, Download, RefreshCw, Wand2, Video, FileAudio, ChevronRight, X,
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
  { label: "Ideas de videos",    count: 8 },
  { label: "Guión principal",    count: 1 },
  { label: "Shorts ideas",       count: 5 },
  { label: "Post para LinkedIn", count: 1 },
  { label: "Hilos de Twitter",   count: 3 },
  { label: "Descripción SEO",    count: 1 },
];

export function ResearchPage() {
  const [url, setUrl] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzed, setIsAnalyzed] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [urlError, setUrlError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  function isValidYouTubeUrl(value: string) {
    return /^https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]+/.test(value.trim());
  }

  function handleFileSelect(file: File) {
    const allowed = ["video/mp4", "audio/mpeg", "audio/wav", "audio/mp3", "video/quicktime"];
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!allowed.includes(file.type) && !["mp4", "mp3", "wav", "m4a"].includes(ext ?? "")) return;
    setSelectedFile(file);
    setUrl("");
    setUrlError("");
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }

  function handleAnalyze() {
    if (!selectedFile && !url.trim()) {
      setUrlError("Ingresa una URL de YouTube o sube un archivo.");
      return;
    }
    if (url.trim() && !isValidYouTubeUrl(url)) {
      setUrlError("La URL no es válida. Usa un enlace de YouTube.");
      return;
    }
    setUrlError("");
    setIsAnalyzed(true);
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left Panel */}
      <div className="w-80 flex-shrink-0 border-r border-white/[0.07] bg-[#0d0d0d] flex flex-col">
        <div className="p-5 border-b border-white/[0.07]">
          <h2 className="font-bold text-white text-base tracking-tight">Research Studio</h2>
          <p className="text-xs text-zinc-600 mt-0.5">Analiza cualquier contenido de video</p>
        </div>

        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
          {/* URL Input */}
          <div className="space-y-2">
            <label className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider flex items-center gap-2">
              <Video className="w-3.5 h-3.5 text-[#FF0033]" />
              URL de YouTube
            </label>
            <div className="relative">
              <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
              <Input
                value={url}
                onChange={(e) => { setUrl(e.target.value); setUrlError(""); setSelectedFile(null); }}
                placeholder="https://youtube.com/watch?v=..."
                className={`pl-9 bg-[#141414] border-white/10 text-white placeholder:text-zinc-700 text-sm h-9 focus:border-[#FF0033]/40 ${urlError ? "border-red-500/60" : ""}`}
              />
            </div>
            {urlError && <p className="text-[11px] text-red-400">{urlError}</p>}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/[0.06]" />
            <span className="text-[11px] text-zinc-700">o sube un archivo</span>
            <div className="flex-1 h-px bg-white/[0.06]" />
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".mp4,.mp3,.wav,.m4a,video/mp4,audio/mpeg,audio/wav"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }}
          />

          {/* Drag & Drop */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragging(false); }}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
              isDragging
                ? "border-[#FF0033] bg-[#FF0033]/5"
                : "border-white/[0.08] hover:border-[#FF0033]/30 hover:bg-[#FF0033]/[0.02]"
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-[#FF0033]/10 flex items-center justify-center mx-auto mb-3">
              <Upload className="w-5 h-5 text-[#FF0033]" />
            </div>
            <p className="text-sm font-medium text-zinc-300">Arrastra tu archivo aquí</p>
            <p className="text-xs text-zinc-600 mt-1">o haz clic para seleccionar</p>
            <div className="flex items-center justify-center gap-2 mt-3">
              {["MP4", "MP3", "WAV"].map((ext) => (
                <Badge key={ext} className="text-[10px] bg-white/[0.04] border-white/[0.08] text-zinc-500">
                  {ext}
                </Badge>
              ))}
            </div>
          </div>

          {/* File hint */}
          {selectedFile ? (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[#141414] border border-[#FF0033]/20">
              <FileAudio className="w-4 h-4 text-[#FF0033] flex-shrink-0" />
              <span className="text-xs text-zinc-300 truncate flex-1">{selectedFile.name}</span>
              <button
                onClick={(e) => { e.stopPropagation(); setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                className="text-zinc-600 hover:text-white transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[#141414] border border-white/[0.07]">
              <FileAudio className="w-4 h-4 text-zinc-600" />
              <span className="text-xs text-zinc-600">Ningún archivo seleccionado</span>
            </div>
          )}

          <Button
            className="w-full bg-[#FF0033] hover:bg-[#e8002e] text-white shadow-[0_0_16px_rgba(255,0,51,0.2)] hover:shadow-[0_0_20px_rgba(255,0,51,0.3)] gap-2 transition-all"
            onClick={handleAnalyze}
          >
            <Wand2 className="w-4 h-4" />
            Analizar contenido
          </Button>

          {/* Previous analyses */}
          {isAnalyzed && (
            <div className="space-y-1.5 pt-1">
              <p className="text-[10px] font-semibold text-zinc-700 uppercase tracking-wider">
                Análisis recientes
              </p>
              {["YouTube Growth 2025", "SEO Tips for Creators", "Monetization Guide"].map((item) => (
                <button
                  key={item}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/[0.04] text-left transition-colors"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-[#FF0033]" />
                  <span className="text-xs text-zinc-500 hover:text-zinc-200 transition-colors flex-1 truncate">
                    {item}
                  </span>
                  <ChevronRight className="w-3 h-3 text-zinc-700" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {isAnalyzed ? (
          <>
            {/* Video info bar */}
            <div className="border-b border-white/[0.07] px-6 py-3 bg-[#0d0d0d]/60 flex items-center gap-4">
              <div className="w-16 h-10 rounded-xl bg-[#141414] border border-white/[0.08] flex items-center justify-center flex-shrink-0">
                <Video className="w-5 h-5 text-[#FF0033]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate tracking-tight">
                  10 Estrategias para Crecer en YouTube en 2025
                </p>
                <p className="text-xs text-zinc-600">Canal Principal · 12:34 min · 45K vistas</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                  Analizado
                </Badge>
                <Button variant="ghost" size="sm" className="text-zinc-600 hover:text-white h-7 px-2">
                  <RefreshCw className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            <Tabs defaultValue="transcription" className="flex-1 flex flex-col overflow-hidden">
              <div className="border-b border-white/[0.07] px-6 bg-transparent">
                <TabsList className="bg-transparent gap-0 h-auto py-0">
                  {["transcription", "workspace", "outputs"].map((tab) => (
                    <TabsTrigger
                      key={tab}
                      value={tab}
                      className="data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-[#FF0033] data-[state=active]:shadow-none rounded-none text-zinc-500 hover:text-zinc-300 text-sm px-4 py-3 capitalize transition-colors"
                    >
                      {tab === "transcription" ? "Transcripción Original"
                        : tab === "workspace" ? "Workspace"
                        : "Outputs"}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {/* Transcription — LOCKED */}
              <TabsContent value="transcription" className="flex-1 overflow-hidden m-0">
                <div className="flex flex-col h-full">
                  <div className="flex items-center gap-3 px-6 py-3 bg-[#141414]/60 border-b border-white/[0.07]">
                    <div className="w-6 h-6 rounded-lg bg-[#FF0033]/10 flex items-center justify-center">
                      <Lock className="w-3.5 h-3.5 text-[#FF0033]" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-zinc-200">Transcripción Original — Solo lectura</p>
                      <p className="text-[11px] text-zinc-600">
                        Este bloque está protegido. Usa el Workspace para editar.
                      </p>
                    </div>
                    <div className="ml-auto flex gap-2">
                      <Button variant="ghost" size="sm" className="text-zinc-600 hover:text-white h-7 px-2 gap-1.5">
                        <Copy className="w-3 h-3" />
                        <span className="text-xs">Copiar</span>
                      </Button>
                      <Button variant="ghost" size="sm" className="text-zinc-600 hover:text-white h-7 px-2 gap-1.5">
                        <Download className="w-3 h-3" />
                        <span className="text-xs">Exportar</span>
                      </Button>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6">
                    <div className="relative rounded-xl border border-white/[0.07] bg-[#0f0f0f] overflow-hidden">
                      <div className="absolute inset-0 pointer-events-none">
                        <div
                          className="absolute top-0 right-0 w-full h-full opacity-[0.03]"
                          style={{
                            backgroundImage: "repeating-linear-gradient(45deg, #FF0033 0, #FF0033 1px, transparent 0, transparent 50%)",
                            backgroundSize: "10px 10px",
                          }}
                        />
                      </div>
                      <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#FF0033]/10 border border-[#FF0033]/20">
                        <Lock className="w-2.5 h-2.5 text-[#FF0033]" />
                        <span className="text-[10px] font-semibold text-[#FF0033] tracking-wide">PROTEGIDO</span>
                      </div>
                      <div className="p-5 select-none opacity-70">
                        {mockTranscription.split("\n\n").map((para, i) => (
                          <p key={i} className="text-sm text-zinc-500 leading-7 mb-4 font-mono">
                            {para}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Workspace */}
              <TabsContent value="workspace" className="flex-1 overflow-hidden m-0 p-6">
                <div className="h-full flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-white tracking-tight">Workspace editable</p>
                    <Button size="sm" className="bg-[#FF0033] hover:bg-[#e8002e] text-white h-7 text-xs gap-1.5 shadow-[0_0_12px_rgba(255,0,51,0.15)] transition-all">
                      <Wand2 className="w-3 h-3" />
                      Generar con IA
                    </Button>
                  </div>
                  <Textarea
                    className="flex-1 bg-[#111111] border-white/10 text-zinc-300 text-sm leading-7 resize-none focus:border-[#FF0033]/40 font-mono"
                    placeholder="El contenido analizado aparecerá aquí..."
                    defaultValue={mockTranscription}
                  />
                </div>
              </TabsContent>

              {/* Outputs */}
              <TabsContent value="outputs" className="flex-1 overflow-y-auto m-0 p-6">
                <div className="space-y-4">
                  <p className="text-sm font-semibold text-white tracking-tight">Contenido generado por IA</p>
                  <div className="grid grid-cols-2 gap-3">
                    {aiOutputs.map((output) => (
                      <Card
                        key={output.label}
                        className="bg-[#141414] border border-white/[0.08] p-4 hover:border-white/[0.14] hover:bg-[#181818] cursor-pointer transition-all group"
                      >
                        <div className="flex items-start justify-between">
                          <p className="text-sm font-medium text-zinc-200 tracking-tight">{output.label}</p>
                          <Badge className="text-[10px] bg-[#FF0033]/10 text-[#FF0033] border-[#FF0033]/20">
                            {output.count}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-3 w-full text-xs text-zinc-600 hover:text-white border border-white/[0.08] hover:border-white/[0.14] h-7"
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
              <div className="w-16 h-16 rounded-2xl bg-[#FF0033]/10 flex items-center justify-center mx-auto mb-5">
                <Video className="w-8 h-8 text-[#FF0033]" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2 tracking-tight">Listo para analizar</h3>
              <p className="text-sm text-zinc-600 max-w-xs">
                Ingresa una URL de YouTube o sube un archivo de audio/video para comenzar.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

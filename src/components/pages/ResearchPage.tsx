"use client";

import { useState, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Upload, Lock, Copy, Download, RefreshCw, Wand2, Video, FileAudio, ChevronRight, X, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

const aiOutputs = [
  { label: "Ideas de videos",    count: 8 },
  { label: "Guión principal",    count: 1 },
  { label: "Shorts ideas",       count: 5 },
  { label: "Post para LinkedIn", count: 1 },
  { label: "Hilos de Twitter",   count: 3 },
  { label: "Descripción SEO",    count: 1 },
];

interface AnalysisResult {
  transcriptId: string;
  sourceId: string;
  title?: string;
  wordCount?: number;
  originalText: string;
}

const ALLOWED_EXTS = ["mp4", "mp3", "wav", "m4a", "webm"];

export function ResearchPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [workspaceText, setWorkspaceText] = useState("");
  const [recentAnalyses, setRecentAnalyses] = useState<{ title: string; id: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!ALLOWED_EXTS.includes(ext)) {
      setError(`Formato .${ext} no soportado. Usa MP4, MP3, WAV o M4A.`);
      return;
    }
    setSelectedFile(file);
    setError("");
  }, []);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }

  async function handleAnalyze() {
    if (!selectedFile) {
      setError("Selecciona un archivo de video o audio primero.");
      return;
    }

    setError("");
    setLoading(true);
    setResult(null);

    try {
      // 1. Upload directly to Supabase Storage (bypasses Vercel's 4.5MB body limit)
      const supabase = createClient();
      const bucket = "creator-audios";
      const safeName = selectedFile.name
        .normalize("NFD").replace(/[̀-ͯ]/g, "")
        .replace(/[^a-zA-Z0-9._-]/g, "_");
      const storagePath = `audio/${Date.now()}-${safeName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(storagePath, selectedFile, { upsert: false });

      if (uploadError) {
        setError(`Error al subir el archivo: ${uploadError.message}`);
        return;
      }

      // 2. Ask the server to download from Storage and transcribe with Groq
      const http = await fetch("/api/transcribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "storage-path", path: storagePath, fileName: selectedFile.name }),
      });

      // Clean up storage file after transcription (best-effort)
      supabase.storage.from(bucket).remove([storagePath]).catch(() => {});

      const contentType = http.headers.get("content-type") ?? "";
      if (!contentType.includes("application/json")) {
        const text = await http.text();
        setError(`Error del servidor (${http.status}): ${text.slice(0, 200)}`);
        return;
      }
      const res = await http.json() as { error?: string; sourceId?: string; transcriptId?: string; title?: string; originalText?: string; wordCount?: number };

      if (res.error) {
        setError(res.error);
        return;
      }

      const text = res.originalText ?? "";
      setResult({
        transcriptId: res.transcriptId ?? "local",
        sourceId: res.sourceId ?? "local",
        title: res.title ?? selectedFile.name,
        wordCount: res.wordCount,
        originalText: text,
      });
      setWorkspaceText(text);
      setRecentAnalyses((prev) => [
        { title: res.title ?? selectedFile.name, id: res.sourceId ?? "local" },
        ...prev.slice(0, 4),
      ]);
    } catch (err) {
      setError(`Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setResult(null);
    setSelectedFile(null);
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left Panel */}
      <div className="w-80 flex-shrink-0 border-r border-white/[0.07] bg-[#0d0d0d] flex flex-col">
        <div className="p-5 border-b border-white/[0.07]">
          <h2 className="font-bold text-white text-base tracking-tight">Research Studio</h2>
          <p className="text-xs text-zinc-600 mt-0.5">Transcripción con Groq Whisper</p>
        </div>

        <div className="flex-1 p-4 space-y-4 overflow-y-auto">

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".mp4,.mp3,.wav,.m4a,.webm"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }}
          />

          {/* Drag & Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragging(false); }}
            onDrop={handleDrop}
            onClick={() => !loading && fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
              loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
            } ${
              isDragging
                ? "border-[#FF0033] bg-[#FF0033]/5"
                : "border-white/[0.08] hover:border-[#FF0033]/30 hover:bg-[#FF0033]/[0.02]"
            }`}
          >
            <div className="w-14 h-14 rounded-2xl bg-[#FF0033]/10 flex items-center justify-center mx-auto mb-4">
              <Upload className="w-7 h-7 text-[#FF0033]" />
            </div>
            <p className="text-sm font-semibold text-zinc-200">Arrastra tu archivo aquí</p>
            <p className="text-xs text-zinc-600 mt-1 mb-4">o haz clic para seleccionar</p>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              {["MP4", "MP3", "WAV", "M4A"].map((ext) => (
                <Badge key={ext} className="text-[10px] bg-white/[0.04] border-white/[0.08] text-zinc-500">
                  {ext}
                </Badge>
              ))}
            </div>
          </div>

          {/* Selected file */}
          {selectedFile ? (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[#141414] border border-[#FF0033]/20">
              <FileAudio className="w-4 h-4 text-[#FF0033] flex-shrink-0" />
              <span className="text-xs text-zinc-300 truncate flex-1">{selectedFile.name}</span>
              <span className="text-[10px] text-zinc-600 flex-shrink-0">
                {(selectedFile.size / 1024 / 1024).toFixed(1)} MB
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                className="text-zinc-600 hover:text-white transition-colors"
                disabled={loading}
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

          {/* Error */}
          {error && (
            <div className="px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20">
              <p className="text-[11px] text-red-400 leading-relaxed">{error}</p>
            </div>
          )}

          {/* Analyze button */}
          <Button
            className="w-full bg-[#FF0033] hover:bg-[#e8002e] text-white shadow-[0_0_16px_rgba(255,0,51,0.2)] hover:shadow-[0_0_20px_rgba(255,0,51,0.3)] gap-2 transition-all disabled:opacity-60"
            onClick={handleAnalyze}
            disabled={loading || !selectedFile}
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" />Transcribiendo…</>
            ) : (
              <><Wand2 className="w-4 h-4" />Analizar contenido</>
            )}
          </Button>

          {/* Recent analyses */}
          {recentAnalyses.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <p className="text-[10px] font-semibold text-zinc-700 uppercase tracking-wider">
                Recientes
              </p>
              {recentAnalyses.map((item) => (
                <button
                  key={item.id}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/[0.04] text-left transition-colors"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-[#FF0033]" />
                  <span className="text-xs text-zinc-500 hover:text-zinc-200 transition-colors flex-1 truncate">
                    {item.title}
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
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#FF0033]/10 flex items-center justify-center mx-auto mb-5">
                <Loader2 className="w-8 h-8 text-[#FF0033] animate-spin" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2 tracking-tight">Transcribiendo con Groq Whisper</h3>
              <p className="text-sm text-zinc-600 max-w-xs">Procesando el audio… puede tardar unos segundos.</p>
            </div>
          </div>
        ) : result ? (
          <>
            {/* File info bar */}
            <div className="border-b border-white/[0.07] px-6 py-3 bg-[#0d0d0d]/60 flex items-center gap-4">
              <div className="w-16 h-10 rounded-xl bg-[#141414] border border-white/[0.08] flex items-center justify-center flex-shrink-0">
                <FileAudio className="w-5 h-5 text-[#FF0033]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate tracking-tight">{result.title}</p>
                <p className="text-xs text-zinc-600">{result.wordCount ? `${result.wordCount} palabras` : ""}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                  Transcrito
                </Badge>
                <Button variant="ghost" size="sm" className="text-zinc-600 hover:text-white h-7 px-2" onClick={handleReset} title="Nuevo archivo">
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
                      className="data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-[#FF0033] data-[state=active]:shadow-none rounded-none text-zinc-500 hover:text-zinc-300 text-sm px-4 py-3 transition-colors"
                    >
                      {tab === "transcription" ? "Transcripción" : tab === "workspace" ? "Workspace" : "Outputs"}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {/* Transcription — read only */}
              <TabsContent value="transcription" className="flex-1 overflow-hidden m-0">
                <div className="flex flex-col h-full">
                  <div className="flex items-center gap-3 px-6 py-3 bg-[#141414]/60 border-b border-white/[0.07]">
                    <div className="w-6 h-6 rounded-lg bg-[#FF0033]/10 flex items-center justify-center">
                      <Lock className="w-3.5 h-3.5 text-[#FF0033]" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-zinc-200">Transcripción Original — Solo lectura</p>
                      <p className="text-[11px] text-zinc-600">Usa el Workspace para editar.</p>
                    </div>
                    <div className="ml-auto flex gap-2">
                      <Button variant="ghost" size="sm" className="text-zinc-600 hover:text-white h-7 px-2 gap-1.5"
                        onClick={() => navigator.clipboard.writeText(result.originalText)}>
                        <Copy className="w-3 h-3" /><span className="text-xs">Copiar</span>
                      </Button>
                      <Button variant="ghost" size="sm" className="text-zinc-600 hover:text-white h-7 px-2 gap-1.5"
                        onClick={() => {
                          const a = document.createElement("a");
                          a.href = URL.createObjectURL(new Blob([result.originalText], { type: "text/plain" }));
                          a.download = `transcripcion-${result.title}.txt`;
                          a.click();
                        }}>
                        <Download className="w-3 h-3" /><span className="text-xs">Exportar</span>
                      </Button>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6">
                    <div className="relative rounded-xl border border-white/[0.07] bg-[#0f0f0f] overflow-hidden">
                      <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#FF0033]/10 border border-[#FF0033]/20">
                        <Lock className="w-2.5 h-2.5 text-[#FF0033]" />
                        <span className="text-[10px] font-semibold text-[#FF0033] tracking-wide">PROTEGIDO</span>
                      </div>
                      <div className="p-5 select-none">
                        {result.originalText.split(/\n{2,}/).filter(Boolean).map((para, i) => (
                          <p key={i} className="text-sm text-zinc-400 leading-7 mb-4 font-mono">{para}</p>
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
                    <Button size="sm" className="bg-[#FF0033] hover:bg-[#e8002e] text-white h-7 text-xs gap-1.5">
                      <Wand2 className="w-3 h-3" />Generar con IA
                    </Button>
                  </div>
                  <Textarea
                    className="flex-1 bg-[#111111] border-white/10 text-zinc-300 text-sm leading-7 resize-none focus:border-[#FF0033]/40 font-mono"
                    value={workspaceText}
                    onChange={(e) => setWorkspaceText(e.target.value)}
                  />
                </div>
              </TabsContent>

              {/* Outputs */}
              <TabsContent value="outputs" className="flex-1 overflow-y-auto m-0 p-6">
                <div className="space-y-4">
                  <p className="text-sm font-semibold text-white tracking-tight">Contenido generado por IA</p>
                  <div className="grid grid-cols-2 gap-3">
                    {aiOutputs.map((output) => (
                      <Card key={output.label} className="bg-[#141414] border border-white/[0.08] p-4 hover:border-white/[0.14] hover:bg-[#181818] cursor-pointer transition-all">
                        <div className="flex items-start justify-between">
                          <p className="text-sm font-medium text-zinc-200 tracking-tight">{output.label}</p>
                          <Badge className="text-[10px] bg-[#FF0033]/10 text-[#FF0033] border-[#FF0033]/20">{output.count}</Badge>
                        </div>
                        <Button variant="ghost" size="sm" className="mt-3 w-full text-xs text-zinc-600 hover:text-white border border-white/[0.08] hover:border-white/[0.14] h-7">
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
            <div className="text-center max-w-sm">
              <div className="w-16 h-16 rounded-2xl bg-[#FF0033]/10 flex items-center justify-center mx-auto mb-5">
                <Video className="w-8 h-8 text-[#FF0033]" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2 tracking-tight">Listo para transcribir</h3>
              <p className="text-sm text-zinc-600">
                Arrastra un video o audio MP4, MP3, WAV o M4A y Groq Whisper lo transcribirá automáticamente.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

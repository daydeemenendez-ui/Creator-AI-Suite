"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import {
  Plus,
  Upload,
  Play,
  Pause,
  Square,
  Mic,
  Volume2,
  Download,
  Wand2,
  CheckCircle,
  Clock,
  Trash2,
  Settings2,
  Monitor,
  Pencil,
  Sparkles,
  RefreshCw,
  Undo2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ─── Types ────────────────────────────────────────────────────────────────────

type VoiceStatus = "ready" | "processing";

interface ClonedVoice {
  id: string;
  name: string;
  description: string;
  status: VoiceStatus;
  samples: number;
  duration: string;
  language: string;
  personality?: string;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const INITIAL_VOICES: ClonedVoice[] = [
  {
    id: "v1",
    name: "Voz Principal",
    description: "Tu voz natural — cálida y profesional",
    status: "ready",
    samples: 15,
    duration: "3:20",
    language: "ES",
  },
  {
    id: "v2",
    name: "Presentador Energético",
    description: "Versión con más energía y emoción",
    status: "ready",
    samples: 8,
    duration: "1:45",
    language: "ES",
  },
  {
    id: "v3",
    name: "Narrador Formal",
    description: "Tono corporativo para documentales",
    status: "processing",
    samples: 12,
    duration: "2:10",
    language: "ES",
  },
  {
    id: "v4",
    name: "Voz Casual",
    description: "Relajada, para contenido informal",
    status: "ready",
    samples: 6,
    duration: "1:20",
    language: "EN",
  },
];

const mockText =
  `Bienvenidos a este nuevo video donde vamos a explorar las herramientas de inteligencia artificial más poderosas para creadores de contenido en 2025.

Si llevas tiempo en YouTube, ya sabes que la competencia es feroz. Pero con las herramientas correctas, puedes crear contenido de alta calidad en una fracción del tiempo.

Hoy te voy a mostrar exactamente qué herramientas uso yo en mi flujo de trabajo, y cómo puedes implementarlas tú también.`;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatRelativeTime(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return `hace ${seconds} segundo${seconds !== 1 ? "s" : ""}`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `hace ${minutes} minuto${minutes !== 1 ? "s" : ""}`;
  const hours = Math.floor(minutes / 60);
  return `hace ${hours} hora${hours !== 1 ? "s" : ""}`;
}

function formatTime(totalSecs: number): string {
  const m = Math.floor(totalSecs / 60);
  const s = totalSecs % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// ─── MicRecorder ─────────────────────────────────────────────────────────────

function MicRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const data = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(data);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const barWidth = Math.floor((canvas.width / bufferLength) * 2);
    let x = 0;
    for (let i = 0; i < bufferLength; i++) {
      const barHeight = Math.floor((data[i] / 255) * canvas.height);
      ctx.fillStyle = `rgba(255, 0, 51, ${0.4 + (data[i] / 255) * 0.6})`;
      ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
      x += barWidth + 1;
    }
    animRef.current = requestAnimationFrame(drawWaveform);
  }, []);

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    void audioCtxRef.current?.close();
    if (animRef.current !== null) cancelAnimationFrame(animRef.current);
    if (timerRef.current !== null) clearInterval(timerRef.current);
    analyserRef.current = null;
    setIsRecording(false);
    const canvas = canvasRef.current;
    if (canvas) canvas.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const audioCtx = new AudioContext();
      audioCtxRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      audioCtx.createMediaStreamSource(stream).connect(analyser);
      analyserRef.current = analyser;

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      recorder.start();

      setElapsed(0);
      setIsRecording(true);
      animRef.current = requestAnimationFrame(drawWaveform);
      timerRef.current = setInterval(() => {
        setElapsed((s) => {
          if (s + 1 >= 30) { stopRecording(); return 30; }
          return s + 1;
        });
      }, 1000);
    } catch {
      // Microphone permission denied
    }
  };

  useEffect(() => () => {
    if (animRef.current !== null) cancelAnimationFrame(animRef.current);
    if (timerRef.current !== null) clearInterval(timerRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
  }, []);

  return (
    <div className="space-y-2.5">
      <canvas
        ref={canvasRef}
        width={240}
        height={48}
        className={`w-full rounded-lg bg-[#131313] transition-opacity ${
          isRecording ? "opacity-100" : "opacity-40"
        }`}
      />
      <div className="flex items-center justify-between px-0.5">
        <span className={`text-[10px] font-mono ${isRecording ? "text-[#FF0033]" : "text-[#555]"}`}>
          {formatTime(elapsed)} / 0:30
        </span>
        {isRecording && (
          <span className="text-[10px] text-[#FF0033] animate-pulse font-medium">● REC</span>
        )}
      </div>
      <Button
        size="sm"
        onClick={isRecording ? stopRecording : startRecording}
        className={`w-full h-8 text-xs gap-1.5 ${
          isRecording
            ? "bg-[#1A1A1A] border border-[#FF0033]/40 text-[#FF0033] hover:bg-[#FF0033]/10"
            : "bg-[#FF0033] hover:bg-[#CC0029] text-white shadow-md shadow-red-950/30"
        }`}
      >
        <Mic className="w-3.5 h-3.5" />
        {isRecording ? "Detener grabación" : "Iniciar grabación"}
      </Button>
    </div>
  );
}

// ─── Personality dialog ───────────────────────────────────────────────────────

interface PersonalityDialogProps {
  voice: ClonedVoice;
  open: boolean;
  onClose: () => void;
  onSave: (voiceId: string, personality: string) => Promise<void>;
}

function PersonalityDialog({ voice, open, onClose, onSave }: PersonalityDialogProps) {
  const [value, setValue] = useState(voice.personality ?? "");
  const [isSaving, setIsSaving] = useState(false);

  // Sync when the dialog opens for a different voice
  useEffect(() => {
    if (open) setValue(voice.personality ?? "");
  }, [open, voice.personality, voice.id]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(voice.id, value);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o: boolean) => { if (!o) onClose(); }}>
      <DialogContent className="bg-[#171717] border-[#2A2A2A] text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white text-base">
            Personalidad de voz
          </DialogTitle>
          <p className="text-[11px] text-[#666] mt-0.5">
            {voice.name} — describe el personaje que usa esta voz
          </p>
        </DialogHeader>

        <Textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={5}
          placeholder={`Ej: Spokesperson motivador, directo, con jerga de gimnasio en español latino. Habla en segunda persona, usa frases cortas con energía. Siempre cierra con una llamada a la acción relacionada con fitness.`}
          className="bg-[#131313] border-[#2A2A2A] text-[#E0E0E0] text-sm leading-6 resize-none focus:border-[#FF0033]/40 placeholder:text-[#444]"
        />

        <p className="text-[10px] text-[#555]">
          Esta descripción guiará a la IA al reescribir o componer texto en esta voz.
        </p>

        <DialogFooter className="border-[#2A2A2A] bg-[#111]">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-[#888] hover:text-white border border-[#2A2A2A] h-8 text-xs"
          >
            Cancelar
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="bg-[#FF0033] hover:bg-[#CC0029] text-white h-8 text-xs gap-1.5 shadow-md shadow-red-950/30"
          >
            {isSaving ? (
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : null}
            Guardar personalidad
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function VoicePage() {
  // Voices — start from mock data; personality lives in this state
  const [voices, setVoices] = useState<ClonedVoice[]>(INITIAL_VOICES);
  const [selectedVoice, setSelectedVoice] = useState("v1");
  const [editingVoiceId, setEditingVoiceId] = useState<string | null>(null);

  // Capture section
  const [isDragging, setIsDragging] = useState(false);

  // Text editor
  const [text, setText] = useState(mockText);
  const [prevText, setPrevText] = useState<string | null>(null); // for undo

  // LLM actions
  const [isRewriting, setIsRewriting] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const [llmError, setLlmError] = useState<string | null>(null);

  // Audio player / generation
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerated, setIsGenerated] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSeconds, setPlaySeconds] = useState(0);
  const [generatedAt] = useState(() => new Date(Date.now() - 2 * 60 * 1000));
  const [relativeTime, setRelativeTime] = useState(() =>
    formatRelativeTime(new Date(Date.now() - 2 * 60 * 1000))
  );

  const waveHeights = useMemo(
    () => Array.from({ length: 80 }, (_, i) => 20 + Math.sin(i * 0.4) * 15 + ((i * 7919) % 10)),
    []
  );

  const totalSeconds = useMemo(
    () => Math.max(1, Math.ceil(text.trim().split(/\s+/).length / 150) * 60),
    [text]
  );

  const activeVoice = voices.find((v) => v.id === selectedVoice);
  const hasPersonality = Boolean(activeVoice?.personality?.trim());
  const playProgress = (playSeconds / totalSeconds) * 100;
  const editingVoice = voices.find((v) => v.id === editingVoiceId);

  // Keep relative time fresh
  useEffect(() => {
    const id = setInterval(() => setRelativeTime(formatRelativeTime(generatedAt)), 30_000);
    return () => clearInterval(id);
  }, [generatedAt]);

  // Simulated playback
  useEffect(() => {
    if (!isPlaying) return;
    const id = setInterval(() => {
      setPlaySeconds((s) => {
        if (s + 1 >= totalSeconds) { setIsPlaying(false); return 0; }
        return s + 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [isPlaying, totalSeconds]);

  const seekTo = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setPlaySeconds(Math.floor(ratio * totalSeconds));
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setPlaySeconds(0);
    setIsPlaying(false);
    setTimeout(() => { setIsGenerating(false); setIsGenerated(true); }, 2000);
  };

  // ── Personality save ────────────────────────────────────────────────────────
  const handleSavePersonality = async (voiceId: string, personality: string) => {
    // Optimistic update
    setVoices((prev) =>
      prev.map((v) => (v.id === voiceId ? { ...v, personality: personality.trim() || undefined } : v))
    );
    // Best-effort DB persist (no-op for mock IDs in demo mode)
    try {
      await fetch("/api/voice", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: voiceId, personality }),
      });
    } catch {
      // Silently ignore — state is already updated locally
    }
  };

  // ── Rewrite ─────────────────────────────────────────────────────────────────
  const handleRewrite = async () => {
    if (!hasPersonality || !activeVoice?.personality) return;
    setLlmError(null);
    setIsRewriting(true);
    setPrevText(text); // save for undo
    try {
      const res = await fetch("/api/voice/write", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "rewrite", text, personality: activeVoice.personality }),
      });
      const data = await res.json() as { text?: string; error?: string };
      if (data.error) {
        setLlmError(data.error);
        setPrevText(null);
      } else if (data.text) {
        setText(data.text);
      }
    } catch {
      setLlmError("Error de conexión. Intenta de nuevo.");
      setPrevText(null);
    } finally {
      setIsRewriting(false);
    }
  };

  // ── Compose ─────────────────────────────────────────────────────────────────
  const handleCompose = async () => {
    if (!hasPersonality || !activeVoice?.personality) return;
    setLlmError(null);
    setIsComposing(true);
    setPrevText(text); // save for undo
    try {
      const res = await fetch("/api/voice/write", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "compose", personality: activeVoice.personality }),
      });
      const data = await res.json() as { text?: string; error?: string };
      if (data.error) {
        setLlmError(data.error);
        setPrevText(null);
      } else if (data.text) {
        setText(data.text);
      }
    } catch {
      setLlmError("Error de conexión. Intenta de nuevo.");
      setPrevText(null);
    } finally {
      setIsComposing(false);
    }
  };

  const handleUndo = () => {
    if (prevText !== null) {
      setText(prevText);
      setPrevText(null);
      setLlmError(null);
    }
  };

  const isLlmBusy = isRewriting || isComposing;

  return (
    <>
      {/* Personality edit dialog */}
      {editingVoice && (
        <PersonalityDialog
          voice={editingVoice}
          open={editingVoiceId !== null}
          onClose={() => setEditingVoiceId(null)}
          onSave={handleSavePersonality}
        />
      )}

      <div className="flex h-full overflow-hidden">
        {/* ── Left panel ── */}
        <div className="w-72 flex-shrink-0 border-r border-[#2A2A2A] bg-[#111111] flex flex-col">
          <div className="p-5 border-b border-[#2A2A2A] flex items-center justify-between">
            <div>
              <h2 className="font-bold text-white text-base">Voice Studio</h2>
              <p className="text-xs text-[#666] mt-0.5">Clonación y síntesis de voz</p>
            </div>
            <Button
              size="sm"
              className="bg-[#FF0033] hover:bg-[#CC0029] text-white h-8 px-3 gap-1.5 shadow-md shadow-red-950/30"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="text-xs">Crear voz</span>
            </Button>
          </div>

          {/* Capture tabs */}
          <div className="p-4 border-b border-[#2A2A2A]">
            <p className="text-[10px] font-semibold text-[#555] uppercase tracking-wider mb-3">
              Captura de muestra
            </p>
            <Tabs defaultValue="upload" className="w-full">
              <TabsList className="w-full h-8 bg-[#1A1A1A] border border-[#2A2A2A] p-0.5 mb-3 gap-0.5">
                <TabsTrigger
                  value="upload"
                  className="flex-1 text-[10px] h-full gap-1 data-active:bg-[#FF0033]/15 data-active:text-[#FF0033] data-active:border-[#FF0033]/20"
                >
                  <Upload className="w-3 h-3" />
                  Archivo
                </TabsTrigger>
                <TabsTrigger
                  value="record"
                  className="flex-1 text-[10px] h-full gap-1 data-active:bg-[#FF0033]/15 data-active:text-[#FF0033] data-active:border-[#FF0033]/20"
                >
                  <Mic className="w-3 h-3" />
                  Micrófono
                </TabsTrigger>
                <div title="Próximamente" className="flex-1 cursor-not-allowed">
                  <TabsTrigger value="system" disabled className="w-full text-[10px] h-full gap-1">
                    <Monitor className="w-3 h-3" />
                    Sistema
                  </TabsTrigger>
                </div>
              </TabsList>

              <TabsContent value="upload">
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => { e.preventDefault(); setIsDragging(false); }}
                  className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                    isDragging
                      ? "border-[#FF0033] bg-[#FF0033]/5"
                      : "border-[#2A2A2A] hover:border-[#FF0033]/40"
                  }`}
                >
                  <Upload className="w-5 h-5 text-[#666] mx-auto mb-2" />
                  <p className="text-xs text-[#888]">Sube audio de tu voz</p>
                  <p className="text-[10px] text-[#555] mt-0.5">MP4, MP3, WAV · mín. 30s</p>
                  <div className="flex justify-center gap-1.5 mt-2">
                    {["MP4", "MP3", "WAV"].map((ext) => (
                      <Badge key={ext} className="text-[9px] px-1 py-0 bg-[#1A1A1A] border-[#2A2A2A] text-[#666]">
                        {ext}
                      </Badge>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="record">
                <MicRecorder />
              </TabsContent>

              <TabsContent value="system" />
            </Tabs>
          </div>

          {/* Voices list */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            <p className="text-[10px] font-semibold text-[#555] uppercase tracking-wider px-2 mb-1">
              Voces clonadas ({voices.length})
            </p>
            {voices.map((voice) => (
              <button
                key={voice.id}
                onClick={() => setSelectedVoice(voice.id)}
                className={`w-full text-left p-3 rounded-xl border transition-all group/card ${
                  selectedVoice === voice.id
                    ? "bg-[#FF0033]/10 border-[#FF0033]/40"
                    : "bg-[#161616] border-[#222] hover:border-[#333]"
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    selectedVoice === voice.id ? "bg-[#FF0033]/20" : "bg-[#1E1E1E]"
                  }`}>
                    <Mic
                      style={{ width: 16, height: 16, color: selectedVoice === voice.id ? "#FF0033" : "#666" }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-semibold text-white truncate flex-1">{voice.name}</p>
                      {voice.status === "ready" ? (
                        <CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0" />
                      ) : (
                        <Clock className="w-3 h-3 text-yellow-500 flex-shrink-0" />
                      )}
                      {/* Edit personality button — always visible on selected, hover on others */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingVoiceId(voice.id);
                        }}
                        title="Editar personalidad"
                        className={`w-5 h-5 flex items-center justify-center rounded text-[#555] hover:text-[#FF0033] transition-colors flex-shrink-0 ${
                          selectedVoice === voice.id ? "opacity-100" : "opacity-0 group-hover/card:opacity-100"
                        }`}
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                    </div>

                    <p className="text-[11px] text-[#666] truncate">{voice.description}</p>

                    {/* Personality preview */}
                    {voice.personality ? (
                      <p className="text-[10px] text-[#FF0033]/70 truncate mt-0.5 italic">
                        {voice.personality}
                      </p>
                    ) : (
                      <p className="text-[10px] text-[#444] mt-0.5">Sin personalidad definida</p>
                    )}

                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                      <span className="text-[10px] text-[#555]">{voice.samples} muestras</span>
                      <span className="text-[#333]">·</span>
                      <span className="text-[10px] text-[#555]">{voice.duration}</span>
                      {/* Language badge */}
                      <span className="ml-auto inline-flex items-center text-[9px] px-1.5 py-0.5 rounded-full bg-[#1A1A1A] border border-[#2A2A2A] text-[#777] font-medium tracking-wide">
                        {voice.language}
                      </span>
                      {/* Personality badge slot */}
                      {voice.personality && (
                        <span className="inline-flex items-center text-[9px] px-1.5 py-0.5 rounded-full bg-[#FF0033]/10 border border-[#FF0033]/20 text-[#FF0033]/80 font-medium gap-0.5">
                          <Sparkles className="w-2.5 h-2.5" />
                          Personalidad
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ── Right panel ── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Settings bar */}
          <div className="border-b border-[#2A2A2A] px-6 py-3 bg-[#111111]/50 flex items-center gap-4">
            <div className="flex items-center gap-3">
              <label className="text-xs text-[#888]">Voz seleccionada</label>
              <Select value={selectedVoice} onValueChange={(v) => v && setSelectedVoice(v)}>
                <SelectTrigger className="w-44 h-8 bg-[#1A1A1A] border-[#2A2A2A] text-white text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A] text-white">
                  {voices.map((v) => (
                    <SelectItem key={v.id} value={v.id} className="text-sm hover:bg-white/5">
                      {v.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-xs text-[#888]">Velocidad</label>
              <Select defaultValue="1.0">
                <SelectTrigger className="w-24 h-8 bg-[#1A1A1A] border-[#2A2A2A] text-white text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A] text-white">
                  {["0.75x", "1.0x", "1.25x", "1.5x"].map((s) => (
                    <SelectItem key={s} value={s.replace("x", "")} className="text-sm hover:bg-white/5">
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-xs text-[#888]">Estilo</label>
              <Select defaultValue="natural">
                <SelectTrigger className="w-36 h-8 bg-[#1A1A1A] border-[#2A2A2A] text-white text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A] text-white">
                  {["Natural", "Enérgico", "Formal", "Casual"].map((s) => (
                    <SelectItem key={s} value={s.toLowerCase()} className="text-sm hover:bg-white/5">
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <button className="ml-auto text-[#888] hover:text-white transition-colors">
              <Settings2 className="w-4 h-4" />
            </button>
          </div>

          {/* Text editor */}
          <div className="flex-1 flex flex-col overflow-hidden p-6 gap-4">
            {/* Header row */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div>
                <h3 className="text-sm font-semibold text-white">Texto a convertir en audio</h3>
                <p className="text-xs text-[#666] mt-0.5">
                  {text.trim().split(/\s+/).length} palabras · ~
                  {Math.ceil(text.trim().split(/\s+/).length / 150)} min de audio
                </p>
              </div>

              {/* Action buttons row */}
              <div className="flex items-center gap-2">
                {/* Undo button — appears after Rewrite/Compose */}
                {prevText !== null && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleUndo}
                    className="text-xs text-yellow-500 hover:text-yellow-400 border border-yellow-500/20 hover:border-yellow-500/40 gap-1.5 h-7"
                  >
                    <Undo2 className="w-3 h-3" />
                    Deshacer
                  </Button>
                )}

                {/* Rewrite — only active with personality */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRewrite}
                  disabled={!hasPersonality || isLlmBusy}
                  title={!hasPersonality ? "Define una personalidad para esta voz primero" : undefined}
                  className={`text-xs border gap-1.5 h-7 transition-colors ${
                    hasPersonality
                      ? "text-[#FF0033] border-[#FF0033]/30 hover:border-[#FF0033]/60 hover:text-[#FF0033]"
                      : "text-[#444] border-[#2A2A2A] cursor-not-allowed"
                  }`}
                >
                  {isRewriting ? (
                    <div className="w-3 h-3 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                  ) : (
                    <RefreshCw className="w-3 h-3" />
                  )}
                  {isRewriting ? "Reescribiendo..." : "Rewrite"}
                </Button>

                {/* Compose — only active with personality */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCompose}
                  disabled={!hasPersonality || isLlmBusy}
                  title={!hasPersonality ? "Define una personalidad para esta voz primero" : undefined}
                  className={`text-xs border gap-1.5 h-7 transition-colors ${
                    hasPersonality
                      ? "text-[#888] border-[#2A2A2A] hover:text-white hover:border-[#444]"
                      : "text-[#444] border-[#2A2A2A] cursor-not-allowed"
                  }`}
                >
                  {isComposing ? (
                    <div className="w-3 h-3 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                  ) : (
                    <Sparkles className="w-3 h-3" />
                  )}
                  {isComposing ? "Componiendo..." : "Compose"}
                </Button>

                {/* "Generar otra" — only after Compose ran (prevText set + not rewriting) */}
                {prevText !== null && !isRewriting && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCompose}
                    disabled={isLlmBusy}
                    className="text-xs text-[#888] hover:text-white border border-[#2A2A2A] hover:border-[#444] gap-1.5 h-7"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Generar otra
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-[#888] hover:text-white border border-[#2A2A2A] gap-1.5 h-7"
                >
                  <Wand2 className="w-3 h-3" />
                  Optimizar texto
                </Button>
              </div>
            </div>

            {/* No-personality notice */}
            {!hasPersonality && (
              <div className="flex items-center gap-2 text-[11px] text-[#666] bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2">
                <AlertCircle className="w-3.5 h-3.5 text-[#555] flex-shrink-0" />
                <span>
                  <span className="text-[#888]">{activeVoice?.name}</span> no tiene personalidad definida.{" "}
                  <button
                    onClick={() => setEditingVoiceId(selectedVoice)}
                    className="text-[#FF0033]/80 hover:text-[#FF0033] underline underline-offset-2 transition-colors"
                  >
                    Definir ahora
                  </button>{" "}
                  para habilitar Rewrite y Compose.
                </span>
              </div>
            )}

            {/* LLM error */}
            {llmError && (
              <div className="flex items-center gap-2 text-[11px] text-red-400 bg-red-950/20 border border-red-900/40 rounded-lg px-3 py-2">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{llmError}</span>
                <button
                  onClick={() => setLlmError(null)}
                  className="ml-auto text-red-400/60 hover:text-red-400"
                >
                  ✕
                </button>
              </div>
            )}

            <Textarea
              value={text}
              onChange={(e) => { setText(e.target.value); setPrevText(null); setLlmError(null); }}
              className={`flex-1 bg-[#131313] border-[#2A2A2A] text-[#E0E0E0] text-sm leading-7 resize-none focus:border-[#FF0033]/40 transition-opacity ${
                isLlmBusy ? "opacity-50 pointer-events-none" : "opacity-100"
              }`}
              placeholder="Escribe o pega el texto que quieres convertir en audio con tu voz clonada..."
            />

            <Button
              className="w-full bg-[#FF0033] hover:bg-[#CC0029] text-white gap-2 h-11 text-sm shadow-lg shadow-red-950/30"
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generando audio...
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4" />
                  Generar audio con voz clonada
                </>
              )}
            </Button>

            {/* Audio player */}
            {isGenerated && (
              <Card className="bg-[#171717] border-[#2A2A2A] p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold text-white">Audio generado</p>
                    <p className="text-[11px] text-[#666]">
                      {activeVoice?.name} · {relativeTime}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="w-7 h-7 rounded-lg hover:bg-white/5 flex items-center justify-center text-[#888] hover:text-white transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-xs text-[#888] hover:text-white border border-[#2A2A2A] gap-1.5 h-7"
                    >
                      <Download className="w-3 h-3" />
                      Descargar MP3
                    </Button>
                  </div>
                </div>

                {/* Interactive waveform */}
                <div
                  className="relative bg-[#131313] rounded-lg px-4 py-3 mb-3 overflow-hidden cursor-pointer select-none"
                  onClick={seekTo}
                >
                  <div className="flex items-center gap-[2px] h-10">
                    {waveHeights.map((h, i) => {
                      const barPct = (i / waveHeights.length) * 100;
                      return (
                        <div
                          key={i}
                          className="flex-1 rounded-sm"
                          style={{
                            height: `${h}%`,
                            backgroundColor: barPct <= playProgress ? "#FF0033" : "rgba(255,0,51,0.25)",
                          }}
                        />
                      );
                    })}
                  </div>
                  <div
                    className="absolute top-0 bottom-0 bg-[#FF0033]/8 border-r border-[#FF0033]/60 pointer-events-none"
                    style={{ left: 16, width: `calc(${playProgress}% - 4px)` }}
                  />
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsPlaying((p) => !p)}
                    className="w-9 h-9 rounded-full bg-[#FF0033] hover:bg-[#CC0029] flex items-center justify-center flex-shrink-0 shadow-md shadow-red-950/30 transition-colors"
                  >
                    {isPlaying ? (
                      <Pause className="w-4 h-4 text-white" />
                    ) : (
                      <Play className="w-4 h-4 text-white ml-0.5" />
                    )}
                  </button>
                  <div
                    className="flex-1 h-1.5 bg-[#222] rounded-full overflow-hidden cursor-pointer"
                    onClick={seekTo}
                  >
                    <div
                      className="h-full bg-[#FF0033] rounded-full"
                      style={{ width: `${playProgress}%` }}
                    />
                  </div>
                  <span className="text-xs text-[#666] font-mono flex-shrink-0">
                    {formatTime(playSeconds)} / {formatTime(totalSeconds)}
                  </span>
                  <button className="text-[#666] hover:text-white transition-colors">
                    <Volume2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => { setIsPlaying(false); setPlaySeconds(0); }}
                    className="text-[#666] hover:text-white transition-colors"
                  >
                    <Square className="w-3.5 h-3.5" />
                  </button>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

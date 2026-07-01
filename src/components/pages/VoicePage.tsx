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
import { useTtsModel, TTS_MODELS } from "@/hooks/useTtsModel";

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
        className={`w-full rounded-xl bg-[#0f0f0f] border border-white/[0.05] transition-opacity ${
          isRecording ? "opacity-100" : "opacity-40"
        }`}
      />
      <div className="flex items-center justify-between px-0.5">
        <span className={`text-[10px] font-mono ${isRecording ? "text-[#FF0033]" : "text-zinc-700"}`}>
          {formatTime(elapsed)} / 0:30
        </span>
        {isRecording && (
          <span className="text-[10px] text-[#FF0033] animate-pulse font-medium">● REC</span>
        )}
      </div>
      <Button
        size="sm"
        onClick={isRecording ? stopRecording : startRecording}
        className={`w-full h-8 text-xs gap-1.5 transition-all ${
          isRecording
            ? "bg-[#141414] border border-[#FF0033]/40 text-[#FF0033] hover:bg-[#FF0033]/10"
            : "bg-[#FF0033] hover:bg-[#e8002e] text-white shadow-[0_0_12px_rgba(255,0,51,0.2)]"
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
      <DialogContent className="bg-[#161616] border-white/10 text-white sm:max-w-md shadow-[0_16px_64px_rgba(0,0,0,0.8)]">
        <DialogHeader>
          <DialogTitle className="text-white text-base tracking-tight">
            Personalidad de voz
          </DialogTitle>
          <p className="text-[11px] text-zinc-600 mt-0.5">
            {voice.name} — describe el personaje que usa esta voz
          </p>
        </DialogHeader>

        <Textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={5}
          placeholder={`Ej: Spokesperson motivador, directo, con jerga de gimnasio en español latino. Habla en segunda persona, usa frases cortas con energía. Siempre cierra con una llamada a la acción relacionada con fitness.`}
          className="bg-[#111111] border-white/10 text-zinc-200 text-sm leading-6 resize-none focus:border-[#FF0033]/40 placeholder:text-zinc-700"
        />

        <p className="text-[10px] text-zinc-600">
          Esta descripción guiará a la IA al reescribir o componer texto en esta voz.
        </p>

        <DialogFooter className="border-white/[0.07] bg-transparent">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-zinc-500 hover:text-white border border-white/10 h-8 text-xs"
          >
            Cancelar
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="bg-[#FF0033] hover:bg-[#e8002e] text-white h-8 text-xs gap-1.5 shadow-[0_0_16px_rgba(255,0,51,0.2)] transition-all"
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
  const { model: ttsModel, setModel: setTtsModel } = useTtsModel();

  // Voices — start from mock data; real cloned voices load from the DB and
  // replace them so uploads survive a refresh / new session
  const [voices, setVoices] = useState<ClonedVoice[]>(INITIAL_VOICES);
  const [selectedVoice, setSelectedVoice] = useState("v1");
  const [editingVoiceId, setEditingVoiceId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/voice?type=profiles");
        if (!res.ok) return;
        const data = (await res.json()) as {
          profiles?: {
            id: string;
            name: string;
            description: string | null;
            personality: string | null;
            sampleCount: number;
            status: "PROCESSING" | "READY" | "ERROR";
          }[];
        };
        if (cancelled || !data.profiles?.length) return;

        const realVoices: ClonedVoice[] = data.profiles.map((p) => ({
          id: p.id,
          name: p.name,
          description: p.description ?? "Voz clonada desde archivo",
          status: p.status === "READY" ? "ready" : "processing",
          samples: p.sampleCount || 1,
          duration: "—",
          language: "ES",
          personality: p.personality ?? undefined,
        }));

        setVoices(realVoices);
        setSelectedVoice(realVoices[0].id);
      } catch {
        // Keep demo voices if the DB is unreachable
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Capture section
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSampleFile = async (file: File) => {
    setUploadError(null);
    setUploadSuccess(null);

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!["mp4", "mp3", "wav", "m4a"].includes(ext)) {
      setUploadError("Formato no soportado. Usa MP4, MP3 o WAV.");
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      setUploadError("El archivo supera el límite de 25MB.");
      return;
    }

    setIsUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("name", file.name.replace(/\.[^.]+$/, ""));
      const res = await fetch("/api/voice/clone", { method: "POST", body: fd });
      const data = (await res.json()) as {
        success?: boolean;
        voiceId?: string;
        status?: string;
        error?: string;
      };
      if (!res.ok || data.error) throw new Error(data.error ?? `Error ${res.status}`);

      const newVoice: ClonedVoice = {
        id: data.voiceId ?? `v-${Date.now()}`,
        name: file.name.replace(/\.[^.]+$/, ""),
        description: "Voz clonada desde archivo",
        status: data.status === "success" ? "ready" : "processing",
        samples: 1,
        duration: "—",
        language: "ES",
      };
      setVoices((prev) => [newVoice, ...prev]);
      setSelectedVoice(newVoice.id);
      setUploadSuccess(
        newVoice.status === "ready"
          ? "Muestra subida — voz lista."
          : "Muestra subida — la voz se está procesando."
      );
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsUploading(false);
    }
  };

  // Text editor
  const [text, setText] = useState(mockText);
  const [prevText, setPrevText] = useState<string | null>(null); // for undo

  // LLM actions
  const [isRewriting, setIsRewriting] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const [llmError, setLlmError] = useState<string | null>(null);

  // Audio player / generation
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSeconds, setPlaySeconds] = useState(0);
  const [generatedAt, setGeneratedAt] = useState<Date | null>(null);
  const [relativeTime, setRelativeTime] = useState("");

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
  const audioDuration = audioRef.current?.duration ?? totalSeconds;
  const playProgress = (playSeconds / Math.max(1, audioDuration)) * 100;
  const editingVoice = voices.find((v) => v.id === editingVoiceId);

  // Keep relative time fresh
  useEffect(() => {
    if (!generatedAt) return;
    setRelativeTime(formatRelativeTime(generatedAt));
    const id = setInterval(() => setRelativeTime(formatRelativeTime(generatedAt)), 30_000);
    return () => clearInterval(id);
  }, [generatedAt]);

  // Sync audio element with play state
  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) audioRef.current.play().catch(() => setIsPlaying(false));
    else audioRef.current.pause();
  }, [isPlaying]);

  // Cleanup audio URL on unmount
  useEffect(() => () => { if (audioUrl) URL.revokeObjectURL(audioUrl); }, [audioUrl]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setIsPlaying(false);
    setPlaySeconds(0);
    setGenerateError(null);

    try {
      const res = await fetch("/api/voice/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, modelId: ttsModel.id, voiceProfileId: selectedVoice }),
      });

      if (!res.ok) {
        const data = await res.json() as { error?: string };
        throw new Error(data.error ?? `Error ${res.status}`);
      }

      const blob = await res.blob();
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      const newUrl = URL.createObjectURL(blob);
      setAudioUrl(newUrl);

      if (audioRef.current) {
        audioRef.current.src = newUrl;
        audioRef.current.load();
      }

      setIsGenerated(true);
      setGeneratedAt(new Date());
    } catch (err) {
      setGenerateError(String(err));
    } finally {
      setIsGenerating(false);
    }
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
        <div className="w-72 flex-shrink-0 border-r border-white/[0.07] bg-[#0d0d0d] flex flex-col">
          <div className="p-5 border-b border-white/[0.07] flex items-center justify-between">
            <div>
              <h2 className="font-bold text-white text-base tracking-tight">Voice Studio</h2>
              <p className="text-xs text-zinc-600 mt-0.5">Clonación y síntesis de voz</p>
            </div>
            <Button
              size="sm"
              className="bg-[#FF0033] hover:bg-[#e8002e] text-white h-8 px-3 gap-1.5 shadow-[0_0_12px_rgba(255,0,51,0.2)] transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="text-xs">Crear voz</span>
            </Button>
          </div>

          {/* Capture tabs */}
          <div className="p-4 border-b border-white/[0.07]">
            <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider mb-3">
              Captura de muestra
            </p>
            <Tabs defaultValue="upload" className="w-full">
              <TabsList className="w-full h-8 bg-[#141414] border border-white/10 p-0.5 mb-3 gap-0.5">
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
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".mp4,.mp3,.wav,.m4a,video/mp4,audio/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void handleSampleFile(file);
                    e.target.value = "";
                  }}
                />
                <div
                  onClick={() => { if (!isUploading) fileInputRef.current?.click(); }}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file && !isUploading) void handleSampleFile(file);
                  }}
                  className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                    isDragging
                      ? "border-[#FF0033] bg-[#FF0033]/5"
                      : "border-white/[0.08] hover:border-[#FF0033]/30 hover:bg-[#FF0033]/[0.02]"
                  }`}
                >
                  {isUploading ? (
                    <div className="w-5 h-5 border-2 border-[#FF0033]/30 border-t-[#FF0033] rounded-full animate-spin mx-auto mb-2" />
                  ) : (
                    <Upload className="w-5 h-5 text-zinc-600 mx-auto mb-2" />
                  )}
                  <p className="text-xs text-zinc-400">
                    {isUploading ? "Subiendo muestra..." : "Sube audio de tu voz"}
                  </p>
                  <p className="text-[10px] text-zinc-600 mt-0.5">MP4, MP3, WAV · mín. 30s · máx. 25MB</p>
                  <div className="flex justify-center gap-1.5 mt-2">
                    {["MP4", "MP3", "WAV"].map((ext) => (
                      <Badge key={ext} className="text-[9px] px-1 py-0 bg-white/[0.04] border-white/[0.08] text-zinc-600">
                        {ext}
                      </Badge>
                    ))}
                  </div>
                </div>
                {uploadError && (
                  <p className="text-[10px] text-red-400 mt-2 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 flex-shrink-0" />
                    {uploadError}
                  </p>
                )}
                {uploadSuccess && (
                  <p className="text-[10px] text-green-400 mt-2 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 flex-shrink-0" />
                    {uploadSuccess}
                  </p>
                )}
              </TabsContent>

              <TabsContent value="record">
                <MicRecorder />
              </TabsContent>

              <TabsContent value="system" />
            </Tabs>
          </div>

          {/* Voices list */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider px-2 mb-1">
              Voces clonadas ({voices.length})
            </p>
            {voices.map((voice) => (
              <div
                key={voice.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedVoice(voice.id)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setSelectedVoice(voice.id); }}
                className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer group/card ${
                  selectedVoice === voice.id
                    ? "bg-[#FF0033]/10 border-[#FF0033]/30"
                    : "bg-[#141414] border-white/[0.07] hover:border-white/[0.14]"
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    selectedVoice === voice.id ? "bg-[#FF0033]/20" : "bg-[#1a1a1a]"
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

                    <p className="text-[11px] text-zinc-600 truncate">{voice.description}</p>

                    {/* Personality preview */}
                    {voice.personality ? (
                      <p className="text-[10px] text-[#FF0033]/70 truncate mt-0.5 italic">
                        {voice.personality}
                      </p>
                    ) : (
                      <p className="text-[10px] text-zinc-700 mt-0.5">Sin personalidad definida</p>
                    )}

                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                      <span className="text-[10px] text-zinc-600">{voice.samples} muestras</span>
                      <span className="text-zinc-800">·</span>
                      <span className="text-[10px] text-zinc-600">{voice.duration}</span>
                      {/* Language badge */}
                      <span className="ml-auto inline-flex items-center text-[9px] px-1.5 py-0.5 rounded-full bg-white/[0.04] border border-white/10 text-zinc-500 font-medium tracking-wide">
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
              </div>
            ))}
          </div>
        </div>

        {/* ── Right panel ── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Settings bar */}
          <div className="border-b border-white/[0.07] px-6 py-3 bg-[#0d0d0d]/60 flex items-center gap-4">
            <div className="flex items-center gap-3">
              <label className="text-xs text-zinc-500">Voz seleccionada</label>
              <Select value={selectedVoice} onValueChange={(v) => v && setSelectedVoice(v)}>
                <SelectTrigger className="w-44 h-8 bg-[#141414] border-white/10 text-white text-sm">
                  <SelectValue>
                    {(v: string) => voices.find((voice) => voice.id === v)?.name ?? v}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                  {voices.map((v) => (
                    <SelectItem key={v.id} value={v.id} className="text-sm hover:bg-white/5">
                      {v.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-xs text-zinc-500">Velocidad</label>
              <Select defaultValue="1.0">
                <SelectTrigger className="w-24 h-8 bg-[#141414] border-white/10 text-white text-sm">
                  <SelectValue>{(v: string) => `${v}x`}</SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                  {["0.75x", "1.0x", "1.25x", "1.5x"].map((s) => (
                    <SelectItem key={s} value={s.replace("x", "")} className="text-sm hover:bg-white/5">
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-xs text-zinc-500">Estilo</label>
              <Select defaultValue="natural">
                <SelectTrigger className="w-36 h-8 bg-[#141414] border-white/10 text-white text-sm">
                  <SelectValue>
                    {(v: string) => v.charAt(0).toUpperCase() + v.slice(1)}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                  {["Natural", "Enérgico", "Formal", "Casual"].map((s) => (
                    <SelectItem key={s} value={s.toLowerCase()} className="text-sm hover:bg-white/5">
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="ml-auto flex items-center gap-3">
              <label className="text-xs text-zinc-500">Modelo TTS</label>
              <Select
                value={ttsModel.id}
                onValueChange={(v) => {
                  const m = TTS_MODELS.find((t) => t.id === v);
                  if (m) setTtsModel(m);
                }}
              >
                <SelectTrigger className="w-48 h-8 bg-[#141414] border-white/10 text-white text-sm">
                  <SelectValue>
                    {(v: string) => TTS_MODELS.find((m) => m.id === v)?.name ?? v}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                  {Object.entries(
                    TTS_MODELS.reduce<Record<string, typeof TTS_MODELS>>((acc, m) => {
                      (acc[m.provider] ??= []).push(m);
                      return acc;
                    }, {})
                  ).map(([provider, models]) => (
                    <div key={provider}>
                      <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider px-2 pt-2 pb-1">
                        {provider}
                      </p>
                      {models.map((m) => (
                        <SelectItem key={m.id} value={m.id} className="text-sm hover:bg-white/5">
                          {m.name}
                        </SelectItem>
                      ))}
                    </div>
                  ))}
                </SelectContent>
              </Select>
              <button className="text-zinc-500 hover:text-white transition-colors">
                <Settings2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Text editor */}
          <div className="flex-1 flex flex-col overflow-hidden p-6 gap-4">
            {/* Header row */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div>
                <h3 className="text-sm font-semibold text-white tracking-tight">Texto a convertir en audio</h3>
                <p className="text-xs text-zinc-600 mt-0.5">
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
                      ? "text-zinc-500 border-white/10 hover:text-white hover:border-white/20"
                      : "text-zinc-700 border-white/[0.06] cursor-not-allowed"
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
                    className="text-xs text-zinc-500 hover:text-white border border-white/10 hover:border-white/20 gap-1.5 h-7"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Generar otra
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-zinc-500 hover:text-white border border-white/10 gap-1.5 h-7"
                >
                  <Wand2 className="w-3 h-3" />
                  Optimizar texto
                </Button>
              </div>
            </div>

            {/* No-personality notice */}
            {!hasPersonality && (
              <div className="flex items-center gap-2 text-[11px] text-zinc-600 bg-[#141414] border border-white/[0.08] rounded-lg px-3 py-2">
                <AlertCircle className="w-3.5 h-3.5 text-zinc-600 flex-shrink-0" />
                <span>
                  <span className="text-zinc-400">{activeVoice?.name}</span> no tiene personalidad definida.{" "}
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
              className={`flex-1 bg-[#111111] border-white/10 text-zinc-200 text-sm leading-7 resize-none focus:border-[#FF0033]/40 transition-opacity ${
                isLlmBusy ? "opacity-50 pointer-events-none" : "opacity-100"
              }`}
              placeholder="Escribe o pega el texto que quieres convertir en audio con tu voz clonada..."
            />

            {/* Generate error */}
            {generateError && (
              <div className="flex items-center gap-2 text-[11px] text-red-400 bg-red-950/20 border border-red-900/40 rounded-lg px-3 py-2">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="flex-1">{generateError}</span>
                <button onClick={() => setGenerateError(null)} className="text-red-400/60 hover:text-red-400">✕</button>
              </div>
            )}

            <Button
              className="w-full bg-[#FF0033] hover:bg-[#e8002e] text-white gap-2 h-11 text-sm shadow-[0_0_20px_rgba(255,0,51,0.2)] hover:shadow-[0_0_24px_rgba(255,0,51,0.3)] transition-all"
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
            {isGenerated && audioUrl && (
              <Card className="bg-[#141414] border-white/[0.08] p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold text-white tracking-tight">Audio generado</p>
                    <p className="text-[11px] text-zinc-600">
                      {ttsModel.name} · {relativeTime}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { setIsGenerated(false); setAudioUrl(null); setIsPlaying(false); }}
                      className="w-7 h-7 rounded-lg hover:bg-white/[0.04] flex items-center justify-center text-zinc-500 hover:text-white transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <a
                      href={audioUrl}
                      download="tts-output.mp3"
                    >
                      <Button size="sm" variant="ghost" className="text-xs text-zinc-500 hover:text-white border border-white/10 gap-1.5 h-7">
                        <Download className="w-3 h-3" />
                        Descargar MP3
                      </Button>
                    </a>
                  </div>
                </div>

                {/* Native audio element (hidden) */}
                <audio
                  ref={audioRef}
                  src={audioUrl}
                  onTimeUpdate={(e) => setPlaySeconds(Math.floor((e.target as HTMLAudioElement).currentTime))}
                  onEnded={() => { setIsPlaying(false); setPlaySeconds(0); }}
                  className="hidden"
                />

                {/* Waveform visualization */}
                <div
                  className="relative bg-[#0f0f0f] rounded-xl px-4 py-3 mb-3 overflow-hidden cursor-pointer select-none border border-white/[0.05]"
                  onClick={(e) => {
                    if (!audioRef.current) return;
                    const rect = e.currentTarget.getBoundingClientRect();
                    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                    audioRef.current.currentTime = ratio * (audioRef.current.duration || 0);
                    setPlaySeconds(Math.floor(ratio * (audioRef.current.duration || 0)));
                  }}
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
                  <div className="flex-1 h-1.5 bg-white/[0.08] rounded-full overflow-hidden cursor-pointer"
                    onClick={(e) => {
                      if (!audioRef.current) return;
                      const rect = e.currentTarget.getBoundingClientRect();
                      const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                      audioRef.current.currentTime = ratio * (audioRef.current.duration || 0);
                    }}
                  >
                    <div className="h-full bg-[#FF0033] rounded-full" style={{ width: `${playProgress}%` }} />
                  </div>
                  <span className="text-xs text-zinc-600 font-mono flex-shrink-0">
                    {formatTime(playSeconds)} / {formatTime(totalSeconds)}
                  </span>
                  <button className="text-zinc-600 hover:text-white transition-colors">
                    <Volume2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => { setIsPlaying(false); setPlaySeconds(0); if (audioRef.current) audioRef.current.currentTime = 0; }}
                    className="text-zinc-600 hover:text-white transition-colors"
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

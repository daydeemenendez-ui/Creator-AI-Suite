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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

const clonedVoices: ClonedVoice[] = [
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

// ─── Mic recorder sub-component ──────────────────────────────────────────────

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
      const alpha = 0.4 + (data[i] / 255) * 0.6;
      ctx.fillStyle = `rgba(255, 0, 51, ${alpha})`;
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
          if (s + 1 >= 30) {
            stopRecording();
            return 30;
          }
          return s + 1;
        });
      }, 1000);
    } catch {
      // Microphone permission denied — do nothing
    }
  };

  useEffect(
    () => () => {
      if (animRef.current !== null) cancelAnimationFrame(animRef.current);
      if (timerRef.current !== null) clearInterval(timerRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    },
    []
  );

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
        <span
          className={`text-[10px] font-mono ${
            isRecording ? "text-[#FF0033]" : "text-[#555]"
          }`}
        >
          {formatTime(elapsed)} / 0:30
        </span>
        {isRecording && (
          <span className="text-[10px] text-[#FF0033] animate-pulse font-medium">
            ● REC
          </span>
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

// ─── Main page ────────────────────────────────────────────────────────────────

export function VoicePage() {
  const [selectedVoice, setSelectedVoice] = useState("v1");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [text, setText] = useState(mockText);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerated, setIsGenerated] = useState(true);
  const [generatedAt] = useState(() => new Date(Date.now() - 2 * 60 * 1000));
  const [relativeTime, setRelativeTime] = useState(() =>
    formatRelativeTime(new Date(Date.now() - 2 * 60 * 1000))
  );
  const [playSeconds, setPlaySeconds] = useState(0);

  const waveHeights = useMemo(
    () =>
      Array.from(
        { length: 80 },
        (_, i) => 20 + Math.sin(i * 0.4) * 15 + ((i * 7919) % 10)
      ),
    []
  );

  const totalSeconds = useMemo(
    () => Math.max(1, Math.ceil(text.trim().split(/\s+/).length / 150) * 60),
    [text]
  );

  const playProgress = (playSeconds / totalSeconds) * 100;

  // Update relative time every 30s
  useEffect(() => {
    const id = setInterval(
      () => setRelativeTime(formatRelativeTime(generatedAt)),
      30_000
    );
    return () => clearInterval(id);
  }, [generatedAt]);

  // Playback simulation
  useEffect(() => {
    if (!isPlaying) return;
    const id = setInterval(() => {
      setPlaySeconds((s) => {
        if (s + 1 >= totalSeconds) {
          setIsPlaying(false);
          return 0;
        }
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
    setTimeout(() => {
      setIsGenerating(false);
      setIsGenerated(true);
    }, 2000);
  };

  const activeVoice = clonedVoices.find((v) => v.id === selectedVoice);

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left panel */}
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
            {/* Pill / segmented control */}
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
              {/* Disabled tab wrapped so the title tooltip still fires */}
              <div
                title="Próximamente"
                className="flex-1 cursor-not-allowed"
              >
                <TabsTrigger
                  value="system"
                  disabled
                  className="w-full text-[10px] h-full gap-1"
                >
                  <Monitor className="w-3 h-3" />
                  Sistema
                </TabsTrigger>
              </div>
            </TabsList>

            <TabsContent value="upload">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                }}
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
                    <Badge
                      key={ext}
                      className="text-[9px] px-1 py-0 bg-[#1A1A1A] border-[#2A2A2A] text-[#666]"
                    >
                      {ext}
                    </Badge>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="record">
              <MicRecorder />
            </TabsContent>

            {/* System tab content unreachable (disabled) */}
            <TabsContent value="system" />
          </Tabs>
        </div>

        {/* Voices list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          <p className="text-[10px] font-semibold text-[#555] uppercase tracking-wider px-2 mb-1">
            Voces clonadas ({clonedVoices.length})
          </p>
          {clonedVoices.map((voice) => (
            <button
              key={voice.id}
              onClick={() => setSelectedVoice(voice.id)}
              className={`w-full text-left p-3 rounded-xl border transition-all ${
                selectedVoice === voice.id
                  ? "bg-[#FF0033]/10 border-[#FF0033]/40"
                  : "bg-[#161616] border-[#222] hover:border-[#333]"
              }`}
            >
              <div className="flex items-start gap-2.5">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    selectedVoice === voice.id
                      ? "bg-[#FF0033]/20"
                      : "bg-[#1E1E1E]"
                  }`}
                >
                  <Mic
                    className="w-4 h-4"
                    style={{
                      width: 16,
                      height: 16,
                      color: selectedVoice === voice.id ? "#FF0033" : "#666",
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-semibold text-white truncate">
                      {voice.name}
                    </p>
                    {voice.status === "ready" ? (
                      <CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0" />
                    ) : (
                      <Clock className="w-3 h-3 text-yellow-500 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] text-[#666] truncate">
                    {voice.description}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                    <span className="text-[10px] text-[#555]">
                      {voice.samples} muestras
                    </span>
                    <span className="text-[#333]">·</span>
                    <span className="text-[10px] text-[#555]">
                      {voice.duration}
                    </span>
                    {/* Language badge */}
                    <span className="ml-auto inline-flex items-center text-[9px] px-1.5 py-0.5 rounded-full bg-[#1A1A1A] border border-[#2A2A2A] text-[#777] font-medium tracking-wide">
                      {voice.language}
                    </span>
                    {/* Personality slot — placeholder for future field */}
                    {voice.personality && (
                      <span className="inline-flex items-center text-[9px] px-1.5 py-0.5 rounded-full bg-[#1A1A1A] border border-[#2A2A2A] text-[#777] font-medium">
                        {voice.personality}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Settings bar */}
        <div className="border-b border-[#2A2A2A] px-6 py-3 bg-[#111111]/50 flex items-center gap-4">
          <div className="flex items-center gap-3">
            <label className="text-xs text-[#888]">Voz seleccionada</label>
            <Select
              value={selectedVoice}
              onValueChange={(v) => v && setSelectedVoice(v)}
            >
              <SelectTrigger className="w-44 h-8 bg-[#1A1A1A] border-[#2A2A2A] text-white text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A] text-white">
                {clonedVoices.map((v) => (
                  <SelectItem
                    key={v.id}
                    value={v.id}
                    className="text-sm hover:bg-white/5"
                  >
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
                  <SelectItem
                    key={s}
                    value={s.replace("x", "")}
                    className="text-sm hover:bg-white/5"
                  >
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
                  <SelectItem
                    key={s}
                    value={s.toLowerCase()}
                    className="text-sm hover:bg-white/5"
                  >
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
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">
                Texto a convertir en audio
              </h3>
              <p className="text-xs text-[#666] mt-0.5">
                {text.trim().split(/\s+/).length} palabras · ~
                {Math.ceil(text.trim().split(/\s+/).length / 150)} min de audio
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-[#888] hover:text-white border border-[#2A2A2A] gap-1.5 h-7"
            >
              <Wand2 className="w-3 h-3" />
              Optimizar texto
            </Button>
          </div>

          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="flex-1 bg-[#131313] border-[#2A2A2A] text-[#E0E0E0] text-sm leading-7 resize-none focus:border-[#FF0033]/40"
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

          {/* Audio player with waveform */}
          {isGenerated && (
            <Card className="bg-[#171717] border-[#2A2A2A] p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-semibold text-white">
                    Audio generado
                  </p>
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
                          backgroundColor:
                            barPct <= playProgress
                              ? "#FF0033"
                              : "rgba(255,0,51,0.25)",
                        }}
                      />
                    );
                  })}
                </div>
                {/* Playhead overlay */}
                <div
                  className="absolute top-0 bottom-0 bg-[#FF0033]/8 border-r border-[#FF0033]/60 pointer-events-none"
                  style={{ left: 16, width: `calc(${playProgress}% - 4px)` }}
                />
              </div>

              {/* Controls */}
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

                {/* Progress bar — also seekable */}
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
                  onClick={() => {
                    setIsPlaying(false);
                    setPlaySeconds(0);
                  }}
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
  );
}

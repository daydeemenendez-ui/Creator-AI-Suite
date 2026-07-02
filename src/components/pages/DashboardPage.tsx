"use client";

import {
  TrendingUp,
  Video,
  FileText,
  Mic,
  Zap,
  Clock,
  ArrowRight,
  BarChart2,
  Play,
  Plus,
  X,
  Loader2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";

interface Activity {
  id: string;
  type: "research" | "content" | "voice" | "idea";
  title: string;
  status: string;
  createdAt: string;
  href: string;
}

interface Project {
  id: string;
  name: string;
  color: string;
  videos: number;
  status: string;
  updatedAt: string;
}

interface DashboardData {
  stats: { analyses: number; content: number; voices: number; ideas: number };
  activity: Activity[];
  projects: Project[];
}

const quickAccess = [
  { label: "Analizar video",  href: "/research", icon: Video,    desc: "URL de YouTube" },
  { label: "Crear contenido", href: "/content",  icon: FileText, desc: "Scripts & posts" },
  { label: "Clonar voz",      href: "/voice",    icon: Mic,      desc: "Síntesis de voz" },
  { label: "Nueva idea",      href: "/ideas",    icon: Zap,      desc: "Banco de ideas" },
];

const projectColors = ["#FF0033", "#FF6B00", "#00C9FF", "#A855F7", "#10B981", "#F59E0B"];

const activityMeta: Record<Activity["type"], { icon: typeof Video; color: string }> = {
  research: { icon: Video, color: "#FF0033" },
  content:  { icon: FileText, color: "#FF6B00" },
  voice:    { icon: Mic, color: "#00C9FF" },
  idea:     { icon: Zap, color: "#A855F7" },
};

const positiveStatuses = new Set(["completado", "listo", "convertida"]);

function formatRelativeTime(iso: string) {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "ahora";
  if (diffMin < 60) return `hace ${diffMin} min`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `hace ${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "ayer";
  if (diffDays < 7) return `hace ${diffDays} días`;
  return date.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}

function NewProjectParamWatcher({ onTrigger }: { onTrigger: () => void }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  useEffect(() => {
    if (searchParams.get("newProject") === "1") {
      onTrigger();
      router.replace("/");
    }
  }, [searchParams, router, onTrigger]);
  return null;
}

export function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [selectedColor, setSelectedColor] = useState(projectColors[0]);
  const [saving, setSaving] = useState(false);

  async function fetchDashboard() {
    try {
      const res = await fetch("/api/dashboard");
      const json = await res.json();
      setData(json);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDashboard();
  }, []);

  async function handleCreateProject() {
    if (!newProjectName.trim()) return;
    setSaving(true);
    try {
      const formData = new FormData();
      formData.set("action", "create_project");
      formData.set("name", newProjectName.trim());
      formData.set("color", selectedColor);
      await fetch("/api/dashboard", { method: "POST", body: formData });
      await fetchDashboard();
      setNewProjectName("");
      setSelectedColor(projectColors[0]);
      setShowNewProject(false);
    } finally {
      setSaving(false);
    }
  }

  const stats = data
    ? [
        { label: "Análisis completados", value: data.stats.analyses, icon: BarChart2, href: "/research" },
        { label: "Contenido generado",   value: data.stats.content,  icon: FileText,  href: "/content" },
        { label: "Voces clonadas",       value: data.stats.voices,   icon: Mic,       href: "/voice" },
        { label: "Ideas guardadas",      value: data.stats.ideas,    icon: Zap,       href: "/ideas" },
      ]
    : [];

  return (
    <>
      <Suspense fallback={null}>
        <NewProjectParamWatcher onTrigger={() => setShowNewProject(true)} />
      </Suspense>

      <div className="p-7 space-y-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard</h1>
            <p className="text-zinc-500 text-sm mt-1">Bienvenido de vuelta — aquí está tu resumen</p>
          </div>
          <Button
            onClick={() => setShowNewProject(true)}
            className="bg-[#FF0033] hover:bg-[#e8002e] text-white gap-2 shadow-[0_0_16px_rgba(255,0,51,0.2)] hover:shadow-[0_0_24px_rgba(255,0,51,0.3)] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Nuevo proyecto
          </Button>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20 text-zinc-600">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Cargando dashboard...
          </div>
        )}

        {!loading && data && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <Card
                    key={stat.label}
                    onClick={() => router.push(stat.href)}
                    className="bg-[#141414] border border-white/[0.08] p-5 hover:border-white/[0.14] hover:bg-[#181818] transition-all group cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div className="w-9 h-9 rounded-xl bg-[#FF0033]/10 flex items-center justify-center group-hover:bg-[#FF0033]/15 transition-colors">
                        <Icon style={{ width: 17, height: 17 }} className="text-[#FF0033]" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-2xl font-bold text-white tracking-tight">{stat.value}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">{stat.label}</p>
                    </div>
                  </Card>
                );
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Quick Access */}
              <div className="space-y-3">
                <h2 className="text-xs font-semibold text-zinc-600 uppercase tracking-widest">Acceso rápido</h2>
                <div className="grid grid-cols-2 gap-3">
                  {quickAccess.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link key={item.href} href={item.href}>
                        <Card className="bg-[#141414] border border-white/[0.08] p-4 hover:border-white/[0.14] hover:bg-[#181818] transition-all cursor-pointer group h-full">
                          <Icon style={{ width: 20, height: 20 }} className="text-[#FF0033] mb-3" />
                          <p className="text-sm font-semibold text-white tracking-tight">{item.label}</p>
                          <p className="text-[11px] text-zinc-600 mt-0.5">{item.desc}</p>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="lg:col-span-2 space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-semibold text-zinc-600 uppercase tracking-widest">Actividad reciente</h2>
                  <button
                    onClick={() => router.push("/research")}
                    className="text-xs text-[#FF0033] hover:text-[#e8002e] flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    Ver todo <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
                <Card className="bg-[#141414] border border-white/[0.08] divide-y divide-white/[0.05] overflow-hidden">
                  {data.activity.length === 0 && (
                    <div className="p-6 text-center text-xs text-zinc-600">
                      Aún no hay actividad. Empieza analizando un video o generando contenido.
                    </div>
                  )}
                  {data.activity.map((item) => {
                    const meta = activityMeta[item.type];
                    const Icon = meta.icon;
                    const positive = positiveStatuses.has(item.status);
                    return (
                      <div
                        key={item.id}
                        onClick={() => router.push(item.href)}
                        className="flex items-center gap-3 p-4 hover:bg-white/[0.03] transition-colors cursor-pointer"
                      >
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: `${meta.color}12` }}
                        >
                          <Icon style={{ color: meta.color, width: 15, height: 15 }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-zinc-200 font-medium truncate">{item.title}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Clock className="w-3 h-3 text-zinc-700" />
                            <span className="text-[11px] text-zinc-600">{formatRelativeTime(item.createdAt)}</span>
                          </div>
                        </div>
                        <Badge
                          className="text-[10px] capitalize flex-shrink-0"
                          style={{
                            background: positive ? "rgba(34,197,94,0.08)" : "rgba(255,255,255,0.04)",
                            color: positive ? "#4ade80" : "#71717a",
                            borderColor: positive ? "rgba(74,222,128,0.2)" : "rgba(255,255,255,0.08)",
                          }}
                        >
                          {item.status}
                        </Badge>
                      </div>
                    );
                  })}
                </Card>
              </div>
            </div>

            {/* Projects */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-semibold text-zinc-600 uppercase tracking-widest">Proyectos</h2>
                <button
                  onClick={() => setShowNewProject(true)}
                  className="text-xs text-[#FF0033] hover:text-[#e8002e] flex items-center gap-1 cursor-pointer transition-colors"
                >
                  Gestionar <ArrowRight className="w-3 h-3" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {data.projects.map((proj) => (
                  <Card
                    key={proj.id}
                    onClick={() => router.push("/research")}
                    className="bg-[#141414] border border-white/[0.08] p-5 hover:border-white/[0.14] hover:bg-[#181818] transition-all group cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${proj.color}15` }}>
                        <Play style={{ color: proj.color, width: 18, height: 18 }} />
                      </div>
                      <Badge
                        className="text-[10px]"
                        style={{
                          background: `${proj.color}12`,
                          color: proj.color,
                          borderColor: `${proj.color}25`,
                        }}
                      >
                        {proj.status}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-white mb-1 tracking-tight">{proj.name}</h3>
                    <p className="text-xs text-zinc-600">{proj.videos} videos analizados</p>
                    <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between">
                      <span className="text-[11px] text-zinc-700">Actualizado {formatRelativeTime(proj.updatedAt)}</span>
                      <TrendingUp className="w-3.5 h-3.5 text-zinc-700 group-hover:text-[#FF0033] transition-colors" />
                    </div>
                  </Card>
                ))}

                {/* Add project card */}
                <Card
                  onClick={() => setShowNewProject(true)}
                  className="bg-[#0f0f0f] border border-white/[0.06] border-dashed p-5 hover:border-[#FF0033]/25 hover:bg-[#FF0033]/[0.03] transition-all cursor-pointer group flex flex-col items-center justify-center min-h-[148px]"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#FF0033]/10 flex items-center justify-center mb-3 group-hover:bg-[#FF0033]/15 transition-colors">
                    <Plus className="w-5 h-5 text-[#FF0033]" />
                  </div>
                  <p className="text-sm font-semibold text-zinc-600 group-hover:text-zinc-300 transition-colors">Nuevo proyecto</p>
                </Card>
              </div>
            </div>
          </>
        )}
      </div>

      {/* New Project Modal */}
      {showNewProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setShowNewProject(false)} />
          <div className="relative bg-[#161616] border border-white/10 rounded-2xl p-6 w-full max-w-md mx-4 shadow-[0_24px_80px_rgba(0,0,0,0.8)]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white tracking-tight">Nuevo proyecto</h2>
              <button
                onClick={() => setShowNewProject(false)}
                className="text-zinc-600 hover:text-zinc-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="text-xs font-semibold text-zinc-600 uppercase tracking-wider block mb-2">
                  Nombre del proyecto
                </label>
                <Input
                  autoFocus
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreateProject()}
                  placeholder="Ej: Canal Principal, Podcast 2025..."
                  className="bg-[#111111] border-white/10 text-white placeholder:text-zinc-700 focus:border-[#FF0033]/40"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-600 uppercase tracking-wider block mb-2">
                  Color
                </label>
                <div className="flex items-center gap-2">
                  {projectColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className="w-7 h-7 rounded-full transition-all"
                      style={{
                        background: color,
                        outline: selectedColor === color ? `2px solid ${color}` : "none",
                        outlineOffset: "2px",
                        transform: selectedColor === color ? "scale(1.15)" : "scale(1)",
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-7">
              <Button
                variant="ghost"
                onClick={() => setShowNewProject(false)}
                className="flex-1 border border-white/10 text-zinc-500 hover:text-white hover:border-white/[0.18] transition-all"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreateProject}
                disabled={!newProjectName.trim() || saving}
                className="flex-1 bg-[#FF0033] hover:bg-[#e8002e] text-white shadow-[0_0_16px_rgba(255,0,51,0.2)] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                {saving ? "Creando..." : "Crear proyecto"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

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
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

const stats = [
  { label: "Análisis completados", value: "48", icon: BarChart2, change: "+12%", href: "/research" },
  { label: "Contenido generado", value: "234", icon: FileText, change: "+28%", href: "/content" },
  { label: "Voces clonadas", value: "6", icon: Mic, change: "+2", href: "/voice" },
  { label: "Ideas guardadas", value: "91", icon: Zap, change: "+15%", href: "/ideas" },
];

const recentActivity = [
  { type: "research", title: "Análisis: '10 Tips para YouTubers'", time: "hace 2 horas", status: "completado", icon: Video, color: "#FF0033", href: "/research" },
  { type: "content", title: "Guión generado: 'Cómo usar IA en 2025'", time: "hace 4 horas", status: "borrador", icon: FileText, color: "#FF6B00", href: "/content" },
  { type: "voice", title: "Audio clonado: Voz Principal", time: "ayer", status: "listo", icon: Mic, color: "#00C9FF", href: "/voice" },
  { type: "idea", title: "Idea: 'Tutorial React en 5 minutos'", time: "ayer", status: "pendiente", icon: Zap, color: "#A855F7", href: "/ideas" },
];

const quickAccess = [
  { label: "Analizar video", href: "/research", icon: Video, desc: "URL de YouTube" },
  { label: "Crear contenido", href: "/content", icon: FileText, desc: "Scripts & posts" },
  { label: "Clonar voz", href: "/voice", icon: Mic, desc: "Síntesis de voz" },
  { label: "Nueva idea", href: "/ideas", icon: Zap, desc: "Banco de ideas" },
];

const initialProjects = [
  { name: "Canal Principal", videos: 12, status: "Activo", lastUpdate: "hoy", color: "#FF0033" },
  { name: "Shorts Factory", videos: 8, status: "En proceso", lastUpdate: "ayer", color: "#FF6B00" },
  { name: "Podcast Series", videos: 4, status: "Planeando", lastUpdate: "hace 3 días", color: "#00C9FF" },
];

const projectColors = ["#FF0033", "#FF6B00", "#00C9FF", "#A855F7", "#10B981", "#F59E0B"];

export function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [projects, setProjects] = useState(initialProjects);
  const [showNewProject, setShowNewProject] = useState(false);

  useEffect(() => {
    if (searchParams.get("newProject") === "1") {
      setShowNewProject(true);
      router.replace("/");
    }
  }, [searchParams, router]);
  const [newProjectName, setNewProjectName] = useState("");
  const [selectedColor, setSelectedColor] = useState(projectColors[0]);

  function handleCreateProject() {
    if (!newProjectName.trim()) return;
    setProjects((prev) => [
      ...prev,
      { name: newProjectName.trim(), videos: 0, status: "Nuevo", lastUpdate: "ahora", color: selectedColor },
    ]);
    setNewProjectName("");
    setSelectedColor(projectColors[0]);
    setShowNewProject(false);
  }

  return (
    <>
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            <p className="text-[#888] text-sm mt-0.5">Bienvenido de vuelta — aquí está tu resumen</p>
          </div>
          <Button
            onClick={() => setShowNewProject(true)}
            className="bg-[#FF0033] hover:bg-[#CC0029] text-white gap-2 shadow-lg shadow-red-950/30 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Nuevo proyecto
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card
                key={stat.label}
                onClick={() => router.push(stat.href)}
                className="bg-[#171717] border-[#2A2A2A] p-4 hover:border-[#FF0033]/30 transition-colors group cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="w-9 h-9 rounded-lg bg-[#FF0033]/10 flex items-center justify-center group-hover:bg-[#FF0033]/20 transition-colors">
                    <Icon style={{ width: 18, height: 18 }} className="text-[#FF0033]" />
                  </div>
                  <Badge className="text-[10px] bg-green-500/10 text-green-400 border-green-500/20 font-medium">
                    {stat.change}
                  </Badge>
                </div>
                <div className="mt-3">
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-[#888] mt-0.5">{stat.label}</p>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Access */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-[#888] uppercase tracking-wider">Acceso rápido</h2>
            <div className="grid grid-cols-2 gap-3">
              {quickAccess.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href}>
                    <Card className="bg-[#171717] border-[#2A2A2A] p-4 hover:border-[#FF0033]/40 hover:bg-[#FF0033]/5 transition-all cursor-pointer group h-full">
                      <Icon style={{ width: 20, height: 20 }} className="text-[#FF0033] mb-3" />
                      <p className="text-sm font-semibold text-white">{item.label}</p>
                      <p className="text-[11px] text-[#666] mt-0.5">{item.desc}</p>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[#888] uppercase tracking-wider">Actividad reciente</h2>
              <button
                onClick={() => router.push("/research")}
                className="text-xs text-[#FF0033] hover:text-[#CC0029] flex items-center gap-1 cursor-pointer"
              >
                Ver todo <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <Card className="bg-[#171717] border-[#2A2A2A] divide-y divide-[#222]">
              {recentActivity.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div
                    key={i}
                    onClick={() => router.push(item.href)}
                    className="flex items-center gap-3 p-4 hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: `${item.color}15` }}
                    >
                      <Icon style={{ color: item.color, width: 16, height: 16 }} className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium truncate">{item.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Clock className="w-3 h-3 text-[#666]" />
                        <span className="text-[11px] text-[#666]">{item.time}</span>
                      </div>
                    </div>
                    <Badge
                      className="text-[10px] capitalize flex-shrink-0"
                      style={{
                        background: item.status === "completado" || item.status === "listo" ? "rgba(34,197,94,0.1)" : "rgba(255,255,255,0.05)",
                        color: item.status === "completado" || item.status === "listo" ? "#22c55e" : "#888",
                        borderColor: item.status === "completado" || item.status === "listo" ? "rgba(34,197,94,0.2)" : "#333",
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
            <h2 className="text-sm font-semibold text-[#888] uppercase tracking-wider">Proyectos</h2>
            <button
              onClick={() => setShowNewProject(true)}
              className="text-xs text-[#FF0033] hover:text-[#CC0029] flex items-center gap-1 cursor-pointer"
            >
              Gestionar <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {projects.map((proj) => (
              <Card
                key={proj.name}
                onClick={() => router.push("/research")}
                className="bg-[#171717] border-[#2A2A2A] p-5 hover:border-[#333] transition-colors group cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${proj.color}20` }}>
                    <Play style={{ color: proj.color, width: 20, height: 20 }} />
                  </div>
                  <Badge className="text-[10px]" style={{ background: `${proj.color}15`, color: proj.color, borderColor: `${proj.color}30` }}>
                    {proj.status}
                  </Badge>
                </div>
                <h3 className="font-semibold text-white mb-1">{proj.name}</h3>
                <p className="text-xs text-[#666]">{proj.videos} videos analizados</p>
                <div className="mt-3 pt-3 border-t border-[#222] flex items-center justify-between">
                  <span className="text-[11px] text-[#555]">Actualizado {proj.lastUpdate}</span>
                  <TrendingUp className="w-3.5 h-3.5 text-[#555] group-hover:text-[#FF0033] transition-colors" />
                </div>
              </Card>
            ))}

            {/* Add project card */}
            <Card
              onClick={() => setShowNewProject(true)}
              className="bg-[#131313] border-[#2A2A2A] border-dashed p-5 hover:border-[#FF0033]/30 hover:bg-[#FF0033]/3 transition-all cursor-pointer group flex flex-col items-center justify-center min-h-[140px]"
            >
              <div className="w-10 h-10 rounded-xl bg-[#FF0033]/10 flex items-center justify-center mb-3 group-hover:bg-[#FF0033]/20 transition-colors">
                <Plus className="w-5 h-5 text-[#FF0033]" />
              </div>
              <p className="text-sm font-semibold text-[#888] group-hover:text-white transition-colors">Nuevo proyecto</p>
            </Card>
          </div>
        </div>
      </div>

      {/* New Project Modal */}
      {showNewProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowNewProject(false)} />
          <div className="relative bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-white">Nuevo proyecto</h2>
              <button onClick={() => setShowNewProject(false)} className="text-[#666] hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#888] uppercase tracking-wider block mb-2">
                  Nombre del proyecto
                </label>
                <Input
                  autoFocus
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreateProject()}
                  placeholder="Ej: Canal Principal, Podcast 2025..."
                  className="bg-[#111] border-[#2A2A2A] text-white placeholder:text-[#444] focus:border-[#FF0033]/50"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#888] uppercase tracking-wider block mb-2">
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

            <div className="flex gap-3 mt-6">
              <Button
                variant="ghost"
                onClick={() => setShowNewProject(false)}
                className="flex-1 border border-[#2A2A2A] text-[#888] hover:text-white hover:border-[#444]"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreateProject}
                disabled={!newProjectName.trim()}
                className="flex-1 bg-[#FF0033] hover:bg-[#CC0029] text-white disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Crear proyecto
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

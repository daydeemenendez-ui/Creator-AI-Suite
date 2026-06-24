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
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const stats = [
  { label: "Análisis completados", value: "48", icon: BarChart2, change: "+12%" },
  { label: "Contenido generado", value: "234", icon: FileText, change: "+28%" },
  { label: "Voces clonadas", value: "6", icon: Mic, change: "+2" },
  { label: "Ideas guardadas", value: "91", icon: Zap, change: "+15%" },
];

const recentActivity = [
  {
    type: "research",
    title: "Análisis: '10 Tips para YouTubers'",
    time: "hace 2 horas",
    status: "completado",
    icon: Video,
    color: "#FF0033",
  },
  {
    type: "content",
    title: "Guión generado: 'Cómo usar IA en 2025'",
    time: "hace 4 horas",
    status: "borrador",
    icon: FileText,
    color: "#FF6B00",
  },
  {
    type: "voice",
    title: "Audio clonado: Voz Principal",
    time: "ayer",
    status: "listo",
    icon: Mic,
    color: "#00C9FF",
  },
  {
    type: "idea",
    title: "Idea: 'Tutorial React en 5 minutos'",
    time: "ayer",
    status: "pendiente",
    icon: Zap,
    color: "#A855F7",
  },
];

const quickAccess = [
  { label: "Analizar video", href: "/research", icon: Video, desc: "URL de YouTube" },
  { label: "Crear contenido", href: "/content", icon: FileText, desc: "Scripts & posts" },
  { label: "Clonar voz", href: "/voice", icon: Mic, desc: "Síntesis de voz" },
  { label: "Nueva idea", href: "/ideas", icon: Zap, desc: "Banco de ideas" },
];

const projects = [
  { name: "Canal Principal", videos: 12, status: "Activo", lastUpdate: "hoy", color: "#FF0033" },
  { name: "Shorts Factory", videos: 8, status: "En proceso", lastUpdate: "ayer", color: "#FF6B00" },
  { name: "Podcast Series", videos: 4, status: "Planeando", lastUpdate: "hace 3 días", color: "#00C9FF" },
];

export function DashboardPage() {
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-[#888] text-sm mt-0.5">Bienvenido de vuelta — aquí está tu resumen</p>
        </div>
        <Button className="bg-[#FF0033] hover:bg-[#CC0029] text-white gap-2 shadow-lg shadow-red-950/30">
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
              className="bg-[#171717] border-[#2A2A2A] p-4 hover:border-[#FF0033]/30 transition-colors group"
            >
              <div className="flex items-start justify-between">
                <div className="w-9 h-9 rounded-lg bg-[#FF0033]/10 flex items-center justify-center group-hover:bg-[#FF0033]/20 transition-colors">
                  <Icon className="w-4.5 h-4.5 text-[#FF0033]" style={{ width: 18, height: 18 }} />
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
          <h2 className="text-sm font-semibold text-[#888] uppercase tracking-wider">
            Acceso rápido
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {quickAccess.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href}>
                  <Card className="bg-[#171717] border-[#2A2A2A] p-4 hover:border-[#FF0033]/40 hover:bg-[#FF0033]/5 transition-all cursor-pointer group h-full">
                    <Icon
                      className="w-5 h-5 text-[#FF0033] mb-3"
                      style={{ width: 20, height: 20 }}
                    />
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
            <h2 className="text-sm font-semibold text-[#888] uppercase tracking-wider">
              Actividad reciente
            </h2>
            <button className="text-xs text-[#FF0033] hover:text-[#CC0029] flex items-center gap-1">
              Ver todo <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <Card className="bg-[#171717] border-[#2A2A2A] divide-y divide-[#222]">
            {recentActivity.map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="flex items-center gap-3 p-4 hover:bg-white/2 transition-colors">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${item.color}15` }}
                  >
                    <Icon className="w-4 h-4" style={{ color: item.color, width: 16, height: 16 }} />
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
                      background: item.status === "completado" || item.status === "listo"
                        ? "rgba(34,197,94,0.1)"
                        : "rgba(255,255,255,0.05)",
                      color: item.status === "completado" || item.status === "listo"
                        ? "#22c55e"
                        : "#888",
                      borderColor: item.status === "completado" || item.status === "listo"
                        ? "rgba(34,197,94,0.2)"
                        : "#333",
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
          <h2 className="text-sm font-semibold text-[#888] uppercase tracking-wider">
            Proyectos
          </h2>
          <button className="text-xs text-[#FF0033] hover:text-[#CC0029] flex items-center gap-1">
            Gestionar <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {projects.map((proj) => (
            <Card
              key={proj.name}
              className="bg-[#171717] border-[#2A2A2A] p-5 hover:border-[#333] transition-colors group cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${proj.color}20` }}
                >
                  <Play
                    className="w-5 h-5"
                    style={{ color: proj.color, width: 20, height: 20 }}
                  />
                </div>
                <Badge
                  className="text-[10px]"
                  style={{
                    background: `${proj.color}15`,
                    color: proj.color,
                    borderColor: `${proj.color}30`,
                  }}
                >
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
        </div>
      </div>
    </div>
  );
}

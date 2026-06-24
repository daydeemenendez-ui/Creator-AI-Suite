"use client";

import { Bell, ChevronDown, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const projects = [
  { id: 1, name: "Canal Principal", color: "#FF0033" },
  { id: 2, name: "Shorts Factory", color: "#FF6B00" },
  { id: 3, name: "Podcast Series", color: "#00C9FF" },
];

export function Topbar() {
  return (
    <header className="h-[60px] flex items-center justify-between px-6 border-b border-[#2A2A2A] bg-[#111111]/80 backdrop-blur-sm flex-shrink-0">
      {/* Project selector */}
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors outline-none cursor-pointer">
          <div className="w-2 h-2 rounded-full bg-[#FF0033] shadow-sm shadow-red-500/50" />
          <span className="text-sm font-medium text-white">Canal Principal</span>
          <ChevronDown className="w-3.5 h-3.5 text-[#666]" />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="w-52 bg-[#1A1A1A] border-[#2A2A2A] text-white"
        >
          <div className="px-2 py-1.5 text-[10px] font-semibold text-[#666] uppercase tracking-wider">
            Proyectos
          </div>
          {projects.map((p) => (
            <DropdownMenuItem key={p.id} className="flex items-center gap-2 cursor-pointer">
              <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
              <span className="text-sm">{p.name}</span>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
            <Plus className="w-3.5 h-3.5" />
            <span className="text-sm">Nuevo proyecto</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Center search */}
      <div className="hidden md:flex items-center gap-2 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-1.5 w-64 hover:border-[#444] transition-colors cursor-pointer">
        <Search className="w-3.5 h-3.5 text-[#666]" />
        <span className="text-sm text-[#555]">Buscar en el proyecto...</span>
        <kbd className="ml-auto text-[10px] text-[#444] bg-[#222] px-1.5 py-0.5 rounded font-mono">
          ⌘K
        </kbd>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          className="bg-[#FF0033] hover:bg-[#CC0029] text-white border-0 shadow-lg shadow-red-950/30 gap-1.5 h-8 px-3"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="text-xs font-medium">Nuevo análisis</span>
        </Button>

        <button className="relative w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center transition-colors">
          <Bell className="w-4 h-4 text-[#888]" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#FF0033]" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 hover:bg-white/5 rounded-lg p-1 transition-colors outline-none cursor-pointer">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#FF0033] to-[#CC0029] flex items-center justify-center text-xs font-bold text-white">
              C
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44 bg-[#1A1A1A] border-[#2A2A2A] text-white">
            <div className="px-3 py-2">
              <p className="text-sm font-medium">Creator User</p>
              <p className="text-xs text-[#666]">Pro Plan</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-sm cursor-pointer">Perfil</DropdownMenuItem>
            <DropdownMenuItem className="text-sm cursor-pointer">Configuración</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-sm cursor-pointer text-red-400">
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

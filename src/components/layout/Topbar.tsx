"use client";

import { Bell, ChevronDown, Plus, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";

const projects = [
  { id: 1, name: "Canal Principal", color: "#FF0033" },
  { id: 2, name: "Shorts Factory", color: "#FF6B00" },
  { id: 3, name: "Podcast Series", color: "#00C9FF" },
];

const allPages = [
  { label: "Dashboard", href: "/" },
  { label: "Research Studio", href: "/research" },
  { label: "Content Studio", href: "/content" },
  { label: "Voice Studio", href: "/voice" },
  { label: "Banco de Ideas", href: "/ideas" },
  { label: "Prompt Library", href: "/prompts" },
  { label: "Knowledge Base", href: "/knowledge" },
  { label: "AI Playground", href: "/playground" },
  { label: "Settings", href: "/settings" },
];

export function Topbar() {
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeProject, setActiveProject] = useState(projects[0]);
  const searchRef = useRef<HTMLInputElement>(null);

  const filtered = allPages.filter((p) =>
    p.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ⌘K / Ctrl+K opens search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === "Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (searchOpen) setTimeout(() => searchRef.current?.focus(), 50);
  }, [searchOpen]);

  return (
    <>
      <header className="h-[60px] flex items-center justify-between px-6 border-b border-[#2A2A2A] bg-[#111111]/80 backdrop-blur-sm flex-shrink-0">
        {/* Project selector */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors outline-none cursor-pointer">
            <div className="w-2 h-2 rounded-full shadow-sm" style={{ background: activeProject.color }} />
            <span className="text-sm font-medium text-white">{activeProject.name}</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#666]" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-52 bg-[#1A1A1A] border-[#2A2A2A] text-white">
            <div className="px-2 py-1.5 text-[10px] font-semibold text-[#666] uppercase tracking-wider">
              Proyectos
            </div>
            {projects.map((p) => (
              <DropdownMenuItem
                key={p.id}
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => setActiveProject(p)}
              >
                <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                <span className="text-sm">{p.name}</span>
                {activeProject.id === p.id && (
                  <span className="ml-auto text-[10px] text-[#FF0033]">✓</span>
                )}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => router.push("/?newProject=1")}
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="text-sm">Nuevo proyecto</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Center search — clickable */}
        <button
          onClick={() => setSearchOpen(true)}
          className="hidden md:flex items-center gap-2 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-1.5 w-64 hover:border-[#444] transition-colors cursor-pointer"
        >
          <Search className="w-3.5 h-3.5 text-[#666]" />
          <span className="text-sm text-[#555]">Buscar en el proyecto...</span>
          <kbd className="ml-auto text-[10px] text-[#444] bg-[#222] px-1.5 py-0.5 rounded font-mono">
            ⌘K
          </kbd>
        </button>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => router.push("/research")}
            className="bg-[#FF0033] hover:bg-[#CC0029] text-white border-0 shadow-lg shadow-red-950/30 gap-1.5 h-8 px-3 cursor-pointer"
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
              <DropdownMenuItem className="text-sm cursor-pointer" onClick={() => router.push("/settings")}>
                Perfil
              </DropdownMenuItem>
              <DropdownMenuItem className="text-sm cursor-pointer" onClick={() => router.push("/settings")}>
                Configuración
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-sm cursor-pointer text-red-400">
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Search modal */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-24"
          onClick={(e) => e.target === e.currentTarget && setSearchOpen(false)}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSearchOpen(false)} />
          <div className="relative w-full max-w-lg mx-4 bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-[#2A2A2A]">
              <Search className="w-4 h-4 text-[#666] flex-shrink-0" />
              <Input
                ref={searchRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar páginas, funciones..."
                className="flex-1 bg-transparent border-0 text-white placeholder:text-[#555] text-sm focus:ring-0 focus-visible:ring-0 p-0 h-auto"
              />
              <button onClick={() => setSearchOpen(false)} className="text-[#555] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="py-2 max-h-64 overflow-y-auto">
              {(searchQuery ? filtered : allPages).map((page) => (
                <button
                  key={page.href}
                  onClick={() => { router.push(page.href); setSearchOpen(false); setSearchQuery(""); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 text-left transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#FF0033]/10 flex items-center justify-center flex-shrink-0">
                    <Search className="w-3.5 h-3.5 text-[#FF0033]" />
                  </div>
                  <span className="text-sm text-white">{page.label}</span>
                  <span className="ml-auto text-xs text-[#555]">{page.href}</span>
                </button>
              ))}
              {searchQuery && filtered.length === 0 && (
                <p className="px-4 py-6 text-sm text-[#555] text-center">Sin resultados para &ldquo;{searchQuery}&rdquo;</p>
              )}
            </div>
            <div className="px-4 py-2 border-t border-[#222] flex items-center gap-3">
              <span className="text-[10px] text-[#444]">↑↓ navegar</span>
              <span className="text-[10px] text-[#444]">↵ abrir</span>
              <span className="text-[10px] text-[#444]">ESC cerrar</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

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
  { id: 2, name: "Shorts Factory",  color: "#FF6B00" },
  { id: 3, name: "Podcast Series",  color: "#00C9FF" },
];

const allPages = [
  { label: "Dashboard",       href: "/" },
  { label: "Research Studio", href: "/research" },
  { label: "Content Studio",  href: "/content" },
  { label: "Voice Studio",    href: "/voice" },
  { label: "Banco de Ideas",  href: "/ideas" },
  { label: "Prompt Library",  href: "/prompts" },
  { label: "Knowledge Base",  href: "/knowledge" },
  { label: "AI Playground",   href: "/playground" },
  { label: "Settings",        href: "/settings" },
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
      <header className="h-[56px] flex items-center justify-between px-5 border-b border-white/[0.06] bg-[#0d0d0d]/90 backdrop-blur-sm flex-shrink-0">
        {/* Project selector */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-white/[0.04] transition-colors outline-none cursor-pointer">
            <div className="w-2 h-2 rounded-full" style={{ background: activeProject.color }} />
            <span className="text-sm font-medium text-zinc-200">{activeProject.name}</span>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-600" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-52 bg-[#1a1a1a] border border-white/10 text-white shadow-[0_8px_32px_rgba(0,0,0,0.6)]"
          >
            <div className="px-2 py-1.5 text-[10px] font-semibold text-zinc-600 uppercase tracking-wider">
              Proyectos
            </div>
            {projects.map((p) => (
              <DropdownMenuItem
                key={p.id}
                className="flex items-center gap-2 cursor-pointer hover:bg-white/[0.05] focus:bg-white/[0.05]"
                onClick={() => setActiveProject(p)}
              >
                <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                <span className="text-sm">{p.name}</span>
                {activeProject.id === p.id && (
                  <span className="ml-auto text-[10px] text-[#FF0033]">✓</span>
                )}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator className="bg-white/[0.06]" />
            <DropdownMenuItem
              className="flex items-center gap-2 cursor-pointer hover:bg-white/[0.05] focus:bg-white/[0.05]"
              onClick={() => router.push("/?newProject=1")}
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="text-sm">Nuevo proyecto</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Center search */}
        <button
          onClick={() => setSearchOpen(true)}
          className="hidden md:flex items-center gap-2 bg-[#141414] border border-white/[0.08] rounded-xl px-3 py-1.5 w-60 hover:border-white/[0.14] transition-all cursor-pointer"
        >
          <Search className="w-3.5 h-3.5 text-zinc-600" />
          <span className="text-sm text-zinc-600">Buscar en el proyecto...</span>
          <kbd className="ml-auto text-[10px] text-zinc-700 bg-white/[0.05] px-1.5 py-0.5 rounded font-mono">
            ⌘K
          </kbd>
        </button>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => router.push("/research")}
            className="bg-[#FF0033] hover:bg-[#e8002e] text-white border-0 shadow-[0_0_16px_rgba(255,0,51,0.2)] hover:shadow-[0_0_20px_rgba(255,0,51,0.3)] gap-1.5 h-8 px-3 cursor-pointer transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">Nuevo análisis</span>
          </Button>

          <button className="relative w-8 h-8 rounded-xl hover:bg-white/[0.04] flex items-center justify-center transition-colors">
            <Bell className="w-4 h-4 text-zinc-500" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#FF0033]" />
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 hover:bg-white/[0.04] rounded-xl p-1 transition-colors outline-none cursor-pointer">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#FF0033] to-[#CC0029] flex items-center justify-center text-[11px] font-bold text-white shadow-[0_0_8px_rgba(255,0,51,0.2)]">
                C
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-44 bg-[#1a1a1a] border border-white/10 text-white shadow-[0_8px_32px_rgba(0,0,0,0.6)]"
            >
              <div className="px-3 py-2.5 border-b border-white/[0.06]">
                <p className="text-sm font-medium text-zinc-200">Creator User</p>
                <p className="text-xs text-zinc-600">Pro Plan</p>
              </div>
              <DropdownMenuItem
                className="text-sm cursor-pointer hover:bg-white/[0.05] focus:bg-white/[0.05]"
                onClick={() => router.push("/settings")}
              >
                Perfil
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-sm cursor-pointer hover:bg-white/[0.05] focus:bg-white/[0.05]"
                onClick={() => router.push("/settings")}
              >
                Configuración
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/[0.06]" />
              <DropdownMenuItem className="text-sm cursor-pointer text-red-400 hover:bg-white/[0.05] focus:bg-white/[0.05]">
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
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            onClick={() => setSearchOpen(false)}
          />
          <div className="relative w-full max-w-lg mx-4 bg-[#161616] border border-white/10 rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.8)] overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.07]">
              <Search className="w-4 h-4 text-zinc-600 flex-shrink-0" />
              <Input
                ref={searchRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar páginas, funciones..."
                className="flex-1 bg-transparent border-0 text-white placeholder:text-zinc-600 text-sm focus:ring-0 focus-visible:ring-0 p-0 h-auto"
              />
              <button onClick={() => setSearchOpen(false)} className="text-zinc-600 hover:text-zinc-300">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="py-1.5 max-h-64 overflow-y-auto">
              {(searchQuery ? filtered : allPages).map((page) => (
                <button
                  key={page.href}
                  onClick={() => {
                    router.push(page.href);
                    setSearchOpen(false);
                    setSearchQuery("");
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.04] text-left transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#FF0033]/10 flex items-center justify-center flex-shrink-0">
                    <Search className="w-3.5 h-3.5 text-[#FF0033]" />
                  </div>
                  <span className="text-sm text-zinc-200">{page.label}</span>
                  <span className="ml-auto text-xs text-zinc-700 font-mono">{page.href}</span>
                </button>
              ))}
              {searchQuery && filtered.length === 0 && (
                <p className="px-4 py-6 text-sm text-zinc-600 text-center">
                  Sin resultados para &ldquo;{searchQuery}&rdquo;
                </p>
              )}
            </div>
            <div className="px-4 py-2.5 border-t border-white/[0.06] flex items-center gap-4">
              <span className="text-[10px] text-zinc-700">↑↓ navegar</span>
              <span className="text-[10px] text-zinc-700">↵ abrir</span>
              <span className="text-[10px] text-zinc-700">ESC cerrar</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

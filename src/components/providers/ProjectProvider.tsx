"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Project {
  id: string;
  name: string;
  color: string;
}

interface ProjectContextValue {
  projects: Project[];
  activeProject: Project | null;
  setActiveProject: (p: Project) => void;
  openNewProjectModal: () => void;
  refreshProjects: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextValue | null>(null);

export function useProjects() {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error("useProjects must be used within ProjectProvider");
  return ctx;
}

const projectColors = ["#FF0033", "#FF6B00", "#00C9FF", "#A855F7", "#10B981", "#F59E0B"];

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState(projectColors[0]);
  const [saving, setSaving] = useState(false);

  const refreshProjects = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard");
      if (!res.ok) return;
      const data = await res.json() as { projects: Project[] };
      setProjects(data.projects ?? []);
      setActiveProject((prev) => prev ?? data.projects?.[0] ?? null);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => { refreshProjects(); }, [refreshProjects]);

  function openNewProjectModal() {
    setName("");
    setColor(projectColors[0]);
    setShowModal(true);
  }

  async function handleCreate() {
    if (!name.trim() || saving) return;
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("action", "create_project");
      fd.append("name", name.trim());
      fd.append("color", color);
      const res = await fetch("/api/dashboard", { method: "POST", body: fd });
      if (res.ok) {
        const data = await res.json() as { success?: boolean; project?: Project };
        await refreshProjects();
        if (data.project) setActiveProject(data.project);
        setShowModal(false);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <ProjectContext.Provider
      value={{ projects, activeProject, setActiveProject, openNewProjectModal, refreshProjects }}
    >
      {children}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setShowModal(false)} />
          <div className="relative bg-[#161616] border border-white/10 rounded-2xl p-6 w-full max-w-md mx-4 shadow-[0_24px_80px_rgba(0,0,0,0.8)]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white tracking-tight">Nuevo proyecto</h2>
              <button
                onClick={() => setShowModal(false)}
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
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                  placeholder="Ej: Canal Principal, Podcast 2025..."
                  className="bg-[#111111] border-white/10 text-white placeholder:text-zinc-700 focus:border-[#FF0033]/40"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-600 uppercase tracking-wider block mb-2">
                  Color
                </label>
                <div className="flex items-center gap-2">
                  {projectColors.map((c) => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      className="w-7 h-7 rounded-full transition-all"
                      style={{
                        background: c,
                        outline: color === c ? `2px solid ${c}` : "none",
                        outlineOffset: "2px",
                        transform: color === c ? "scale(1.15)" : "scale(1)",
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-7">
              <Button
                variant="ghost"
                onClick={() => setShowModal(false)}
                className="flex-1 border border-white/10 text-zinc-500 hover:text-white hover:border-white/[0.18] transition-all"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreate}
                disabled={!name.trim() || saving}
                className="flex-1 bg-[#FF0033] hover:bg-[#e8002e] text-white shadow-[0_0_16px_rgba(255,0,51,0.2)] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                {saving ? "Creando..." : "Crear proyecto"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </ProjectContext.Provider>
  );
}

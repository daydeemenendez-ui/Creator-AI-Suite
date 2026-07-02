"use client";

import { useEffect, useRef, useState } from "react";
import { Upload, FileText, Trash2, Database, Users, Target, BarChart2, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

type DocType = "documento" | "guia" | "audiencia" | "competencia";

interface Doc {
  id: string;
  name: string;
  type: DocType;
  sizeBytes: number;
  createdAt: string;
}

const TYPE_META: Record<DocType, { label: string; color: string }> = {
  documento:   { label: "Documento",    color: "#3B82F6" },
  guia:        { label: "Guía de estilo", color: "#A855F7" },
  audiencia:   { label: "Audiencia",    color: "#10B981" },
  competencia: { label: "Competencia",  color: "#F59E0B" },
};

const SECTIONS = [
  { id: "documentos",  label: "Documentos",     icon: FileText,  desc: "PDFs, notas, transcripciones" },
  { id: "guia",        label: "Guía de estilo",  icon: FileText,  desc: "Tono, voz, branding del canal" },
  { id: "audiencia",   label: "Audiencia",       icon: Users,     desc: "Perfil de tu público objetivo" },
  { id: "competencia", label: "Competencia",     icon: BarChart2, desc: "Análisis de canales similares" },
];

function formatSize(bytes: number) {
  return bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;
}

function formatDate(iso: string) {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return "hoy";
  if (diffDays === 1) return "ayer";
  if (diffDays < 7) return `hace ${diffDays} días`;
  if (diffDays < 14) return "hace 1 semana";
  return `hace ${Math.floor(diffDays / 7)} semanas`;
}

export function KnowledgePage() {
  const [activeSection, setActiveSection] = useState("documentos");
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [audienceText, setAudienceText] = useState("");
  const [styleText, setStyleText] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/knowledge/documents")
      .then((r) => r.json())
      .then((data: { docs: Doc[] }) => setDocs(data.docs ?? []))
      .finally(() => setLoadingDocs(false));

    fetch("/api/knowledge/preferences")
      .then((r) => r.json())
      .then((data: { audienceText?: string; styleText?: string }) => {
        if (data.audienceText !== undefined) setAudienceText(data.audienceText);
        if (data.styleText !== undefined) setStyleText(data.styleText);
      });
  }, []);

  async function uploadFiles(files: File[]) {
    if (files.length === 0) return;
    setUploading(true);
    const type: DocType = activeSection === "competencia" ? "competencia" : "documento";
    try {
      for (const file of files) {
        const urlRes = await fetch("/api/upload-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileName: file.name, kind: "document" }),
        });
        if (!urlRes.ok) continue;
        const { signedURL, path } = await urlRes.json() as { signedURL: string; path: string };

        const uploadRes = await fetch(signedURL, {
          method: "PUT",
          headers: { "Content-Type": file.type || "application/octet-stream" },
          body: file,
        });
        if (!uploadRes.ok) continue;

        const docRes = await fetch("/api/knowledge/documents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type, name: file.name, path, sizeBytes: file.size }),
        });
        if (docRes.ok) {
          const { doc } = await docRes.json() as { doc: Doc };
          setDocs((prev) => [doc, ...prev]);
        }
      }
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    void uploadFiles(Array.from(e.dataTransfer.files));
  }

  function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    void uploadFiles(Array.from(e.target.files ?? []));
    e.target.value = "";
  }

  async function handleDelete(id: string) {
    setDocs((prev) => prev.filter((d) => d.id !== id));
    await fetch("/api/knowledge/documents", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
  }

  async function handleSave() {
    setSaving(true);
    try {
      await fetch("/api/knowledge/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audienceText, styleText }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  const sectionDocs = activeSection === "documentos"
    ? docs.filter((d) => d.type === "documento")
    : docs.filter((d) => d.type === activeSection);

  return (
    <div className="flex h-full overflow-hidden">
      {/* Sidebar */}
      <div className="w-56 flex-shrink-0 border-r border-white/[0.07] bg-[#0d0d0d] p-3 space-y-1">
        <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider px-3 py-2">
          Knowledge Base
        </p>
        {SECTIONS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveSection(id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all text-left ${
              activeSection === id
                ? "bg-[#FF0033]/10 text-white border border-[#FF0033]/20"
                : "text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-200 border border-transparent"
            }`}
          >
            <Icon className="w-4 h-4 flex-shrink-0" style={{ width: 16, height: 16 }} />
            {label}
          </button>
        ))}

        <div className="pt-4 px-2">
          <Card className="bg-[#141414] border-white/[0.08] p-3">
            <div className="flex items-center gap-2 mb-1">
              <Database className="w-3.5 h-3.5 text-[#FF0033]" />
              <span className="text-xs font-semibold text-white">Contexto activo</span>
            </div>
            <p className="text-[10px] text-zinc-600 leading-4">
              {docs.length} documentos indexados. La IA los usará como referencia al generar contenido.
            </p>
          </Card>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden p-6 gap-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              {SECTIONS.find((s) => s.id === activeSection)?.label}
            </h2>
            <p className="text-xs text-zinc-600 mt-0.5">
              {SECTIONS.find((s) => s.id === activeSection)?.desc}
            </p>
          </div>
          {(activeSection === "audiencia" || activeSection === "guia") && (
            <Button
              onClick={handleSave}
              disabled={saving}
              size="sm"
              className={`gap-1.5 h-8 text-xs transition-all ${
                saved
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-[#FF0033] hover:bg-[#e8002e] shadow-[0_0_12px_rgba(255,0,51,0.15)]"
              } text-white`}
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : saved ? "¡Guardado!" : "Guardar"}
            </Button>
          )}
        </div>

        {/* Text editors */}
        {activeSection === "audiencia" && (
          <Textarea
            value={audienceText}
            onChange={(e) => setAudienceText(e.target.value)}
            className="flex-1 bg-[#111111] border-white/10 text-zinc-200 text-sm leading-7 resize-none focus:border-[#FF0033]/40 font-mono"
            placeholder="Describe tu audiencia: edad, intereses, plataformas, objetivos..."
          />
        )}

        {activeSection === "guia" && (
          <Textarea
            value={styleText}
            onChange={(e) => setStyleText(e.target.value)}
            className="flex-1 bg-[#111111] border-white/10 text-zinc-200 text-sm leading-7 resize-none focus:border-[#FF0033]/40 font-mono"
            placeholder="Define el tono, voz y estilo de tu canal..."
          />
        )}

        {/* File upload */}
        {(activeSection === "documentos" || activeSection === "competencia") && (
          <div className="flex flex-col gap-4 flex-1 overflow-hidden">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.docx,.txt"
              className="hidden"
              onChange={handleFileInputChange}
            />
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer flex-shrink-0 ${
                isDragging
                  ? "border-[#FF0033] bg-[#FF0033]/5"
                  : "border-white/[0.08] hover:border-[#FF0033]/30 hover:bg-[#FF0033]/[0.02]"
              }`}
            >
              {uploading ? (
                <Loader2 className="w-8 h-8 text-[#FF0033] mx-auto mb-2 animate-spin" />
              ) : (
                <Upload className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
              )}
              <p className="text-sm font-medium text-zinc-300">
                {uploading ? "Subiendo archivos..." : "Arrastra archivos aquí o haz clic para elegir"}
              </p>
              <p className="text-xs text-zinc-600 mt-1">PDF, DOCX, TXT — hasta 10MB por archivo</p>
              <div className="flex justify-center gap-2 mt-3">
                {["PDF", "DOCX", "TXT"].map((ext) => (
                  <Badge key={ext} className="text-[10px] bg-white/[0.04] border-white/[0.08] text-zinc-600">
                    {ext}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2">
              {loadingDocs ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 text-zinc-700 animate-spin" />
                </div>
              ) : sectionDocs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Target className="w-10 h-10 text-zinc-800 mb-3" />
                  <p className="text-sm text-zinc-600">No hay documentos en esta sección</p>
                  <p className="text-xs text-zinc-700 mt-1">Arrastra archivos para agregarlos</p>
                </div>
              ) : (
                sectionDocs.map((doc) => {
                  const meta = TYPE_META[doc.type];
                  return (
                    <div
                      key={doc.id}
                      className="flex items-center gap-3 p-3 bg-[#141414] border border-white/[0.08] rounded-xl hover:border-white/[0.14] transition-all group"
                    >
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: `${meta.color}15` }}
                      >
                        <FileText className="w-4 h-4" style={{ color: meta.color, width: 16, height: 16 }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white font-medium truncate">{doc.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge
                            className="text-[9px] px-1.5 py-0"
                            style={{ background: `${meta.color}15`, color: meta.color, borderColor: `${meta.color}30` }}
                          >
                            {meta.label}
                          </Badge>
                          <span className="text-[11px] text-zinc-600">{formatSize(doc.sizeBytes)}</span>
                          <span className="text-[11px] text-zinc-600">· {formatDate(doc.createdAt)}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {sectionDocs.length > 0 && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 text-xs text-[#FF0033] hover:text-[#e8002e] transition-colors py-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Agregar más archivos
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

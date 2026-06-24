"use client";

import { useState } from "react";
import { User, Key, Brain, Download, Save, Eye, EyeOff, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const sections = [
  { id: "cuenta", label: "Cuenta", icon: User },
  { id: "apikeys", label: "API Keys", icon: Key },
  { id: "ia", label: "Preferencias IA", icon: Brain },
  { id: "exportacion", label: "Exportación", icon: Download },
];

export function SettingsPage() {
  const [active, setActive] = useState("cuenta");
  const [saved, setSaved] = useState(false);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

  // Form state
  const [name, setName] = useState("Creator User");
  const [email, setEmail] = useState("creator@example.com");
  const [channel, setChannel] = useState("");
  const [openrouter, setOpenrouter] = useState("");
  const [minimax, setMinimaxKey] = useState("");
  const [supabase, setSupabase] = useState("");
  const [defaultModel, setDefaultModel] = useState("claude-sonnet-4-6");
  const [language, setLanguage] = useState("es");
  const [tone, setTone] = useState("profesional");
  const [exportFormat, setExportFormat] = useState("markdown");

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function toggleKey(key: string) {
    setShowKeys((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Sidebar */}
      <div className="w-56 flex-shrink-0 border-r border-[#2A2A2A] bg-[#111111] p-3 space-y-1">
        <p className="text-[10px] font-semibold text-[#555] uppercase tracking-wider px-3 py-2">
          Configuración
        </p>
        {sections.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActive(id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all text-left ${
              active === id
                ? "bg-[#FF0033]/10 text-white border border-[#FF0033]/20"
                : "text-[#888] hover:bg-white/5 hover:text-white"
            }`}
          >
            <Icon className="w-4 h-4 flex-shrink-0" style={{ width: 16, height: 16 }} />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-xl space-y-6">

          {/* CUENTA */}
          {active === "cuenta" && (
            <>
              <div>
                <h2 className="text-lg font-bold text-white mb-1">Cuenta</h2>
                <p className="text-sm text-[#666]">Tu perfil y plan de suscripción.</p>
              </div>
              <Card className="bg-[#171717] border-[#2A2A2A] p-5 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#FF0033] to-[#CC0029] flex items-center justify-center text-xl font-bold text-white flex-shrink-0">
                    {name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{name}</p>
                    <Badge className="text-[10px] mt-1 bg-[#FF0033]/10 text-[#FF0033] border-[#FF0033]/20">Pro Plan</Badge>
                  </div>
                </div>
                <div className="space-y-3 pt-2 border-t border-[#2A2A2A]">
                  <div>
                    <label className="text-xs font-semibold text-[#888] uppercase tracking-wider block mb-1.5">Nombre</label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} className="bg-[#111] border-[#2A2A2A] text-white focus:border-[#FF0033]/50" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#888] uppercase tracking-wider block mb-1.5">Email</label>
                    <Input value={email} onChange={(e) => setEmail(e.target.value)} className="bg-[#111] border-[#2A2A2A] text-white focus:border-[#FF0033]/50" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#888] uppercase tracking-wider block mb-1.5">Canal de YouTube</label>
                    <Input value={channel} onChange={(e) => setChannel(e.target.value)} placeholder="https://youtube.com/@tucanal" className="bg-[#111] border-[#2A2A2A] text-white placeholder:text-[#444] focus:border-[#FF0033]/50" />
                  </div>
                </div>
              </Card>
            </>
          )}

          {/* API KEYS */}
          {active === "apikeys" && (
            <>
              <div>
                <h2 className="text-lg font-bold text-white mb-1">API Keys</h2>
                <p className="text-sm text-[#666]">Conecta tus servicios externos. Las keys se guardan de forma segura.</p>
              </div>
              {[
                { id: "openrouter", label: "OpenRouter", desc: "Para generación de texto con múltiples modelos IA", value: openrouter, set: setOpenrouter, placeholder: "sk-or-v1-..." },
                { id: "minimax", label: "MiniMax", desc: "Para clonación de voz y síntesis TTS", value: minimax, set: setMinimaxKey, placeholder: "eyJ..." },
                { id: "supabase", label: "Supabase Service Role", desc: "Para almacenamiento de archivos de audio y video", value: supabase, set: setSupabase, placeholder: "eyJhbGc..." },
              ].map(({ id, label, desc, value, set, placeholder }) => (
                <Card key={id} className="bg-[#171717] border-[#2A2A2A] p-5 space-y-3">
                  <div>
                    <p className="text-sm font-semibold text-white">{label}</p>
                    <p className="text-xs text-[#666] mt-0.5">{desc}</p>
                  </div>
                  <div className="relative">
                    <Input
                      type={showKeys[id] ? "text" : "password"}
                      value={value}
                      onChange={(e) => set(e.target.value)}
                      placeholder={placeholder}
                      className="bg-[#111] border-[#2A2A2A] text-white placeholder:text-[#333] focus:border-[#FF0033]/50 pr-10 font-mono text-xs"
                    />
                    <button
                      onClick={() => toggleKey(id)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555] hover:text-white transition-colors"
                    >
                      {showKeys[id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${value ? "bg-green-400" : "bg-[#444]"}`} />
                    <span className="text-[11px] text-[#666]">{value ? "Configurado" : "No configurado"}</span>
                  </div>
                </Card>
              ))}
            </>
          )}

          {/* PREFERENCIAS IA */}
          {active === "ia" && (
            <>
              <div>
                <h2 className="text-lg font-bold text-white mb-1">Preferencias IA</h2>
                <p className="text-sm text-[#666]">Modelo por defecto, idioma y tono de las respuestas.</p>
              </div>
              <Card className="bg-[#171717] border-[#2A2A2A] p-5 space-y-5">
                <div>
                  <label className="text-xs font-semibold text-[#888] uppercase tracking-wider block mb-3">Modelo por defecto</label>
                  <div className="space-y-2">
                    {[
                      { id: "claude-sonnet-4-6", label: "Claude Sonnet 4.6", badge: "Recomendado" },
                      { id: "claude-haiku-4-5", label: "Claude Haiku 4.5", badge: "Rápido" },
                      { id: "gpt-4o", label: "GPT-4o", badge: null },
                      { id: "gpt-4o-mini", label: "GPT-4o mini", badge: "Económico" },
                    ].map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setDefaultModel(m.id)}
                        className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg border text-sm transition-all ${
                          defaultModel === m.id
                            ? "bg-[#FF0033]/10 border-[#FF0033]/30 text-white"
                            : "border-[#2A2A2A] text-[#888] hover:border-[#444] hover:text-white"
                        }`}
                      >
                        <span>{m.label}</span>
                        <div className="flex items-center gap-2">
                          {m.badge && <Badge className="text-[9px] bg-[#FF0033]/10 text-[#FF0033] border-[#FF0033]/20">{m.badge}</Badge>}
                          {defaultModel === m.id && <Check className="w-3.5 h-3.5 text-[#FF0033]" />}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-[#2A2A2A] space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-[#888] uppercase tracking-wider block mb-2">Idioma de respuesta</label>
                    <div className="flex gap-2">
                      {[{ id: "es", label: "Español" }, { id: "en", label: "English" }].map((l) => (
                        <button
                          key={l.id}
                          onClick={() => setLanguage(l.id)}
                          className={`flex-1 py-2 rounded-lg text-sm border transition-all ${
                            language === l.id ? "bg-[#FF0033]/10 border-[#FF0033]/30 text-white" : "border-[#2A2A2A] text-[#888] hover:border-[#444] hover:text-white"
                          }`}
                        >
                          {l.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#888] uppercase tracking-wider block mb-2">Tono de contenido</label>
                    <div className="grid grid-cols-2 gap-2">
                      {["profesional", "casual", "energético", "formal"].map((t) => (
                        <button
                          key={t}
                          onClick={() => setTone(t)}
                          className={`py-2 rounded-lg text-sm capitalize border transition-all ${
                            tone === t ? "bg-[#FF0033]/10 border-[#FF0033]/30 text-white" : "border-[#2A2A2A] text-[#888] hover:border-[#444] hover:text-white"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </>
          )}

          {/* EXPORTACIÓN */}
          {active === "exportacion" && (
            <>
              <div>
                <h2 className="text-lg font-bold text-white mb-1">Exportación</h2>
                <p className="text-sm text-[#666]">Formato y destino por defecto para exportar contenido generado.</p>
              </div>
              <Card className="bg-[#171717] border-[#2A2A2A] p-5 space-y-5">
                <div>
                  <label className="text-xs font-semibold text-[#888] uppercase tracking-wider block mb-3">Formato por defecto</label>
                  <div className="space-y-2">
                    {[
                      { id: "markdown", label: "Markdown (.md)", desc: "Ideal para Notion, Obsidian, GitHub" },
                      { id: "txt", label: "Texto plano (.txt)", desc: "Compatible con cualquier editor" },
                      { id: "docx", label: "Word (.docx)", desc: "Para documentos de Office" },
                      { id: "pdf", label: "PDF (.pdf)", desc: "Para compartir y presentar" },
                    ].map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setExportFormat(f.id)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border text-left transition-all ${
                          exportFormat === f.id ? "bg-[#FF0033]/10 border-[#FF0033]/30" : "border-[#2A2A2A] hover:border-[#444]"
                        }`}
                      >
                        <div>
                          <p className={`text-sm font-medium ${exportFormat === f.id ? "text-white" : "text-[#888]"}`}>{f.label}</p>
                          <p className="text-[11px] text-[#555] mt-0.5">{f.desc}</p>
                        </div>
                        {exportFormat === f.id && <Check className="w-4 h-4 text-[#FF0033] flex-shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>
              </Card>
            </>
          )}

          {/* Save button */}
          <Button
            onClick={handleSave}
            className={`w-full gap-2 h-11 transition-all ${
              saved
                ? "bg-green-600 hover:bg-green-700"
                : "bg-[#FF0033] hover:bg-[#CC0029] shadow-lg shadow-red-950/30"
            } text-white`}
          >
            {saved ? <><Check className="w-4 h-4" /> Guardado</> : <><Save className="w-4 h-4" /> Guardar cambios</>}
          </Button>
        </div>
      </div>
    </div>
  );
}

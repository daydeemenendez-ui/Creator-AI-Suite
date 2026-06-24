"use client";

import { AppShell } from "@/components/layout/AppShell";
import { StubPage } from "@/components/pages/StubPage";
import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <AppShell>
      <StubPage
        title="Settings"
        icon={Settings}
        description="Configura tu cuenta, integraciones de API, preferencias de IA y opciones de exportación."
        items={[
          { label: "Cuenta", desc: "Perfil, plan, facturación" },
          { label: "API Keys", desc: "OpenAI, ElevenLabs..." },
          { label: "Preferencias IA", desc: "Modelos, idioma, tono" },
          { label: "Exportación", desc: "Formatos y destinos" },
        ]}
      />
    </AppShell>
  );
}

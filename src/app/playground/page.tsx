"use client";

import { AppShell } from "@/components/layout/AppShell";
import { StubPage } from "@/components/pages/StubPage";
import { Zap } from "lucide-react";

export default function Playground() {
  return (
    <AppShell>
      <StubPage
        title="AI Playground"
        icon={Zap}
        description="Espacio libre para experimentar con los modelos de IA. Prueba prompts, ajusta parámetros y descubre nuevas posibilidades."
        items={[
          { label: "Chat libre", desc: "Conversación sin estructura" },
          { label: "Comparar modelos", desc: "A/B entre modelos IA" },
          { label: "Ajustar parámetros", desc: "Temperature, tokens..." },
          { label: "Guardar sesiones", desc: "Historial de experimentos" },
        ]}
      />
    </AppShell>
  );
}

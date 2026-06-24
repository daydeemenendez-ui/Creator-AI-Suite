"use client";

import { AppShell } from "@/components/layout/AppShell";
import { StubPage } from "@/components/pages/StubPage";
import { Database } from "lucide-react";

export default function Knowledge() {
  return (
    <AppShell>
      <StubPage
        title="Knowledge Base"
        icon={Database}
        description="Base de conocimiento de tu canal. Sube documentos, notas y recursos que la IA usará como contexto para generar contenido personalizado."
        items={[
          { label: "Documentos", desc: "PDFs, Word, notas" },
          { label: "Guías de estilo", desc: "Tono, voz, branding" },
          { label: "Audiencia", desc: "Perfil de tu público" },
          { label: "Competencia", desc: "Análisis de canales" },
        ]}
      />
    </AppShell>
  );
}

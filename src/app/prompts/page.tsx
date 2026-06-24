"use client";

import { AppShell } from "@/components/layout/AppShell";
import { StubPage } from "@/components/pages/StubPage";
import { BookOpen } from "lucide-react";

export default function Prompts() {
  return (
    <AppShell>
      <StubPage
        title="Prompt Library"
        icon={BookOpen}
        description="Biblioteca de prompts optimizados para creadores. Guarda, organiza y reutiliza tus mejores prompts de IA."
        items={[
          { label: "Prompts de YouTube", desc: "Títulos, descripciones, ideas" },
          { label: "Prompts de guiones", desc: "Intro, desarrollo, CTA" },
          { label: "Prompts de SEO", desc: "Keywords, meta, tags" },
          { label: "Prompts de redes", desc: "Posts, hilos, captions" },
        ]}
      />
    </AppShell>
  );
}

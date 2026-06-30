import { AppShell } from "@/components/layout/AppShell";
import { ResearchPage } from "@/components/pages/ResearchPage";

// Groq Whisper + YouTube audio download can take up to 60s for longer videos
export const maxDuration = 60;

export default function Research() {
  return (
    <AppShell>
      <ResearchPage />
    </AppShell>
  );
}

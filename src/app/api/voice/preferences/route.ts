import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Voice Studio UI preferences — persisted in the DB (not localStorage) so
// they survive across devices/browsers, not just the current one.
const KEY_MAP = {
  selectedVoice: "voice_studio_selected_voice",
  speed: "voice_studio_speed",
  style: "voice_studio_style",
  text: "voice_studio_text",
  ttsModel: "voice_studio_tts_model",
} as const;

type PrefField = keyof typeof KEY_MAP;

export async function GET() {
  const rows = await prisma.appSettings.findMany({
    where: { key: { in: Object.values(KEY_MAP) } },
  });

  const result: Partial<Record<PrefField, string>> = {};
  for (const [field, dbKey] of Object.entries(KEY_MAP) as [PrefField, string][]) {
    const row = rows.find((r) => r.key === dbKey);
    if (row) result[field] = row.value;
  }

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const body = await req.json() as Partial<Record<PrefField, string>>;

  for (const [field, dbKey] of Object.entries(KEY_MAP) as [PrefField, string][]) {
    const value = body[field];
    if (value === undefined) continue;

    await prisma.appSettings.upsert({
      where: { key: dbKey },
      update: { value },
      create: { key: dbKey, value },
    });
  }

  return NextResponse.json({ ok: true });
}

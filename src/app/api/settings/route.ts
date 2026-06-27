import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const KEY_MAP: Record<string, string> = {
  openrouter: "openrouter_api_key",
  minimax:    "minimax_api_key",
  supabase:   "supabase_service_key",
};

export async function POST(req: NextRequest) {
  const body = await req.json() as Record<string, string>;

  for (const [field, dbKey] of Object.entries(KEY_MAP)) {
    const value = body[field];
    if (value === undefined) continue;

    if (value.trim()) {
      await prisma.appSettings.upsert({
        where:  { key: dbKey },
        update: { value: value.trim() },
        create: { key: dbKey, value: value.trim() },
      });
    }
    // Don't delete existing keys if field is empty — user might just leave it blank
  }

  return NextResponse.json({ ok: true });
}

export async function GET() {
  const rows = await prisma.appSettings.findMany({
    where: { key: { in: Object.values(KEY_MAP) } },
  });

  const result: Record<string, string> = {};
  for (const [field, dbKey] of Object.entries(KEY_MAP)) {
    result[field] = rows.find((r) => r.key === dbKey) ? "set" : "";
  }

  return NextResponse.json(result);
}

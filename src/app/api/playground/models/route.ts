import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  // Resolve API key
  let apiKey = process.env.OPENROUTER_API_KEY ?? "";
  if (!apiKey) {
    try {
      const row = await prisma.appSettings.findUnique({ where: { key: "openrouter_api_key" } });
      apiKey = row?.value ?? "";
    } catch { /* DB unavailable */ }
  }

  if (!apiKey) {
    return NextResponse.json({ error: "No OpenRouter API key configured" }, { status: 401 });
  }

  const res = await fetch("https://openrouter.ai/api/v1/models", {
    headers: { Authorization: `Bearer ${apiKey}` },
    next: { revalidate: 3600 }, // cache 1 hour
  });

  if (!res.ok) {
    return NextResponse.json({ error: "Failed to fetch models" }, { status: 502 });
  }

  const data = await res.json() as { data: Array<{ id: string; name: string; context_length: number; pricing: { prompt: string; completion: string } }> };

  const models = data.data
    .map((m) => ({
      id: m.id,
      name: m.name,
      context: m.context_length,
      promptPrice:     parseFloat(m.pricing?.prompt     ?? "0") * 1_000_000,
      completionPrice: parseFloat(m.pricing?.completion ?? "0") * 1_000_000,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return NextResponse.json({ models });
}

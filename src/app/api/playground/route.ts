import { NextRequest, NextResponse } from "next/server";
import { chat } from "@/lib/ai";

export async function POST(req: NextRequest) {
  const { messages, model, temperature } = await req.json();

  try {
    const content = await chat(messages, { model, temperature, maxTokens: 4096 });
    return NextResponse.json({ content });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

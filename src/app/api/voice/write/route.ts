import { NextRequest, NextResponse } from "next/server";
import { rewriteVoiceText, composeVoiceText } from "@/actions/voice";

export async function POST(req: NextRequest) {
  const body = await req.json() as {
    action?: string;
    text?: string;
    personality?: string;
  };

  const { action, text, personality } = body;

  if (!personality?.trim()) {
    return NextResponse.json({ error: "personality is required" }, { status: 400 });
  }

  if (action === "rewrite") {
    if (!text?.trim()) {
      return NextResponse.json({ error: "text is required for rewrite" }, { status: 400 });
    }
    const result = await rewriteVoiceText(text, personality);
    return NextResponse.json(result, { status: (result as { error?: string }).error ? 500 : 200 });
  }

  if (action === "compose") {
    const result = await composeVoiceText(personality);
    return NextResponse.json(result, { status: (result as { error?: string }).error ? 500 : 200 });
  }

  return NextResponse.json({ error: "action must be 'rewrite' or 'compose'" }, { status: 400 });
}

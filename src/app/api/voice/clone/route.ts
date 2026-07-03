import { NextRequest, NextResponse } from "next/server";
import { createVoiceClone } from "@/actions/voice";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as { path?: string; name?: string; description?: string | null };
  if (!body.path || !body.name) {
    return NextResponse.json({ error: "path and name are required" }, { status: 400 });
  }
  const result = await createVoiceClone({ path: body.path, name: body.name, description: body.description });
  return NextResponse.json(result, { status: (result as { error?: string }).error ? 400 : 200 });
}

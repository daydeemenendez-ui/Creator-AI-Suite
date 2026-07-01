import { NextRequest, NextResponse } from "next/server";
import { generatePersonalityFromAudio } from "@/actions/voice";

export async function POST(req: NextRequest) {
  const body = await req.json() as { voiceProfileId?: string };
  if (!body.voiceProfileId) {
    return NextResponse.json({ error: "voiceProfileId is required" }, { status: 400 });
  }
  const result = await generatePersonalityFromAudio(body.voiceProfileId);
  return NextResponse.json(result, { status: (result as { error?: string }).error ? 400 : 200 });
}

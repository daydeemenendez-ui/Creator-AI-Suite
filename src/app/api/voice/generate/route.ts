import { NextRequest, NextResponse } from "next/server";
import { generateAudio, previewAudioChunks } from "@/actions/voice";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const action = formData.get("action") as string;

  if (action === "preview") {
    const result = await previewAudioChunks(formData);
    return NextResponse.json(result);
  }

  // Default: generate audio
  const result = await generateAudio(formData);
  return NextResponse.json(result, { status: (result as { error?: string }).error ? 400 : 200 });
}

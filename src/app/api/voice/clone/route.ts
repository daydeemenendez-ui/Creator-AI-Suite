import { NextRequest, NextResponse } from "next/server";
import { createVoiceClone } from "@/actions/voice";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const result = await createVoiceClone(formData);
  return NextResponse.json(result, { status: (result as { error?: string }).error ? 400 : 200 });
}

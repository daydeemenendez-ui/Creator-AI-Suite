import { NextRequest, NextResponse } from "next/server";
import { analyzeYouTubeUrl, uploadAndTranscribe } from "@/actions/research";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const action = formData.get("action") as string;

  if (action === "analyze_url") {
    const result = await analyzeYouTubeUrl(formData);
    return NextResponse.json(result, { status: result.error ? 400 : 200 });
  }

  if (action === "upload") {
    const result = await uploadAndTranscribe(formData);
    return NextResponse.json(result, { status: result.error ? 400 : 200 });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}

export async function GET() {
  return NextResponse.json({ ok: true });
}

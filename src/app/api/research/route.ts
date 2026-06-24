import { NextRequest, NextResponse } from "next/server";
import { analyzeYouTubeUrl, uploadAndTranscribe, listSources } from "@/actions/research";

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

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");
  if (!projectId) return NextResponse.json({ error: "projectId required" }, { status: 400 });
  const result = await listSources(projectId);
  return NextResponse.json(result);
}

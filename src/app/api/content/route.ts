import { NextRequest, NextResponse } from "next/server";
import { ContentType } from "@prisma/client";
import {
  generateIdeas,
  generateScript,
  generateShorts,
  generateSEO,
  generateEmail,
  contentChat,
  listOutputs,
  listAllOutputs,
  deleteOutput,
  saveOutput,
  saveCustomSections,
  getCustomSections,
} from "@/actions/content";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const action = formData.get("action") as string;

  if (action === "delete_output") {
    const id = formData.get("id") as string;
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    const result = await deleteOutput(id);
    return NextResponse.json(result);
  }

  if (action === "save_output") {
    const type = formData.get("type") as ContentType;
    const title = formData.get("title") as string;
    const body = formData.get("body") as string;
    const metadataRaw = formData.get("metadata") as string | null;
    if (!type || !body) return NextResponse.json({ error: "type and body required" }, { status: 400 });
    const metadata = metadataRaw ? JSON.parse(metadataRaw) : undefined;
    const result = await saveOutput(type, title || "Sin título", body, metadata);
    return NextResponse.json(result);
  }

  if (action === "save_sections") {
    const sectionsRaw = formData.get("sections") as string;
    const result = await saveCustomSections(sectionsRaw ? JSON.parse(sectionsRaw) : []);
    return NextResponse.json(result);
  }

  const handlers: Record<string, (f: FormData) => Promise<unknown>> = {
    generate_ideas:  generateIdeas,
    generate_script: generateScript,
    generate_shorts: generateShorts,
    generate_seo:    generateSEO,
    generate_email:  generateEmail,
    chat:            contentChat,
  };

  const handler = handlers[action];
  if (!handler) return NextResponse.json({ error: "Unknown action" }, { status: 400 });

  const result = await handler(formData) as Record<string, unknown>;
  return NextResponse.json(result, { status: result.error ? 400 : 200 });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const transcriptId = searchParams.get("transcriptId");

  if (searchParams.get("kind") === "sections") {
    const result = await getCustomSections();
    return NextResponse.json(result);
  }

  if (!transcriptId) {
    const result = await listAllOutputs();
    return NextResponse.json(result);
  }

  const result = await listOutputs(transcriptId);
  return NextResponse.json(result);
}

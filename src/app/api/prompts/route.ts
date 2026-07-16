import { NextRequest, NextResponse } from "next/server";
import { listPrompts, createPrompt, updatePrompt, deletePrompt, togglePromptStarred, updatePromptImages } from "@/actions/prompt";

export async function GET() {
  const result = await listPrompts();
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const action = formData.get("action") as string;

  if (action === "create") {
    const result = await createPrompt(formData);
    return NextResponse.json(result);
  }

  if (action === "update") {
    const id = formData.get("id") as string;
    const title = formData.get("title") as string;
    const text = formData.get("text") as string;
    const category = (formData.get("category") as string) || undefined;
    if (!id || !title?.trim() || !text?.trim()) return NextResponse.json({ error: "id, title and text required" }, { status: 400 });
    const result = await updatePrompt(id, title.trim(), category, text.trim());
    return NextResponse.json(result);
  }

  if (action === "delete") {
    const id = formData.get("id") as string;
    const result = await deletePrompt(id);
    return NextResponse.json(result);
  }

  if (action === "toggle_starred") {
    const id = formData.get("id") as string;
    const starred = formData.get("starred") === "true";
    const result = await togglePromptStarred(id, starred);
    return NextResponse.json(result);
  }

  if (action === "update_images") {
    const id = formData.get("id") as string;
    const imagesRaw = formData.get("images") as string;
    const result = await updatePromptImages(id, imagesRaw ? JSON.parse(imagesRaw) : []);
    return NextResponse.json(result);
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}

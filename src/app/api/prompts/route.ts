import { NextRequest, NextResponse } from "next/server";
import { listPrompts, createPrompt, deletePrompt, togglePromptStarred } from "@/actions/prompt";

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

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}

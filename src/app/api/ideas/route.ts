import { NextRequest, NextResponse } from "next/server";
import {
  listIdeas,
  createIdea,
  deleteIdea,
  updateIdeaPriority,
  toggleIdeaStarred,
} from "@/actions/idea";

export async function GET() {
  const result = await listIdeas();
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const action = formData.get("action") as string;

  if (action === "create") {
    const result = await createIdea(formData);
    return NextResponse.json(result);
  }

  if (action === "delete") {
    const id = formData.get("id") as string;
    const result = await deleteIdea(id);
    return NextResponse.json(result);
  }

  if (action === "update_priority") {
    const id = formData.get("id") as string;
    const priority = formData.get("priority") as string;
    const result = await updateIdeaPriority(id, priority);
    return NextResponse.json(result);
  }

  if (action === "toggle_starred") {
    const id = formData.get("id") as string;
    const starred = formData.get("starred") === "true";
    const result = await toggleIdeaStarred(id, starred);
    return NextResponse.json(result);
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}

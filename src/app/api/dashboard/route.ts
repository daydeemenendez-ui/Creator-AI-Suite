import { NextRequest, NextResponse } from "next/server";
import { getDashboardData, createProject } from "@/actions/dashboard";

export async function GET() {
  const result = await getDashboardData();
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const action = formData.get("action") as string;

  if (action === "create_project") {
    const result = await createProject(formData);
    return NextResponse.json(result);
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}

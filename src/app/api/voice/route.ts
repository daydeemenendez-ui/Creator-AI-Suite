import { NextRequest, NextResponse } from "next/server";
import {
  listVoiceProfiles,
  listAudioGenerations,
  pollVoiceStatus,
  deleteVoiceProfile,
  updateVoicePersonality,
} from "@/actions/voice";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") ?? "profiles";

  if (type === "profiles") {
    return NextResponse.json(await listVoiceProfiles());
  }

  if (type === "generations") {
    const projectId = searchParams.get("projectId") ?? undefined;
    return NextResponse.json(await listAudioGenerations(projectId));
  }

  if (type === "status") {
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    return NextResponse.json(await pollVoiceStatus(id));
  }

  return NextResponse.json({ error: "Unknown type" }, { status: 400 });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json() as { id?: string; personality?: string };
  const { id, personality } = body;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const result = await updateVoicePersonality(id, personality ?? "");
  return NextResponse.json(result, { status: (result as { error?: string }).error ? 400 : 200 });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const result = await deleteVoiceProfile(id);
  return NextResponse.json(result, { status: (result as { error?: string }).error ? 400 : 200 });
}

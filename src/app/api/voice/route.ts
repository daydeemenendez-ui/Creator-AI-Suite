import { NextRequest, NextResponse } from "next/server";
import {
  listVoiceProfiles,
  listAudioGenerations,
  pollVoiceStatus,
  deleteVoiceProfile,
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

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  return NextResponse.json(await deleteVoiceProfile(id));
}

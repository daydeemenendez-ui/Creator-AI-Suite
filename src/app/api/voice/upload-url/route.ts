import { NextRequest, NextResponse } from "next/server";
import { createAudioUploadUrl } from "@/lib/supabase/storage";

// Returns a short-lived signed URL the browser can upload a voice sample to
// directly, bypassing the request body size limit of our own API routes.
export async function POST(req: NextRequest) {
  const { fileName } = (await req.json()) as { fileName?: string };
  if (!fileName) {
    return NextResponse.json({ error: "fileName is required" }, { status: 400 });
  }

  try {
    const { bucket, path, token } = await createAudioUploadUrl(fileName);
    return NextResponse.json({ bucket, path, token });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

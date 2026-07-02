import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Returns a signed upload URL so the browser can PUT the file directly
// to Supabase Storage without needing the anon key in the browser.
const KIND_CONFIG = {
  audio: { bucket: process.env.SUPABASE_BUCKET_AUDIOS ?? "creator-audios", prefix: "audio" },
  document: { bucket: process.env.SUPABASE_BUCKET_DOCUMENTS ?? "creator-documents", prefix: "documents" },
} as const;

export async function POST(req: NextRequest) {
  const { fileName, kind } = await req.json() as { fileName: string; kind?: keyof typeof KIND_CONFIG };
  if (!fileName) return NextResponse.json({ error: "fileName required" }, { status: 400 });

  const safeName = fileName
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "_");
  const { bucket: rawBucket, prefix } = KIND_CONFIG[kind ?? "audio"];
  const path = `${prefix}/${Date.now()}-${safeName}`;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!.trim();
  const bucket = rawBucket.trim();

  // Ensure the bucket exists — buckets outside the default audio one
  // (e.g. documents) may not have been created yet in Supabase.
  if (kind && kind !== "audio") {
    await fetch(`${supabaseUrl}/storage/v1/bucket`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${serviceKey}`,
        apikey: serviceKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: bucket, name: bucket, public: true }),
    }); // ignore errors — 409 means it already exists
  }

  const res = await fetch(
    `${supabaseUrl}/storage/v1/object/upload/sign/${bucket}/${path}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${serviceKey}`,
        apikey: serviceKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ upsert: false, expiresIn: 300 }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json({ error: `Storage sign error: ${err}` }, { status: 502 });
  }

  // Supabase returns { url: "/object/upload/sign/bucket/path?token=...", token: "..." }
  const data = await res.json() as { url?: string; token?: string };
  const relativeUrl = data.url ?? "";
  // relativeUrl is relative to /storage/v1
  const fullURL = `${supabaseUrl}/storage/v1${relativeUrl}`;
  return NextResponse.json({ signedURL: fullURL, path, safeName });
}

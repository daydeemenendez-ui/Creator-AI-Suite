import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Returns a signed upload URL so the browser can PUT the file directly
// to Supabase Storage without needing the anon key in the browser.
export async function POST(req: NextRequest) {
  const { fileName } = await req.json() as { fileName: string };
  if (!fileName) return NextResponse.json({ error: "fileName required" }, { status: 400 });

  const safeName = fileName
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `audio/${Date.now()}-${safeName}`;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!.trim();
  const bucket = (process.env.SUPABASE_BUCKET_AUDIOS ?? "creator-audios").trim();

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

  const data = await res.json() as { signedURL?: string; url?: string; token?: string };
  // Supabase returns { signedURL: "/storage/v1/object/upload/sign/bucket/path?token=..." }
  const signedURL = data.signedURL ?? data.url ?? "";
  const fullURL = signedURL.startsWith("http") ? signedURL : `${supabaseUrl}${signedURL}`;
  return NextResponse.json({ signedURL: fullURL, path, safeName });
}

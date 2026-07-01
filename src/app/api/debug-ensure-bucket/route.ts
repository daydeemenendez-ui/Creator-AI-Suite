import { NextResponse } from "next/server";

// TEMPORARY diagnostic/repair endpoint — creates the "creator-audios" and
// "creator-videos" Supabase Storage buckets if they don't exist yet.
// Remove this route once the buckets are confirmed to exist.
export async function POST() {
  try {
    const { createClient } = require("@supabase/supabase-js");
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const results: Record<string, string> = {};

    for (const bucket of [
      process.env.SUPABASE_BUCKET_AUDIOS ?? "creator-audios",
      process.env.SUPABASE_BUCKET_VIDEOS ?? "creator-videos",
    ]) {
      const { data: existing } = await supabase.storage.getBucket(bucket);
      if (existing) {
        results[bucket] = "already exists";
        continue;
      }
      const { error } = await supabase.storage.createBucket(bucket, { public: true });
      results[bucket] = error ? `error: ${error.message}` : "created";
    }

    return NextResponse.json({ results });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

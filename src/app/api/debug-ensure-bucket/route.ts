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

    const results: Record<string, unknown> = {};

    for (const bucket of [
      process.env.SUPABASE_BUCKET_AUDIOS ?? "creator-audios",
      process.env.SUPABASE_BUCKET_VIDEOS ?? "creator-videos",
    ]) {
      const { data: existing } = await supabase.storage.getBucket(bucket);

      if (!existing) {
        const { error } = await supabase.storage.createBucket(bucket, { public: true });
        results[bucket] = error ? `create error: ${error.message}` : "created (public)";
        continue;
      }

      if (existing.public) {
        results[bucket] = "already exists and is public";
        continue;
      }

      const { error } = await supabase.storage.updateBucket(bucket, { public: true });
      results[bucket] = error
        ? `existed but was private — update error: ${error.message}`
        : "existed but was private — set to public";
    }

    return NextResponse.json({ results });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

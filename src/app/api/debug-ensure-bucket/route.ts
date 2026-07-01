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

    // Diagnostic: list what's actually inside creator-audios/audio and try a
    // direct signed/service-role read of the most recent object
    const audioBucket = process.env.SUPABASE_BUCKET_AUDIOS ?? "creator-audios";
    const { data: listing, error: listError } = await supabase.storage
      .from(audioBucket)
      .list("audio", { limit: 5, sortBy: { column: "created_at", order: "desc" } });

    let downloadCheck: string;
    if (listing && listing.length > 0) {
      const path = `audio/${listing[0].name}`;
      const { data: blob, error: dlError } = await supabase.storage.from(audioBucket).download(path);
      downloadCheck = dlError
        ? `download error for ${path}: ${dlError.message}`
        : `download OK for ${path}, size=${blob?.size ?? "?"}`;
    } else {
      downloadCheck = `list error or empty: ${listError?.message ?? "no files found"}`;
    }

    return NextResponse.json({
      results,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      listing,
      listError: listError?.message ?? null,
      downloadCheck,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

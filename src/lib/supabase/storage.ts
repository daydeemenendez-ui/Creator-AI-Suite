"use server";

import { createServiceClient } from "./server";
import { v4 as uuidv4 } from "uuid";

const BUCKET_VIDEOS = process.env.SUPABASE_BUCKET_VIDEOS ?? "creator-videos";
const BUCKET_AUDIOS = process.env.SUPABASE_BUCKET_AUDIOS ?? "creator-audios";

export async function uploadAudioFile(
  buffer: Uint8Array,
  fileName: string,
  mimeType = "audio/mpeg"
): Promise<string> {
  const supabase = createServiceClient();
  const key = `audio/${uuidv4()}-${fileName}`;

  const { error } = await supabase.storage
    .from(BUCKET_AUDIOS)
    .upload(key, buffer, { contentType: mimeType, upsert: false });

  if (error) throw new Error(`Storage upload failed: ${error.message}`);

  const { data } = supabase.storage.from(BUCKET_AUDIOS).getPublicUrl(key);
  return data.publicUrl;
}

// Serverless hosts (e.g. Vercel) cap the request body a Function can receive
// at a few MB — well under the 25MB we allow for voice samples. Route large
// uploads around that limit by having the browser PUT the file straight to
// Supabase Storage with a short-lived signed URL, instead of proxying the
// bytes through our own API route.
export async function createAudioUploadUrl(fileName: string) {
  const supabase = createServiceClient();
  const key = `audio/uploads/${uuidv4()}-${fileName}`;

  const { data, error } = await supabase.storage
    .from(BUCKET_AUDIOS)
    .createSignedUploadUrl(key);

  if (error) throw new Error(`Storage signed URL failed: ${error.message}`);

  return { bucket: BUCKET_AUDIOS, path: data.path, token: data.token };
}

export async function downloadAudioFile(path: string): Promise<Buffer> {
  const supabase = createServiceClient();
  const { data, error } = await supabase.storage.from(BUCKET_AUDIOS).download(path);
  if (error) throw new Error(`Storage download failed: ${error.message}`);
  return Buffer.from(await data.arrayBuffer());
}

export async function uploadVideoFile(
  buffer: Uint8Array,
  fileName: string,
  mimeType = "video/mp4"
): Promise<string> {
  const supabase = createServiceClient();
  const key = `video/${uuidv4()}-${fileName}`;

  const { error } = await supabase.storage
    .from(BUCKET_VIDEOS)
    .upload(key, buffer, { contentType: mimeType, upsert: false });

  if (error) throw new Error(`Storage upload failed: ${error.message}`);

  const { data } = supabase.storage.from(BUCKET_VIDEOS).getPublicUrl(key);
  return data.publicUrl;
}

export async function deleteFile(bucket: "videos" | "audios", key: string) {
  const supabase = createServiceClient();
  const bucketName = bucket === "videos" ? BUCKET_VIDEOS : BUCKET_AUDIOS;
  await supabase.storage.from(bucketName).remove([key]);
}

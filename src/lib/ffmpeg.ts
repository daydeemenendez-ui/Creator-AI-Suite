"use server";

import { promises as fs } from "fs";
import path from "path";
import os from "os";
import { v4 as uuidv4 } from "uuid";

/**
 * Merge multiple audio buffers (mp3) into a single mp3 using ffmpeg.
 * Chunks must be ordered by index before calling.
 * Returns the merged audio as a Buffer.
 */
export async function mergeAudioChunks(chunks: Uint8Array[]): Promise<Buffer<ArrayBuffer>> {
  const ffmpeg = await getFfmpeg();
  const tmpDir = path.join(os.tmpdir(), `creator-ai-${uuidv4()}`);
  await fs.mkdir(tmpDir, { recursive: true });

  try {
    // Write each chunk to a temp file
    const chunkPaths: string[] = [];
    for (let i = 0; i < chunks.length; i++) {
      const chunkPath = path.join(tmpDir, `chunk-${i}.mp3`);
      await fs.writeFile(chunkPath, chunks[i]);
      chunkPaths.push(chunkPath);
    }

    // Build ffmpeg concat list
    const listPath = path.join(tmpDir, "list.txt");
    const listContent = chunkPaths
      .map((p) => `file '${p.replace(/'/g, "'\\''")}'`)
      .join("\n");
    await fs.writeFile(listPath, listContent, "utf8");

    // Output path
    const outputPath = path.join(tmpDir, "output.mp3");

    // Run ffmpeg concat
    await runFfmpeg(ffmpeg, [
      "-f", "concat",
      "-safe", "0",
      "-i", listPath,
      "-c:a", "libmp3lame",
      "-q:a", "2",
      "-y",
      outputPath,
    ]);

    const merged = await fs.readFile(outputPath);
    return merged;
  } finally {
    // Cleanup temp dir
    await fs.rm(tmpDir, { recursive: true, force: true });
  }
}

/**
 * Extract audio from a video file (MP4 → MP3).
 */
export async function extractAudioFromVideo(
  videoBuffer: Uint8Array,
  inputExt = "mp4"
): Promise<Buffer<ArrayBuffer>> {
  const ffmpeg = await getFfmpeg();
  const tmpDir = path.join(os.tmpdir(), `creator-ai-${uuidv4()}`);
  await fs.mkdir(tmpDir, { recursive: true });

  try {
    const inputPath = path.join(tmpDir, `input.${inputExt}`);
    const outputPath = path.join(tmpDir, "audio.mp3");

    await fs.writeFile(inputPath, videoBuffer);

    await runFfmpeg(ffmpeg, [
      "-i", inputPath,
      "-vn",
      "-acodec", "libmp3lame",
      "-q:a", "4",
      "-y",
      outputPath,
    ]);

    return await fs.readFile(outputPath);
  } finally {
    await fs.rm(tmpDir, { recursive: true, force: true });
  }
}

// ─────────────────────────────────────────────
// Internals
// ─────────────────────────────────────────────

async function getFfmpeg(): Promise<string> {
  // Use system ffmpeg if available (production / server)
  const { execSync } = await import("child_process");
  try {
    const cmd = process.platform === "win32" ? "where ffmpeg" : "which ffmpeg";
    const bin = execSync(cmd, { stdio: ["pipe", "pipe", "ignore"] })
      .toString()
      .trim()
      .split("\n")[0];
    if (bin) return bin;
  } catch {
    // not found in PATH
  }

  // Fall back to the bundled ffmpeg-static binary
  try {
    const { default: ffmpegStatic } = await import("ffmpeg-static");
    if (ffmpegStatic) return ffmpegStatic as string;
  } catch {
    // package not available
  }

  throw new Error(
    "ffmpeg not found. Install it: https://ffmpeg.org/download.html"
  );
}

function runFfmpeg(bin: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const { spawn } = require("child_process");
    const proc = spawn(bin, args, { stdio: "pipe" });
    const stderr: string[] = [];

    proc.stderr.on("data", (d: Buffer) => stderr.push(d.toString()));
    proc.on("close", (code: number) => {
      if (code === 0) resolve();
      else reject(new Error(`ffmpeg exited ${code}:\n${stderr.join("")}`));
    });
    proc.on("error", reject);
  });
}

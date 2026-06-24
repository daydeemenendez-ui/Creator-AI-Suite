/**
 * CHUNKING ENGINE
 * Divides text into chunks of 1000–1500 chars without cutting sentences.
 * Preserves paragraph and sentence boundaries.
 */

const CHUNK_MIN = 1000;
const CHUNK_MAX = 1500;

export interface TextChunk {
  index: number;
  text: string;
  charCount: number;
}

/**
 * Split text into chunks bounded by sentence endings.
 * Never cuts mid-sentence. Returns ordered array ready for parallel TTS.
 */
export function chunkText(text: string): TextChunk[] {
  // Normalize whitespace
  const normalized = text.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();

  // Split into sentences (period, ?, ! followed by space or newline)
  const sentenceRegex = /(?<=[.!?])\s+/g;
  const sentences = normalized.split(sentenceRegex).filter((s) => s.trim().length > 0);

  const chunks: TextChunk[] = [];
  let current = "";

  for (const sentence of sentences) {
    const candidate = current ? `${current} ${sentence}` : sentence;

    if (candidate.length <= CHUNK_MAX) {
      current = candidate;
      // If we've hit the minimum and the next sentence would push us over max,
      // seal the chunk now
      if (current.length >= CHUNK_MIN) {
        const nextIdx = sentences.indexOf(sentence) + 1;
        const next = sentences[nextIdx];
        if (next && current.length + next.length + 1 > CHUNK_MAX) {
          chunks.push(makeChunk(chunks.length, current));
          current = "";
        }
      }
    } else {
      // current + sentence exceeds max
      if (current) {
        chunks.push(makeChunk(chunks.length, current));
        current = sentence;
      } else {
        // Single sentence longer than CHUNK_MAX — force-split on comma or space
        const parts = forceSplit(sentence, CHUNK_MAX);
        for (const part of parts) {
          chunks.push(makeChunk(chunks.length, part));
        }
        current = "";
      }
    }
  }

  if (current.trim()) {
    chunks.push(makeChunk(chunks.length, current));
  }

  return chunks;
}

function makeChunk(index: number, text: string): TextChunk {
  return { index, text: text.trim(), charCount: text.trim().length };
}

/** Last-resort split on commas or spaces when a sentence exceeds CHUNK_MAX */
function forceSplit(text: string, maxLen: number): string[] {
  const parts: string[] = [];
  let remaining = text;

  while (remaining.length > maxLen) {
    // Try to split on last comma before maxLen
    let splitAt = remaining.lastIndexOf(",", maxLen);
    if (splitAt < maxLen * 0.5) {
      // Fallback: split on last space before maxLen
      splitAt = remaining.lastIndexOf(" ", maxLen);
    }
    if (splitAt <= 0) splitAt = maxLen;

    parts.push(remaining.slice(0, splitAt).trim());
    remaining = remaining.slice(splitAt).trim();
  }

  if (remaining) parts.push(remaining);
  return parts;
}

/** Preview chunk plan without processing */
export function previewChunks(text: string): {
  totalChunks: number;
  totalChars: number;
  estimatedMinutes: number;
  chunks: Array<{ index: number; chars: number; preview: string }>;
} {
  const chunks = chunkText(text);
  const totalChars = chunks.reduce((s, c) => s + c.charCount, 0);

  return {
    totalChunks: chunks.length,
    totalChars,
    estimatedMinutes: Math.ceil(totalChars / 900), // ~900 chars/min speech
    chunks: chunks.map((c) => ({
      index: c.index,
      chars: c.charCount,
      preview: c.text.slice(0, 80) + (c.text.length > 80 ? "…" : ""),
    })),
  };
}

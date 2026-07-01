import { NextRequest, NextResponse } from "next/server";

// Neither Alibaba's nor MiniMax's TTS API takes a free-text "style" — each
// style maps to a preset combination of speed/pitch/volume adjustments
// layered on top of whatever speed the user picked.
const STYLE_PRESETS: Record<string, { speedBoost: number; pitchOffset: number; volume: number }> = {
  natural: { speedBoost: 0, pitchOffset: 0, volume: 1.0 },
  "enérgico": { speedBoost: 0.1, pitchOffset: 2, volume: 1.1 },
  formal: { speedBoost: -0.05, pitchOffset: -1, volume: 0.9 },
  casual: { speedBoost: 0.05, pitchOffset: 1, volume: 1.0 },
};

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

export async function POST(req: NextRequest) {
  const body = await req.json() as {
    text: string;
    modelId: string;
    voice?: string;
    speed?: number;   // multiplier, 0.5–2.0 (UI: 0.75x–1.5x)
    pitch?: number;
    style?: string;
    voiceProfileId?: string;
  };

  const { text, modelId, voice, speed, pitch, style, voiceProfileId } = body;

  if (!text?.trim()) {
    return NextResponse.json({ error: "text is required" }, { status: 400 });
  }

  const preset = STYLE_PRESETS[style ?? "natural"] ?? STYLE_PRESETS.natural;
  const baseSpeed = speed ?? 1.0;
  const finalSpeed = clamp(baseSpeed + preset.speedBoost, 0.5, 2.0);
  const finalPitch = clamp((pitch ?? 0) + preset.pitchOffset, -12, 12);

  try {
    let audioBuffer: Buffer;

    // A real cloned voice (from an uploaded sample) only exists in MiniMax's
    // voice_clone system — always synthesize with it, regardless of what's
    // picked in the generic "Modelo TTS" selector, which only applies to
    // demo/preset voices with no clone behind them.
    if (voiceProfileId) {
      const { prisma } = await import("@/lib/prisma");
      const profile = await prisma.voiceProfile.findUnique({ where: { id: voiceProfileId } });

      if (profile) {
        if (profile.status !== "READY") {
          return NextResponse.json(
            { error: "Esta voz todavía se está procesando — intenta de nuevo en un momento." },
            { status: 409 }
          );
        }
        const { textToSpeech } = await import("@/lib/minimax");
        audioBuffer = await textToSpeech({
          voiceId: profile.miniMaxVoiceId,
          text,
          speed: finalSpeed,
          pitch: finalPitch,
          vol: preset.volume,
        });

        return new NextResponse(audioBuffer.buffer as ArrayBuffer, {
          status: 200,
          headers: {
            "Content-Type": "audio/mpeg",
            "Content-Disposition": 'attachment; filename="tts-output.mp3"',
          },
        });
      }
      // Not a real profile (e.g. demo/mock voice) — fall through to the
      // generic model-based synthesis below.
    }

    if (!modelId) {
      return NextResponse.json({ error: "modelId is required" }, { status: 400 });
    }

    const [provider] = modelId.split("/");

    if (provider === "alibaba") {
      const { alibabaTTS } = await import("@/lib/alibaba-tts");
      const model = modelId.replace("alibaba/", "");
      // Alibaba's rate/pitch are -500..500 offsets, not multipliers/semitones
      audioBuffer = await alibabaTTS({
        text,
        model,
        voice,
        speed: clamp((finalSpeed - 1) * 500, -500, 500),
        pitch: clamp(finalPitch * 40, -500, 500),
        volume: clamp(preset.volume * 50, 0, 100),
      });

    } else if (provider === "minimax") {
      const { textToSpeech } = await import("@/lib/minimax");
      const voiceId = voice ?? "male-qn-qingse";
      audioBuffer = await textToSpeech({
        voiceId,
        text,
        speed: finalSpeed,
        pitch: finalPitch,
        vol: preset.volume,
      });

    } else {
      return NextResponse.json({ error: `Provider "${provider}" not yet implemented` }, { status: 400 });
    }

    return new NextResponse(audioBuffer.buffer as ArrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Disposition": 'attachment; filename="tts-output.mp3"',
      },
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

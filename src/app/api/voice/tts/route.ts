import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json() as {
    text: string;
    modelId: string;
    voice?: string;
    speed?: number;
    pitch?: number;
    voiceProfileId?: string;
  };

  const { text, modelId, voice, speed, pitch, voiceProfileId } = body;

  if (!text?.trim()) {
    return NextResponse.json({ error: "text is required" }, { status: 400 });
  }

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
          speed: speed ? speed / 100 + 1 : 1,
          pitch: pitch ?? 0,
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
      audioBuffer = await alibabaTTS({ text, model, voice, speed, pitch });

    } else if (provider === "minimax") {
      const { textToSpeech } = await import("@/lib/minimax");
      const voiceId = voice ?? "male-qn-qingse";
      audioBuffer = await textToSpeech({ voiceId, text, speed: speed ? speed / 100 + 1 : 1, pitch: pitch ?? 0 });

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

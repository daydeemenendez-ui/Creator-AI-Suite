import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json() as {
    text: string;
    modelId: string;
    voice?: string;
    speed?: number;
    pitch?: number;
  };

  const { text, modelId, voice, speed, pitch } = body;

  if (!text?.trim()) {
    return NextResponse.json({ error: "text is required" }, { status: 400 });
  }
  if (!modelId) {
    return NextResponse.json({ error: "modelId is required" }, { status: 400 });
  }

  const [provider] = modelId.split("/");

  try {
    let audioBuffer: Buffer;

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

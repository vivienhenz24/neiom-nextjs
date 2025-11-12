import { NextResponse } from "next/server"

import { MAX_DIALOGUE_AUDIO_CHARACTERS, synthesizeDialogueAudio } from "@/lib/dialogue-audio"

type DialogueAudioPayload = {
  script?: string
  language?: string
}

export async function POST(request: Request) {
  if (!process.env.ELEVENLABS_API_KEY) {
    return NextResponse.json(
      { error: "Dialogue audio generation is not configured." },
      { status: 500 }
    )
  }

  let payload: DialogueAudioPayload
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 })
  }

  const script = payload.script?.trim()
  if (!script) {
    return NextResponse.json({ error: "Dialogue text is required." }, { status: 400 })
  }

  if (script.length > MAX_DIALOGUE_AUDIO_CHARACTERS) {
    return NextResponse.json(
      { error: `Dialogue text exceeds the ${MAX_DIALOGUE_AUDIO_CHARACTERS} character limit.` },
      { status: 400 }
    )
  }

  try {
    const result = await synthesizeDialogueAudio({
      script,
      language: payload.language,
    })

    const { audioBase64, alignment, normalizedAlignment, voiceSegments } = result

    if (!audioBase64) {
      throw new Error("The audio service did not return any audio data.")
    }

    return NextResponse.json({
      audioBase64,
      alignment,
      normalizedAlignment,
      voiceSegments,
    })
  } catch (error) {
    console.error("[dialogue audio API] Failed to generate audio", error)
    const message =
      error instanceof Error && error.message
        ? error.message
        : "Unable to generate dialogue audio right now."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

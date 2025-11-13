import { NextResponse } from "next/server"

import {
  MAX_PRONUNCIATION_CHARACTERS,
  SUPPORTED_PRONUNCIATION_LANGUAGES,
} from "@/lib/voices"
import { synthesizePronunciation } from "@/lib/pronunciation"

type PronouncePayload = {
  text?: string
  languageCode?: string
  voiceId?: string
}

const parsePayload = async (request: Request): Promise<PronouncePayload> => {
  try {
    return await request.json()
  } catch {
    throw new Error("Invalid JSON payload.")
  }
}

const normalizeLanguageCode = (languageCode?: string) =>
  languageCode?.trim().toLowerCase() ?? null

const normalizedSupportedLanguages = new Set(
  SUPPORTED_PRONUNCIATION_LANGUAGES.map((code) => code.toLowerCase())
)

export async function POST(request: Request) {
  if (!process.env.ELEVENLABS_API_KEY) {
    console.error("[pronounce API] Missing ELEVENLABS_API_KEY")
    return NextResponse.json({ error: "Pronunciation service is not configured." }, { status: 500 })
  }

  let payload: PronouncePayload

  try {
    payload = await parsePayload(request)
  } catch (error) {
    console.error("[pronounce API] Failed to parse payload", error)
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 })
  }

  const text = payload.text?.trim()
  const voiceId = payload.voiceId?.trim()
  const languageCode = normalizeLanguageCode(payload.languageCode ?? undefined)

  if (!text) {
    return NextResponse.json({ error: "Text is required for pronunciation." }, { status: 400 })
  }

  if (text.length > MAX_PRONUNCIATION_CHARACTERS) {
    return NextResponse.json(
      { error: `Text exceeds the ${MAX_PRONUNCIATION_CHARACTERS} character limit.` },
      { status: 400 }
    )
  }

  if (languageCode && !normalizedSupportedLanguages.has(languageCode)) {
    return NextResponse.json(
      { error: `Pronunciation for ${languageCode} is not supported.` },
      { status: 400 }
    )
  }

  console.log("[pronounce API] Generating audio", {
    textLength: text.length,
    languageCode: languageCode ?? "default",
    voiceOverride: Boolean(voiceId),
  })

  try {
    const { audioBuffer, mimeType, voiceId: resolvedVoiceId, outputFormat } =
      await synthesizePronunciation({
        text,
        languageCode: languageCode ?? undefined,
        voiceId,
      })

    const responseBody =
      audioBuffer instanceof Buffer
        ? audioBuffer.buffer.slice(audioBuffer.byteOffset, audioBuffer.byteOffset + audioBuffer.byteLength)
        : audioBuffer
    const contentLength = audioBuffer.byteLength ?? audioBuffer.length

    return new Response(responseBody, {
      status: 200,
      headers: {
        "Content-Type": mimeType,
        "Content-Length": contentLength.toString(),
        "Cache-Control": "no-store",
        "X-Pronunciation-Voice": resolvedVoiceId,
        "X-Pronunciation-Format": outputFormat,
      },
    })
  } catch (error) {
    console.error("[pronounce API] Failed to generate audio", error)
    const message =
      error instanceof Error && error.message ? error.message : "Unable to generate audio."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

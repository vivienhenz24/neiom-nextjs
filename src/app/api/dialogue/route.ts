import { NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const CHARACTER_LIMIT = 5000
const DEFAULT_TURNS = 6
const MIN_TURNS = 2
const MAX_TURNS = 16
const DEFAULT_SPEAKER_A = "Speaker A"
const DEFAULT_SPEAKER_B = "Speaker B"

const SUPPORTED_LANGUAGES = {
  en: "English",
  fr: "French",
  de: "German",
  pt: "Portuguese",
} as const

type SupportedLanguageCode = keyof typeof SUPPORTED_LANGUAGES

type DialoguePayload = {
  prompt?: string
  speakerA?: string
  speakerB?: string
  turnCount?: number
  speakerALanguage?: SupportedLanguageCode
  speakerBLanguage?: SupportedLanguageCode
}

const parsePayload = async (request: Request) => {
  try {
    return (await request.json()) as DialoguePayload
  } catch {
    throw new Error("Invalid JSON payload.")
  }
}

const sanitizeSpeakerName = (value: string | undefined, fallback: string) => {
  const name = value?.trim()
  if (!name) return fallback
  return name.slice(0, 48)
}

const normalizeTurnCount = (value?: number) => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return DEFAULT_TURNS
  }
  return Math.min(Math.max(Math.floor(value), MIN_TURNS), MAX_TURNS)
}

const resolveLanguage = (code?: string): SupportedLanguageCode => {
  if (!code) return "en"
  const normalized = code.trim().toLowerCase()
  return (Object.keys(SUPPORTED_LANGUAGES).find((lang) => lang === normalized) ??
    "en") as SupportedLanguageCode
}

const buildLanguageInstruction = ({
  speakerA,
  speakerB,
  speakerALanguage,
  speakerBLanguage,
}: {
  speakerA: string
  speakerB: string
  speakerALanguage: SupportedLanguageCode
  speakerBLanguage: SupportedLanguageCode
}) => {
  const languageAName = SUPPORTED_LANGUAGES[speakerALanguage]
  const languageBName = SUPPORTED_LANGUAGES[speakerBLanguage]

  if (speakerALanguage === speakerBLanguage) {
    return `Both ${speakerA} and ${speakerB} should speak in ${languageAName}.`
  }

  return `${speakerA} should speak in ${languageAName}, while ${speakerB} should speak in ${languageBName}.`
}

const buildSystemPrompt = ({
  speakerA,
  speakerB,
  turnCount,
  speakerALanguage,
  speakerBLanguage,
}: {
  speakerA: string
  speakerB: string
  turnCount: number
  speakerALanguage: SupportedLanguageCode
  speakerBLanguage: SupportedLanguageCode
}) => {
  const languageInstruction = buildLanguageInstruction({
    speakerA,
    speakerB,
    speakerALanguage,
    speakerBLanguage,
  })

  return [
    "You are an expert dialogue writer.",
    `Write a realistic conversation with exactly ${turnCount} turns (each speaker counts as one turn).`,
    `Alternate strictly between ${speakerA} and ${speakerB}.`,
    `Format each turn as "${speakerA}: ..." or "${speakerB}: ...".`,
    languageInstruction,
    "Keep each line concise (1-2 sentences) and avoid stage directions unless requested.",
  ].join(" ")
}

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    console.error("[dialogue API] Missing OPENAI_API_KEY")
    return NextResponse.json(
      { error: "Dialogue generation is not configured." },
      { status: 500 }
    )
  }

  let payload: DialoguePayload
  try {
    payload = await parsePayload(request)
  } catch (error) {
    console.error("[dialogue API] Failed to parse payload", error)
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 })
  }

  const prompt = payload.prompt?.trim()
  if (!prompt) {
    return NextResponse.json({ error: "Prompt is required." }, { status: 400 })
  }

  if (prompt.length > CHARACTER_LIMIT) {
    return NextResponse.json(
      { error: `Prompt exceeds the ${CHARACTER_LIMIT} character limit.` },
      { status: 400 }
    )
  }

  const speakerA = sanitizeSpeakerName(payload.speakerA, DEFAULT_SPEAKER_A)
  const speakerB = sanitizeSpeakerName(payload.speakerB, DEFAULT_SPEAKER_B)
  const speakerALanguage = resolveLanguage(payload.speakerALanguage)
  const speakerBLanguage = resolveLanguage(payload.speakerBLanguage)
  const turnCount = normalizeTurnCount(payload.turnCount)

  const systemPrompt = buildSystemPrompt({
    speakerA,
    speakerB,
    turnCount,
    speakerALanguage,
    speakerBLanguage,
  })

  try {
    const responseStream = await openai.responses.stream({
      model: "gpt-4.1-mini",
      temperature: 0.7,
      input: [
        {
          role: "system",
          content: [{ type: "input_text", text: systemPrompt }],
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: [
                "Scenario / guidance for the conversation:",
                prompt,
                "",
                "Remember to alternate speakers and keep the conversation tight.",
              ].join("\n"),
            },
          ],
        },
      ],
    })

    const encoder = new TextEncoder()
    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const event of responseStream) {
            if (event.type === "response.output_text.delta") {
              const delta = event.delta ?? ""
              if (delta) {
                controller.enqueue(encoder.encode(delta))
              }
            }
          }

          const finalResponse = await responseStream.finalResponse()
          const finalText = finalResponse.output_text ?? ""
          controller.close()
        } catch (error) {
          console.error("[dialogue API] Streaming failed", error)
          controller.error(error)
        }
      },
      cancel() {
        responseStream.controller?.abort()
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    })
  } catch (error) {
    console.error("[dialogue API] Generation failed", error)
    return NextResponse.json(
      { error: "Unable to generate dialogue at the moment." },
      { status: 500 }
    )
  }
}

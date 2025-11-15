import { NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const CHARACTER_LIMIT = 5000

type TranslatePayload = {
  text?: string
  sourceLanguage?: string
  targetLanguage?: string
  sourceLanguageLabel?: string
  targetLanguageLabel?: string
}

const formatLanguageLabel = (code?: string, label?: string) => {
  if (label?.trim()) {
    return label.trim()
  }

  if (code?.trim()) {
    return code.trim().toUpperCase()
  }

  return "the original language"
}

const buildSystemPrompt = ({
  sourceLanguageLabel,
  targetLanguageLabel,
}: Required<Pick<TranslatePayload, "sourceLanguageLabel" | "targetLanguageLabel">>) =>
  [
    `You are a professional interpreter.`,
    `Translate from ${sourceLanguageLabel} into ${targetLanguageLabel}.`,
    `Preserve tone and formatting, keep proper nouns intact, and respond with translation only.`,
  ].join(" ")

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    console.error("[translate API] Missing OPENAI_API_KEY")
    return NextResponse.json(
      { error: "Translation service is not configured." },
      { status: 500 }
    )
  }

  let payload: TranslatePayload

  try {
    payload = await request.json()
  } catch {
    console.error("[translate API] Failed to parse JSON payload")
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 })
  }

  const text = payload.text?.trim()
  const sourceLanguage = payload.sourceLanguage?.trim()
  const targetLanguage = payload.targetLanguage?.trim()

  if (!text) {
    return NextResponse.json({ error: "Text is required for translation." }, { status: 400 })
  }

  if (text.length > CHARACTER_LIMIT) {
    return NextResponse.json(
      { error: `Text exceeds the ${CHARACTER_LIMIT} character limit.` },
      { status: 400 }
    )
  }

  if (!sourceLanguage || !targetLanguage) {
    return NextResponse.json(
      { error: "Source and target languages are required." },
      { status: 400 }
    )
  }

  const sourceLabel = formatLanguageLabel(sourceLanguage, payload.sourceLanguageLabel)
  const targetLabel = formatLanguageLabel(targetLanguage, payload.targetLanguageLabel)
  const systemPrompt = buildSystemPrompt({
    sourceLanguageLabel: sourceLabel,
    targetLanguageLabel: targetLabel,
  })

  try {
    const responseStream = await openai.responses.stream({
      model: "gpt-4.1-nano",
      temperature: 0.2,
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
              text: `Translate the following text:\n\n${text}`,
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
          console.error("[translate API] Streaming failed", error)
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
    console.error("[translate API] Translation failed", error)
    return NextResponse.json(
      { error: "Unable to complete translation at the moment." },
      { status: 500 }
    )
  }
}

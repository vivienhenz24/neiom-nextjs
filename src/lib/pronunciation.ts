import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js"

import {
  DEFAULT_AUDIO_MIME_TYPE,
  DEFAULT_VOICE_MODEL_ID,
  DEFAULT_VOICE_OUTPUT_FORMAT,
  MAX_PRONUNCIATION_CHARACTERS,
  SUPPORTED_PRONUNCIATION_LANGUAGES,
  resolveVoiceProfile,
} from "@/lib/voices"
import type { VoiceProfile } from "@/lib/voices"

type PronunciationRequest = {
  text: string
  languageCode?: string
  voiceId?: string
}

export const PRONUNCIATION_LANGUAGE_SET = new Set(SUPPORTED_PRONUNCIATION_LANGUAGES)

const client = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
})

export const readableStreamToBuffer = async (
  stream: ReadableStream<Uint8Array>
): Promise<Buffer> => {
  const reader = stream.getReader()
  const chunks: Buffer[] = []

  while (true) {
    const { value, done } = await reader.read()
    if (done) {
      break
    }
    if (value) {
      chunks.push(Buffer.from(value))
    }
  }

  return Buffer.concat(chunks)
}

const outputFormatToMimeType = (format: VoiceProfile["outputFormat"] | undefined) => {
  if (!format) {
    return DEFAULT_AUDIO_MIME_TYPE
  }

  if (format.startsWith("mp3")) {
    return "audio/mpeg"
  }

  if (format.startsWith("pcm")) {
    return "audio/wav"
  }

  if (format.startsWith("opus")) {
    return "audio/ogg"
  }

  if (format.startsWith("ulaw") || format.startsWith("alaw")) {
    return "audio/basic"
  }

  return DEFAULT_AUDIO_MIME_TYPE
}

export const synthesizePronunciation = async ({
  text,
  languageCode,
  voiceId,
}: PronunciationRequest) => {
  if (!process.env.ELEVENLABS_API_KEY) {
    throw new Error("ELEVENLABS_API_KEY is not configured.")
  }

  if (!text.trim()) {
    throw new Error("Text is required.")
  }

  if (text.length > MAX_PRONUNCIATION_CHARACTERS) {
    throw new Error(`Text exceeds the ${MAX_PRONUNCIATION_CHARACTERS} character limit.`)
  }

  if (languageCode && !PRONUNCIATION_LANGUAGE_SET.has(languageCode.trim().toLowerCase())) {
    throw new Error(`Language ${languageCode} is not supported for pronunciation.`)
  }

  const voiceProfile = resolveVoiceProfile(languageCode, voiceId)

  const responseStream = await client.textToSpeech.convert(voiceProfile.voiceId, {
    text,
    modelId: voiceProfile.modelId ?? DEFAULT_VOICE_MODEL_ID,
    outputFormat: voiceProfile.outputFormat ?? DEFAULT_VOICE_OUTPUT_FORMAT,
    optimizeStreamingLatency: voiceProfile.optimizeStreamingLatency ?? undefined,
  })

  const audioStream = await responseStream
  const audioBuffer = await readableStreamToBuffer(audioStream)
  const mimeType = outputFormatToMimeType(voiceProfile.outputFormat)

  return {
    audioBuffer,
    mimeType,
    voiceId: voiceProfile.voiceId,
    outputFormat: voiceProfile.outputFormat ?? DEFAULT_VOICE_OUTPUT_FORMAT,
  }
}

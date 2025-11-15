import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js"
import { Client, type SpaceStatus } from "@gradio/client"

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

type SynthesizedPronunciation = {
  audioBuffer: Buffer
  mimeType: string
  voiceId: string
  outputFormat: VoiceProfile["outputFormat"]
}

type GradioApiInfo = Awaited<ReturnType<Client["view_api"]>>
type NamedEndpoints = GradioApiInfo["named_endpoints"]
type UnnamedEndpoints = GradioApiInfo["unnamed_endpoints"]
type GradioEndpointParameters =
  | NamedEndpoints[keyof NamedEndpoints]["parameters"]
  | UnnamedEndpoints[keyof UnnamedEndpoints]["parameters"]

export const PRONUNCIATION_LANGUAGE_SET = new Set(SUPPORTED_PRONUNCIATION_LANGUAGES)

const LUXEMBOURGISH_LANGUAGE_CODE = "lb"
const LUXEMBOURGISH_SPACE_ID = "vivienhenz/neiom-v0"
const LUXEMBOURGISH_VOICE_ID = `gradio:${LUXEMBOURGISH_SPACE_ID}`

let elevenLabsClient: ElevenLabsClient | null = null
let gradioClientPromise: Promise<Client> | null = null
let gradioEndpointMetadata: { name: string; parameters: GradioEndpointParameters } | null = null

const getElevenLabsClient = () => {
  if (!elevenLabsClient) {
    if (!process.env.ELEVENLABS_API_KEY) {
      throw new Error("ELEVENLABS_API_KEY is not configured.")
    }
    elevenLabsClient = new ElevenLabsClient({
      apiKey: process.env.ELEVENLABS_API_KEY,
    })
  }

  return elevenLabsClient
}

const getGradioClient = async () => {
  if (!gradioClientPromise) {
    const hfApiKey = process.env.HF_TOKEN
    const connectOptions: Parameters<typeof Client.connect>[1] = {
      status_callback: (status: SpaceStatus) => {
        // Status update callback
      },
    }

    // Add headers with API key if available to get higher priority in ZeroGPU queues
    if (hfApiKey) {
      connectOptions.headers = {
        Authorization: `Bearer ${hfApiKey}`,
      }
    }

    gradioClientPromise = Client.connect(LUXEMBOURGISH_SPACE_ID, connectOptions).catch((error) => {
      gradioClientPromise = null
      throw error
    })
  }

  return gradioClientPromise
}

const getGradioEndpointMetadata = async () => {
  if (gradioEndpointMetadata) {
    return gradioEndpointMetadata
  }

  const client = await getGradioClient()
  const apiInfo = await client.view_api()

  const findAudioEndpoint = (endpoints: Record<string, { parameters: GradioEndpointParameters; returns: GradioEndpointParameters }>) => {
    return Object.entries(endpoints).find(([, info]) =>
      info.returns.some((descriptor) => isAudioDescriptor(descriptor))
    )
  }

  const audioEndpoint =
    findAudioEndpoint(apiInfo.named_endpoints) ??
    Object.entries(apiInfo.named_endpoints)[0] ??
    Object.entries(apiInfo.unnamed_endpoints)[0]

  if (!audioEndpoint) {
    throw new Error("Luxembourgish pronunciation endpoint metadata is unavailable.")
  }

  gradioEndpointMetadata = {
    name: audioEndpoint[0],
    parameters: audioEndpoint[1].parameters,
  }

  return gradioEndpointMetadata
}

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
  if (!text.trim()) {
    throw new Error("Text is required.")
  }

  if (text.length > MAX_PRONUNCIATION_CHARACTERS) {
    throw new Error(`Text exceeds the ${MAX_PRONUNCIATION_CHARACTERS} character limit.`)
  }

  if (languageCode && !PRONUNCIATION_LANGUAGE_SET.has(languageCode.trim().toLowerCase())) {
    throw new Error(`Language ${languageCode} is not supported for pronunciation.`)
  }

  const normalizedLanguage = languageCode?.trim().toLowerCase()
  const normalizedVoiceId = voiceId?.trim()

  if (normalizedLanguage === LUXEMBOURGISH_LANGUAGE_CODE) {
    if (normalizedVoiceId) {
      throw new Error("Custom voice overrides are not supported for Luxembourgish pronunciation.")
    }
    return synthesizeLuxembourgishPronunciation(text)
  }

  return synthesizeElevenLabsPronunciation({
    text,
    languageCode: normalizedLanguage,
    voiceId: normalizedVoiceId,
  })
}

const synthesizeElevenLabsPronunciation = async ({
  text,
  languageCode,
  voiceId,
}: {
  text: string
  languageCode?: string
  voiceId?: string
}): Promise<SynthesizedPronunciation> => {
  const client = getElevenLabsClient()
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

const synthesizeLuxembourgishPronunciation = async (text: string): Promise<SynthesizedPronunciation> => {
  try {
    const client = await getGradioClient()
    const endpoint = await getGradioEndpointMetadata()
    const payload = buildLuxembourgishPayload(endpoint.parameters, text)
    const result = await client.predict(endpoint.name, payload)
    const audioReference = extractAudioReference(result.data)

    if (!audioReference) {
      throw new Error("Luxembourgish pronunciation response did not contain an audio reference.")
    }

    const { audioBuffer, mimeType } = await downloadLuxembourgishAudio(client, audioReference)

    return {
      audioBuffer,
      mimeType,
      voiceId: LUXEMBOURGISH_VOICE_ID,
      outputFormat: DEFAULT_VOICE_OUTPUT_FORMAT,
    }
  } catch (error) {
    console.error("[pronunciation:gradio] Failed to synthesize audio", error)
    const message =
      error instanceof Error && error.message
        ? error.message
        : "Luxembourgish pronunciation is currently unavailable."
    throw new Error(message)
  }
}

const buildLuxembourgishPayload = (parameters: GradioEndpointParameters, text: string) => {
  if (!parameters?.length) {
    return [text]
  }

  const payload: unknown[] = []
  let textAssigned = false

  parameters.forEach((parameter, index) => {
    if (!textAssigned && isTextParameter(parameter)) {
      payload[index] = text
      textAssigned = true
      return
    }

    if (isLanguageParameter(parameter)) {
      payload[index] = LUXEMBOURGISH_LANGUAGE_CODE
      return
    }

    if (parameter.parameter_has_default) {
      payload[index] = parameter.parameter_default
      return
    }

    payload[index] = null
  })

  if (!textAssigned) {
    payload[0] = text
  }

  return payload
}

const isTextParameter = (parameter: GradioEndpointParameters[number]) => {
  const name = parameter.parameter_name?.toLowerCase() ?? ""
  const label = parameter.label?.toLowerCase() ?? ""
  return (
    name.includes("text") ||
    name.includes("prompt") ||
    label.includes("text") ||
    label.includes("prompt") ||
    parameter.type === "string"
  )
}

const isLanguageParameter = (parameter: GradioEndpointParameters[number]) => {
  const name = parameter.parameter_name?.toLowerCase() ?? ""
  const label = parameter.label?.toLowerCase() ?? ""
  return name.includes("language") || label.includes("language")
}

const isAudioDescriptor = (descriptor: GradioEndpointParameters[number]) => {
  const component = descriptor.component ? descriptor.component.toLowerCase() : ""
  const description =
    typeof descriptor.description === "string" ? descriptor.description.toLowerCase() : ""
  return component.includes("audio") || description.includes("audio")
}

const extractAudioReference = (payload: unknown): string | null => {
  if (!payload) {
    return null
  }

  if (typeof payload === "string") {
    return payload
  }

  if (Array.isArray(payload)) {
    for (const entry of payload) {
      const reference = extractAudioReference(entry)
      if (reference) {
        return reference
      }
    }
    return null
  }

  if (typeof payload === "object") {
    const candidateRecord = payload as Record<string, unknown>
    const url = candidateRecord.url ?? candidateRecord.path
    if (typeof url === "string") {
      return url
    }
  }

  return null
}

const downloadLuxembourgishAudio = async (client: Client, reference: string) => {
  const url = createGradioAssetUrl(client, reference)
  const response = await client.fetch(url)

  if (!response.ok) {
    throw new Error(`Failed to download Luxembourgish pronunciation audio (${response.status}).`)
  }

  const arrayBuffer = await response.arrayBuffer()
  const mimeType = response.headers.get("content-type") ?? DEFAULT_AUDIO_MIME_TYPE

  return {
    audioBuffer: Buffer.from(arrayBuffer),
    mimeType,
  }
}

const createGradioAssetUrl = (client: Client, reference: string) => {
  if (/^https?:\/\//i.test(reference)) {
    return reference
  }

  const base =
    client.api_prefix ??
    client.config?.root ??
    `https://${LUXEMBOURGISH_SPACE_ID.replace("/", "-")}.hf.space/`

  return new URL(reference, base).toString()
}

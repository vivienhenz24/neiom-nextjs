export type VoiceProfile = {
  voiceId: string
  label: string
  modelId: string
  outputFormat: string
  optimizeStreamingLatency?: number | null
}

const DEFAULT_MODEL_ID = "eleven_multilingual_v2"
const DEFAULT_OUTPUT_FORMAT = "mp3_44100_128"

const LANGUAGE_VOICE_MAP: Record<string, VoiceProfile> = {
  en: {
    voiceId: "JBFqnCBsd6RMkjVDRZzb", // Matilda
    label: "Matilda",
    modelId: DEFAULT_MODEL_ID,
    outputFormat: DEFAULT_OUTPUT_FORMAT,
    optimizeStreamingLatency: 1,
  },
  fr: {
    voiceId: "EXAVITQu4vr4xnSDxMaL", // Bella
    label: "Bella",
    modelId: DEFAULT_MODEL_ID,
    outputFormat: DEFAULT_OUTPUT_FORMAT,
    optimizeStreamingLatency: 1,
  },
  lb: {
    voiceId: "21m00Tcm4TlvDq8ikWAM", // Rachel (fallback)
    label: "Rachel",
    modelId: DEFAULT_MODEL_ID,
    outputFormat: DEFAULT_OUTPUT_FORMAT,
    optimizeStreamingLatency: 1,
  },
  de: {
    voiceId: "VR6AewLTigWG4xSOukaG", // Arnold
    label: "Arnold",
    modelId: DEFAULT_MODEL_ID,
    outputFormat: DEFAULT_OUTPUT_FORMAT,
    optimizeStreamingLatency: 1,
  },
  es: {
    voiceId: "ErXwobaYiN019PkySvjV", // Antoni
    label: "Antoni",
    modelId: DEFAULT_MODEL_ID,
    outputFormat: DEFAULT_OUTPUT_FORMAT,
    optimizeStreamingLatency: 1,
  },
  pt: {
    voiceId: "TxGEqnHWrfWFTfGW9XjX", // Josh
    label: "Josh",
    modelId: DEFAULT_MODEL_ID,
    outputFormat: DEFAULT_OUTPUT_FORMAT,
    optimizeStreamingLatency: 1,
  },
  it: {
    voiceId: "AZnzlk1XvdvUeBnXmlld", // Domi
    label: "Domi",
    modelId: DEFAULT_MODEL_ID,
    outputFormat: DEFAULT_OUTPUT_FORMAT,
    optimizeStreamingLatency: 1,
  },
  nl: {
    voiceId: "pNInz6obpgDQGcFmaJgB", // Adam
    label: "Adam",
    modelId: DEFAULT_MODEL_ID,
    outputFormat: DEFAULT_OUTPUT_FORMAT,
    optimizeStreamingLatency: 1,
  },
  pl: {
    voiceId: "yoZ06aMxZJJ28mfd3POQ", // Sam
    label: "Sam",
    modelId: DEFAULT_MODEL_ID,
    outputFormat: DEFAULT_OUTPUT_FORMAT,
    optimizeStreamingLatency: 1,
  },
  ro: {
    voiceId: "MF3mGyEYCl7XYWbV9V6O", // Elli
    label: "Elli",
    modelId: DEFAULT_MODEL_ID,
    outputFormat: DEFAULT_OUTPUT_FORMAT,
    optimizeStreamingLatency: 1,
  },
}

const FALLBACK_PROFILE: VoiceProfile = LANGUAGE_VOICE_MAP.en

export const SUPPORTED_PRONUNCIATION_LANGUAGES = Object.keys(LANGUAGE_VOICE_MAP)

export const MAX_PRONUNCIATION_CHARACTERS = 5000

export const DEFAULT_AUDIO_MIME_TYPE = "audio/mpeg"

export const DEFAULT_STREAMING_STRATEGY = "buffered" as const

export const DEFAULT_VOICE_OUTPUT_FORMAT = DEFAULT_OUTPUT_FORMAT

export const DEFAULT_VOICE_MODEL_ID = DEFAULT_MODEL_ID

export const resolveVoiceProfile = (languageCode?: string, preferredVoiceId?: string) => {
  const normalizedVoiceId = preferredVoiceId?.trim()
  if (normalizedVoiceId) {
    return {
      voiceId: normalizedVoiceId,
      label: "Custom voice",
      modelId: DEFAULT_MODEL_ID,
      outputFormat: DEFAULT_OUTPUT_FORMAT,
      optimizeStreamingLatency: 1,
    }
  }

  const normalizedLanguage = languageCode?.trim().toLowerCase()
  if (!normalizedLanguage) {
    return FALLBACK_PROFILE
  }

  return LANGUAGE_VOICE_MAP[normalizedLanguage] ?? FALLBACK_PROFILE
}

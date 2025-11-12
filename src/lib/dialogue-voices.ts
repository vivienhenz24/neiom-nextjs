export type DialogueVoiceChoice = {
  voiceId: string
  label: string
}

export type DialogueVoicePair = {
  speakerA: DialogueVoiceChoice
  speakerB: DialogueVoiceChoice
}

const DEFAULT_DIALOGUE_MODEL_ID = process.env.ELEVENLABS_DIALOGUE_MODEL_ID?.trim()
const DEFAULT_DIALOGUE_OUTPUT_FORMAT = "mp3_44100_128"

const DIALOGUE_LANGUAGE_VOICES: Record<string, DialogueVoicePair> = {
  en: {
    speakerA: { voiceId: "JBFqnCBsd6RMkjVDRZzb", label: "Matilda" },
    speakerB: { voiceId: "ErXwobaYiN019PkySvjV", label: "Antoni" },
  },
  fr: {
    speakerA: { voiceId: "EXAVITQu4vr4xnSDxMaL", label: "Bella" },
    speakerB: { voiceId: "MF3mGyEYCl7XYWbV9V6O", label: "Elli" },
  },
  de: {
    speakerA: { voiceId: "VR6AewLTigWG4xSOukaG", label: "Arnold" },
    speakerB: { voiceId: "AZnzlk1XvdvUeBnXmlld", label: "Domi" },
  },
  pt: {
    speakerA: { voiceId: "TxGEqnHWrfWFTfGW9XjX", label: "Josh" },
    speakerB: { voiceId: "pNInz6obpgDQGcFmaJgB", label: "Adam" },
  },
}

const FALLBACK_PAIR = DIALOGUE_LANGUAGE_VOICES.en

export const SUPPORTED_DIALOGUE_LANGUAGES = Object.keys(DIALOGUE_LANGUAGE_VOICES)

export const getDialogueVoicesForLanguage = (language?: string) => {
  if (!language) {
    return FALLBACK_PAIR
  }

  const normalized = language.trim().toLowerCase()
  return DIALOGUE_LANGUAGE_VOICES[normalized] ?? FALLBACK_PAIR
}

export const DIALOGUE_MODEL_ID = DEFAULT_DIALOGUE_MODEL_ID
export const DIALOGUE_OUTPUT_FORMAT = DEFAULT_DIALOGUE_OUTPUT_FORMAT

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

// Voice IDs below were chosen from ElevenLabs' premade catalog where
// `verifiedLanguages` explicitly list the target locale, ensuring each
// speaker can natively cover that language.
const DIALOGUE_LANGUAGE_VOICES: Record<string, DialogueVoicePair> = {
  en: {
    speakerA: { voiceId: "JBFqnCBsd6RMkjVDRZzb", label: "George" },
    speakerB: { voiceId: "ErXwobaYiN019PkySvjV", label: "Antoni" },
  },
  fr: {
    speakerA: { voiceId: "Xb7hH8MSUJpSbSDYk0k2", label: "Alice" },
    speakerB: { voiceId: "CwhRBWXzGAHq8TQ4Fs17", label: "Roger" },
  },
  de: {
    speakerA: { voiceId: "onwK4e9ZLuTAKqWW03F9", label: "Daniel" },
    speakerB: { voiceId: "cgSgspJ2msm6clMCkdW9", label: "Jessica" },
  },
  pt: {
    speakerA: { voiceId: "cjVigY5qzO86Huf0OWal", label: "Eric" },
    speakerB: { voiceId: "SAz9YHcvj6GT2YYXdXww", label: "River" },
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

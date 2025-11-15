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

// Voice IDs sourced from ElevenLabs' recommended multilingual catalog so each
// supported language pairs two distinct, native-sounding speakers.
const DIALOGUE_LANGUAGE_VOICES: Record<string, DialogueVoicePair> = {
  en: {
    speakerA: { voiceId: "21m00Tcm4TlvDq8ikWAM", label: "Rachel" },
    speakerB: { voiceId: "pNInz6obpgDQGcFmaJgB", label: "Adam" },
  },
  fr: {
    speakerA: { voiceId: "O31r762Gb3WFygrEOGh0", label: "Domi" },
    speakerB: { voiceId: "AfbuxQ9DVtS4azaxN1W7", label: "Adam" },
  },
  de: {
    speakerA: { voiceId: "EXAVITQu4vr4xnSDxMaL", label: "Sarah" },
    speakerB: { voiceId: "ErXwobaYiN019PkySvjV", label: "Antoni" },
  },
  pt: {
    speakerA: { voiceId: "7eUAxNOneHxqfyRS77mW", label: "Carla" },
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

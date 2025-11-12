import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js"

import {
  DIALOGUE_MODEL_ID,
  DIALOGUE_OUTPUT_FORMAT,
  DialogueVoicePair,
  getDialogueVoicesForLanguage,
} from "@/lib/dialogue-voices"

const MAX_DIALOGUE_AUDIO_CHARACTERS = 5000
const NEWLINE_REGEX = /\r?\n/g

const client = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
})

type DialogueAudioRequest = {
  script: string
  language?: string
}

const normalizeScriptLines = (script: string) =>
  script
    .replace(NEWLINE_REGEX, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)

const selectVoiceForLine = (line: string, voices: DialogueVoicePair, index: number) => {
  const speakerMatch = line.match(/^([^:]+):/)
  if (speakerMatch) {
    const normalizedSpeaker = speakerMatch[1]?.trim().toLowerCase() ?? ""
    if (
      normalizedSpeaker.includes("b") ||
      normalizedSpeaker.includes("customer") ||
      normalizedSpeaker.includes("listener") ||
      normalizedSpeaker.includes("speaker 2")
    ) {
      return voices.speakerB.voiceId
    }
    return voices.speakerA.voiceId
  }

  return index % 2 === 0 ? voices.speakerA.voiceId : voices.speakerB.voiceId
}

const buildDialogueInputs = (script: string, voices: DialogueVoicePair) => {
  const lines = normalizeScriptLines(script)
  return lines.map((line, index) => ({
    text: line,
    voiceId: selectVoiceForLine(line, voices, index),
  }))
}

export const synthesizeDialogueAudio = async ({ script, language }: DialogueAudioRequest) => {
  if (!process.env.ELEVENLABS_API_KEY) {
    throw new Error("ELEVENLABS_API_KEY is not configured.")
  }

  const trimmedScript = script.trim()
  if (!trimmedScript) {
    throw new Error("Dialogue text is required.")
  }

  if (trimmedScript.length > MAX_DIALOGUE_AUDIO_CHARACTERS) {
    throw new Error(
      `Dialogue text exceeds the ${MAX_DIALOGUE_AUDIO_CHARACTERS} character limit.`
    )
  }

  const voices = getDialogueVoicesForLanguage(language)
  const inputs = buildDialogueInputs(trimmedScript, voices)

  if (inputs.length === 0) {
    throw new Error("Unable to find dialogue lines to convert.")
  }

  const requestPayload: Parameters<typeof client.textToDialogue.convertWithTimestamps>[0] = {
    outputFormat: DIALOGUE_OUTPUT_FORMAT,
    languageCode: language?.trim().toLowerCase(),
    inputs,
  }

  if (DIALOGUE_MODEL_ID) {
    requestPayload.modelId = DIALOGUE_MODEL_ID
  }

  return client.textToDialogue.convertWithTimestamps(requestPayload)
}

export { MAX_DIALOGUE_AUDIO_CHARACTERS }

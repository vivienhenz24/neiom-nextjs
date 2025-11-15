import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js"

import {
  DIALOGUE_MODEL_ID,
  DIALOGUE_OUTPUT_FORMAT,
  getDialogueVoicesForLanguage,
} from "@/lib/dialogue-voices"
import { buildTranscriptFromEntries, parseDialogueEntries } from "@/lib/dialogue-text"

const MAX_DIALOGUE_AUDIO_CHARACTERS = 5000

const client = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
})

type DialogueAudioRequest = {
  script: string
  language?: string
}

const selectVoiceForEntry = (speakerLabel: string, index: number, languageCode?: string) => {
  const voices = getDialogueVoicesForLanguage(languageCode)
  const normalizedSpeaker = speakerLabel.trim().toLowerCase()

  if (normalizedSpeaker) {
    if (
      normalizedSpeaker.includes("b") ||
      normalizedSpeaker.includes("customer") ||
      normalizedSpeaker.includes("listener") ||
      normalizedSpeaker.includes("speaker 2")
    ) {
      return voices.speakerB.voiceId
    }
    if (
      normalizedSpeaker.includes("a") ||
      normalizedSpeaker.includes("agent") ||
      normalizedSpeaker.includes("speaker 1") ||
      normalizedSpeaker.includes("speaker one")
    ) {
      return voices.speakerA.voiceId
    }
  }

  return index % 2 === 0 ? voices.speakerA.voiceId : voices.speakerB.voiceId
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

  const entries = parseDialogueEntries(trimmedScript)
  if (!entries.length) {
    throw new Error("Unable to find dialogue lines to convert.")
  }


  const inputs = entries.map((entry, index) => ({
    text: entry.normalizedText,
    voiceId: selectVoiceForEntry(entry.speakerLabel, index, language),
  }))

  const requestPayload: Parameters<typeof client.textToDialogue.convertWithTimestamps>[0] = {
    outputFormat: DIALOGUE_OUTPUT_FORMAT,
    languageCode: language?.trim().toLowerCase(),
    inputs,
  }

  if (DIALOGUE_MODEL_ID) {
    requestPayload.modelId = DIALOGUE_MODEL_ID
  }

  const response = await client.textToDialogue.convertWithTimestamps(requestPayload)

  return {
    response,
    transcript: buildTranscriptFromEntries(entries),
  }
}

export { MAX_DIALOGUE_AUDIO_CHARACTERS }

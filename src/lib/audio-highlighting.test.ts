import { describe, expect, it } from "vitest"

import { buildHighlightRanges } from "@/lib/audio-highlighting"
import { buildWordTimingsFromAlignment } from "@/lib/dialogue-highlighting"
import { buildTranscriptFromEntries, parseDialogueEntries } from "@/lib/dialogue-text"

const buildAlignmentFromTranscript = (transcript: string) => {
  const characters = transcript.split("")
  const characterStartTimesSeconds = characters.map((_, index) => index * 0.1)
  const characterEndTimesSeconds = characterStartTimesSeconds.map((start) => start + 0.1)

  return {
    characters,
    characterStartTimesSeconds,
    characterEndTimesSeconds,
  }
}

describe("audio highlighting", () => {
  it("maps the normalized transcript indices back to the original script spans", () => {
    const script = ["Speaker A:   Hello   world!", "Speaker B:Hi   there."].join("\n")

    const dialogueEntries = parseDialogueEntries(script)
    const transcript = buildTranscriptFromEntries(dialogueEntries)
    const alignment = buildAlignmentFromTranscript(transcript)
    const { timings } = buildWordTimingsFromAlignment(alignment)

    const ranges = buildHighlightRanges({
      script,
      dialogueEntries,
      wordTimings: timings,
    })

    const highlightedText = ranges.map((range) => script.slice(range.start, range.end))

    expect(highlightedText).toEqual(["Hello", "world!", "Hi", "there."])
    expect(ranges.every((range, index) => range.wordIndex === index)).toBe(true)
  })
})

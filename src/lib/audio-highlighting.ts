import { DialogueEntry } from "@/lib/dialogue-text"
import { WordTiming } from "@/lib/dialogue-highlighting"

export type HighlightRange = {
  start: number
  end: number
  wordIndex: number
}

export const buildHighlightRanges = ({
  script,
  dialogueEntries,
  wordTimings,
}: {
  script: string
  dialogueEntries: DialogueEntry[]
  wordTimings: WordTiming[]
}): HighlightRange[] => {
  if (!script || !dialogueEntries.length || !wordTimings.length) {
    return []
  }

  const scriptLength = script.length
  const ranges: HighlightRange[] = []

  wordTimings.forEach((timing) => {
    const overlappingEntries = dialogueEntries.filter(
      (entry) =>
        timing.transcriptStartIndex < entry.transcriptEndIndex &&
        timing.transcriptEndIndex > entry.transcriptStartIndex
    )

    overlappingEntries.forEach((entry) => {
      if (!entry.normalizedToOriginalMap.length) {
        return
      }

      const entryRelativeStart = Math.max(
        0,
        timing.transcriptStartIndex - entry.transcriptStartIndex
      )
      const entryRelativeEnd = Math.max(
        entryRelativeStart + 1,
        Math.min(timing.transcriptEndIndex, entry.transcriptEndIndex) -
          entry.transcriptStartIndex
      )

      const map = entry.normalizedToOriginalMap
      const clampToEntry = (value: number) =>
        map[Math.min(Math.max(value, 0), map.length - 1)] ?? entry.spokenStartIndex

      const normalizedStart = clampToEntry(entryRelativeStart)
      const normalizedEnd = clampToEntry(entryRelativeEnd - 1) + 1

      const start = Math.max(0, Math.min(normalizedStart, scriptLength))
      const end = Math.max(start, Math.min(normalizedEnd, scriptLength))

      ranges.push({
        start,
        end,
        wordIndex: timing.wordIndex,
      })
    })
  })

  return ranges.sort((a, b) => a.start - b.start)
}

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
  let entryIndex = 0

  wordTimings.forEach((timing) => {

    while (
      entryIndex < dialogueEntries.length &&
      dialogueEntries[entryIndex].transcriptEndIndex <= timing.transcriptStartIndex
    ) {
      entryIndex += 1
    }

    let currentIndex = entryIndex
    while (currentIndex < dialogueEntries.length) {
      const entry = dialogueEntries[currentIndex]
      if (entry.transcriptStartIndex >= timing.transcriptEndIndex) {
        break
      }

      if (!entry.normalizedToOriginalMap.length) {
        currentIndex += 1
        continue
      }

      const overlapStart = Math.max(
        0,
        timing.transcriptStartIndex - entry.transcriptStartIndex
      )
      const overlapEnd =
        Math.min(timing.transcriptEndIndex, entry.transcriptEndIndex) -
        entry.transcriptStartIndex

      if (overlapEnd <= overlapStart) {
        currentIndex += 1
        continue
      }

      if (overlapEnd > entry.normalizedToOriginalMap.length) {
        console.warn("[audio highlighting] Word timing exceeds dialogue entry bounds", {
          entryIndex: entry.lineIndex,
          overlapStart,
          overlapEnd,
          mapLength: entry.normalizedToOriginalMap.length,
        })
        break
      }

      const normalizedStart = entry.normalizedToOriginalMap[overlapStart]
      const normalizedEndBase = entry.normalizedToOriginalMap[overlapEnd - 1]

      if (typeof normalizedStart !== "number" || typeof normalizedEndBase !== "number") {
        console.warn("[audio highlighting] Incomplete normalized index mapping", {
          entryIndex: entry.lineIndex,
          overlapStart,
          overlapEnd,
        })
        break
      }

      const normalizedEnd = normalizedEndBase + 1
      const start = Math.max(0, Math.min(normalizedStart, scriptLength))
      const end = Math.max(start, Math.min(normalizedEnd, scriptLength))

      ranges.push({
        start,
        end,
        wordIndex: timing.wordIndex,
      })

      if (timing.transcriptEndIndex <= entry.transcriptEndIndex) {
        break
      }

      currentIndex += 1
    }
  })

  return ranges.sort((a, b) => a.start - b.start)
}

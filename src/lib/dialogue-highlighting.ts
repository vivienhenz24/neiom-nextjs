export type AlignmentPayload = {
  characters: string[]
  characterStartTimesSeconds: number[]
  characterEndTimesSeconds: number[]
}

export type WordTiming = {
  word: string
  startTime: number
  endTime: number
  transcriptStartIndex: number
  transcriptEndIndex: number
  wordIndex: number
}

const WHITESPACE_REGEX = /\s/
const SENTENCE_BOUNDARY_CHARS = new Set([".", "!", "?", ";", ":"])

export const buildWordTimingsFromAlignment = (
  alignment?: AlignmentPayload | null
): { transcript: string; timings: WordTiming[] } => {
  if (!alignment?.characters?.length) {
    console.log("[dialogue highlighting] No alignment data provided", {
      hasAlignment: Boolean(alignment),
    })
    return { transcript: "", timings: [] }
  }

  const { characters, characterStartTimesSeconds, characterEndTimesSeconds } = alignment
  const transcript = characters.join("")
  const timings: WordTiming[] = []
  const length = transcript.length

  console.log("[dialogue highlighting] Alignment transcript content:", transcript)

  const segments: Array<{ start: number; end: number }> = []

  let index = 0
  while (index < length) {
    const char = transcript[index]
    if (WHITESPACE_REGEX.test(char)) {
      index += 1
      continue
    }

    const startIndex = index
    while (index < length && !WHITESPACE_REGEX.test(transcript[index])) {
      index += 1
    }
    const endIndex = index

    let segmentStart = startIndex
    for (let cursor = startIndex; cursor < endIndex - 1; cursor += 1) {
      const currentChar = transcript[cursor]
      const nextChar = transcript[cursor + 1]

      if (
        SENTENCE_BOUNDARY_CHARS.has(currentChar) &&
        nextChar &&
        !WHITESPACE_REGEX.test(nextChar) &&
        !SENTENCE_BOUNDARY_CHARS.has(nextChar)
      ) {
        segments.push({ start: segmentStart, end: cursor + 1 })
        segmentStart = cursor + 1
      }
    }

    if (segmentStart < endIndex) {
      segments.push({ start: segmentStart, end: endIndex })
    }
  }

  let wordIndex = 0
  segments.forEach(({ start, end }) => {
    const startTime = characterStartTimesSeconds[start] ?? 0
    const endTime = characterEndTimesSeconds[Math.max(start, end - 1)] ?? startTime

    timings.push({
      word: transcript.slice(start, end),
      startTime,
      endTime,
      transcriptStartIndex: start,
      transcriptEndIndex: end,
      wordIndex,
    })
    wordIndex += 1
  })

  console.log("[dialogue highlighting] Built word timings", {
    transcriptLength: transcript.length,
    timingCount: timings.length,
  })
  console.log("[dialogue highlighting] Word timing details", timings)

  return { transcript, timings }
}

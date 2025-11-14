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

const segmentWithIntl = (transcript: string) => {
  if (
    !transcript ||
    typeof Intl === "undefined" ||
    typeof Intl.Segmenter === "undefined"
  ) {
    return []
  }

  try {
    const segmenter = new Intl.Segmenter(undefined, { granularity: "word" })
    const segments: Array<{ start: number; end: number }> = []

    for (const { segment, index, isWordLike } of segmenter.segment(transcript)) {
      if (!segment.trim()) {
        continue
      }

      if (isWordLike || segment.length === 1) {
        segments.push({ start: index, end: index + segment.length })
        continue
      }

      // Some locales return punctuation clusters as a single segment. Split them for consistency.
      for (let offset = 0; offset < segment.length; offset += 1) {
        const char = segment[offset]
        if (!char.trim()) {
          continue
        }
        segments.push({ start: index + offset, end: index + offset + 1 })
      }
    }

    return segments
  } catch (error) {
    console.warn("[dialogue highlighting] Failed to segment transcript with Intl.Segmenter", error)
    return []
  }
}

const segmentManually = (transcript: string) => {
  const segments: Array<{ start: number; end: number }> = []
  const length = transcript.length

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

  return segments
}

export const buildWordTimingsFromAlignment = (
  alignment?: AlignmentPayload | null
): { transcript: string; timings: WordTiming[] } => {
  if (!alignment?.characters?.length) {
    console.warn("[dialogue highlighting] No alignment data provided", {
      hasAlignment: Boolean(alignment),
    })
    return { transcript: "", timings: [] }
  }

  const { characters, characterStartTimesSeconds, characterEndTimesSeconds } = alignment
  const usableLength = Math.min(
    characters.length,
    characterStartTimesSeconds.length,
    characterEndTimesSeconds.length
  )

  if (
    usableLength !== characters.length ||
    usableLength !== characterStartTimesSeconds.length ||
    usableLength !== characterEndTimesSeconds.length
  ) {
    console.warn("[dialogue highlighting] Alignment payload has mismatched array lengths", {
      characterCount: characters.length,
      startTimesCount: characterStartTimesSeconds.length,
      endTimesCount: characterEndTimesSeconds.length,
      usableLength,
    })
  }

  if (!usableLength) {
    return { transcript: "", timings: [] }
  }

  const normalizedCharacters = characters.slice(0, usableLength)
  const transcript = normalizedCharacters.join("")
  const timings: WordTiming[] = []

  const intlSegments = segmentWithIntl(transcript)
  const segments = intlSegments.length ? intlSegments : segmentManually(transcript)

  let wordIndex = 0
  segments.forEach(({ start, end }) => {
    if (end <= start) {
      return
    }

    if (start < 0 || end > transcript.length) {
      console.warn("[dialogue highlighting] Ignoring out-of-bounds segment", { start, end })
      return
    }

    const endCharIndex = Math.max(start, end - 1)
    const startTime = characterStartTimesSeconds[start]
    const endTime = characterEndTimesSeconds[endCharIndex]

    if (typeof startTime !== "number" || typeof endTime !== "number") {
      console.warn("[dialogue highlighting] Missing timing information for segment", {
        start,
        end,
      })
      return
    }

    const word = transcript.slice(start, end)
    console.log("[dialogue highlighting] Segment timing candidate", {
      word,
      start,
      end,
      startTime,
      endTime,
    })

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

  console.log("[dialogue highlighting] Final word timing summary", {
    transcriptLength: transcript.length,
    timingCount: timings.length,
    sample: timings.slice(0, 20),
  })

  return { transcript, timings }
}

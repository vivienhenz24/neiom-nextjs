export type AlignmentPayload = {
  characters: string[]
  characterStartTimesSeconds: number[]
  characterEndTimesSeconds: number[]
}

export type WordTiming = {
  word: string
  startTime: number
  endTime: number
}

const WHITESPACE_REGEX = /^\s+$/

export const buildWordTimings = (
  script: string,
  alignment?: AlignmentPayload | null
): WordTiming[] => {
  if (!alignment) return []

  const { characters, characterStartTimesSeconds, characterEndTimesSeconds } = alignment
  if (!characters?.length) {
    return []
  }

  const tokens = script.split(/(\s+)/)
  const timings: WordTiming[] = []
  let charIndex = 0

  const advanceCharacters = (value: string) => {
    charIndex = Math.min(characters.length, charIndex + value.length)
  }

  for (const token of tokens) {
    if (!token) continue
    if (WHITESPACE_REGEX.test(token)) {
      advanceCharacters(token)
      continue
    }

    const startIndex = charIndex
    advanceCharacters(token)
    const endIndex = Math.max(startIndex, charIndex - 1)

    const startTime = characterStartTimesSeconds[startIndex] ?? 0
    const endTime = characterEndTimesSeconds[endIndex] ?? startTime

    timings.push({
      word: token,
      startTime,
      endTime,
    })
  }

  return timings
}

export type DialogueEntry = {
  lineIndex: number
  speakerLabel: string
  displayLabel: string
  spokenText: string
  normalizedText: string
  lineStartIndex: number
  lineEndIndex: number
  spokenStartIndex: number
  spokenEndIndex: number
  transcriptStartIndex: number
  transcriptEndIndex: number
  normalizedToOriginalMap: number[]
}

const normalizeSpokenText = (text: string) => text.replace(/\s+/g, " ").trim()

const buildNormalizedIndexMap = (
  original: string,
  normalized: string,
  absoluteStart: number
) => {
  const map: number[] = []
  if (!normalized.length) {
    return map
  }

  let originalIndex = 0
  for (let normIndex = 0; normIndex < normalized.length; normIndex += 1) {
    const targetChar = normalized[normIndex]

    if (targetChar === " ") {
      while (originalIndex < original.length && !/\s/.test(original[originalIndex])) {
        originalIndex += 1
      }
      if (originalIndex >= original.length) {
        map.push(absoluteStart + original.length - 1)
        continue
      }
      map.push(absoluteStart + originalIndex)
      while (originalIndex < original.length && /\s/.test(original[originalIndex])) {
        originalIndex += 1
      }
      continue
    }

    while (originalIndex < original.length && /\s/.test(original[originalIndex])) {
      originalIndex += 1
    }

    while (
      originalIndex < original.length &&
      original[originalIndex].toLowerCase() !== targetChar.toLowerCase()
    ) {
      originalIndex += 1
    }

    const mappedIndex = originalIndex < original.length ? originalIndex : original.length - 1
    map.push(absoluteStart + mappedIndex)
    originalIndex = mappedIndex + 1
  }

  return map
}

export const parseDialogueEntries = (script: string): DialogueEntry[] => {
  const entries: DialogueEntry[] = []
  const lineRegex = /(.*?)(\r?\n|$)/g
  let match: RegExpExecArray | null
  let offset = 0
  let lineNumber = 0
  let transcriptCursor = 0

  while ((match = lineRegex.exec(script)) && match[0].length > 0) {
    const line = match[1]
    const newline = match[2]
    const lineStartIndex = offset
    const lineEndIndex = offset + line.length
    offset += match[0].length

    if (!line.trim()) {
      lineNumber += 1
      continue
    }

    let speakerLabel = ""
    let spokenStartInLine = 0
    const colonIndex = line.indexOf(":")
    if (colonIndex !== -1 && colonIndex < 80) {
      speakerLabel = line.slice(0, colonIndex).trim()
      spokenStartInLine = colonIndex + 1
      while (spokenStartInLine < line.length && line[spokenStartInLine] === " ") {
        spokenStartInLine += 1
      }
    }

    const spokenText = line.slice(spokenStartInLine)
    if (!spokenText.trim()) {
      lineNumber += 1
      continue
    }

    const normalizedText = normalizeSpokenText(spokenText)
    if (!normalizedText) {
      lineNumber += 1
      continue
    }

    const spokenStartIndex = lineStartIndex + spokenStartInLine
    const spokenEndIndex = lineEndIndex
    const normalizedToOriginalMap = buildNormalizedIndexMap(
      spokenText,
      normalizedText,
      spokenStartIndex
    )

    const transcriptStartIndex = transcriptCursor
    const transcriptEndIndex = transcriptCursor + normalizedText.length
    transcriptCursor = transcriptEndIndex

    entries.push({
      lineIndex: lineNumber,
      speakerLabel,
      displayLabel: speakerLabel ? `${speakerLabel}:` : "",
      spokenText,
      normalizedText,
      lineStartIndex,
      lineEndIndex,
      spokenStartIndex,
      spokenEndIndex,
      transcriptStartIndex,
      transcriptEndIndex,
      normalizedToOriginalMap,
    })

    lineNumber += 1
    if (!newline) {
      break
    }
  }

  return entries
}

export const buildTranscriptFromEntries = (entries: DialogueEntry[]): string =>
  entries.map((entry) => entry.normalizedText).join("")

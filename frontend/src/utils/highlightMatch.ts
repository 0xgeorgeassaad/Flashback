export type HighlightSegment = {
  text: string
  isMatch: boolean
}

/**
 * Splits `text` into segments around case-insensitive occurrences of
 * `query`. Consumers render this array themselves (e.g. wrapping
 * isMatch segments in <mark>), so no HTML string is ever parsed or
 * injected, which keeps markup in titles safe.
 */
export function getHighlightSegments(text: string, query: string): HighlightSegment[] {
  const trimmedQuery = query.trim()

  if (!trimmedQuery) {
    return [{ text, isMatch: false }]
  }

  const escaped = trimmedQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`(${escaped})`, 'gi')
  const parts = text.split(regex)

  return parts
    .filter((part) => part !== '')
    .map((part) => ({
      text: part,
      isMatch: part.toLowerCase() === trimmedQuery.toLowerCase(),
    }))
}

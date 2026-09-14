/**
 * Extracts a 4-digit release year from a movie title, e.g.
 * "Toy Story (1995)" -> 1995. Looks for a year in parentheses first,
 * then falls back to any standalone 19xx/20xx number in the title.
 * Returns null when no year can be found.
 */
export function parseYearFromTitle(title: string): number | null {
  const parenMatch = title.match(/\((\d{4})\)/)
  if (parenMatch) {
    return Number(parenMatch[1])
  }

  const looseMatch = title.match(/\b(19\d{2}|20\d{2})\b/)
  if (looseMatch) {
    return Number(looseMatch[1])
  }

  return null
}

/** Rounds a year down to its decade, e.g. 1994 -> 1990. */
export function getDecade(year: number | null): number | null {
  if (year === null || Number.isNaN(year)) return null
  return Math.floor(year / 10) * 10
}

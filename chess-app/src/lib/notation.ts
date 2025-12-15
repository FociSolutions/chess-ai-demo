import type { Square } from 'chess.js'

/**
 * Convert UCI notation to an object with from/to squares
 * Examples: "e2e4" -> { from: "e2", to: "e4" }
 *           "e7e8q" -> { from: "e7", to: "e8", promotion: "q" }
 */
export function parseUCI(uci: string): {
  from: Square
  to: Square
  promotion?: 'q' | 'r' | 'b' | 'n'
} {
  const from = uci.slice(0, 2) as Square
  const to = uci.slice(2, 4) as Square
  const promotion = uci.length === 5 ? (uci[4] as 'q' | 'r' | 'b' | 'n') : undefined

  return { from, to, promotion }
}

/**
 * Convert from/to squares (and optional promotion) to UCI notation
 * Examples: { from: "e2", to: "e4" } -> "e2e4"
 *           { from: "e7", to: "e8", promotion: "q" } -> "e7e8q"
 */
export function toUCI(
  from: Square,
  to: Square,
  promotion?: 'q' | 'r' | 'b' | 'n'
): string {
  return `${from}${to}${promotion || ''}`
}

/**
 * Validate that a string is valid UCI notation
 */
export function isValidUCI(uci: string): boolean {
  const uciRegex = /^[a-h][1-8][a-h][1-8][qrbn]?$/
  return uciRegex.test(uci)
}

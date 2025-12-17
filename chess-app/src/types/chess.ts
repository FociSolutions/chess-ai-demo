import type { Square } from 'chess.js'

export type Difficulty = 'easy' | 'medium' | 'hard' | 'veryHard'

export type GameStatus =
  | 'initializing'
  | 'startScreen'
  | 'playerTurn'
  | 'aiThinking'
  | 'gameOver'

export interface Move {
  san: string
  uci: string
  actor: 'player' | 'ai'
  timestamp: number
  flags: {
    capture?: boolean
    promotion?: 'q' | 'r' | 'b' | 'n'
    castling?: 'k' | 'q'
    enPassant?: boolean
    check?: boolean
  }
}

export interface GameState {
  fen: string
  turn: 'w' | 'b'
  moves: Move[]
  status: GameStatus
  playerColor: 'w' | 'b'
  aiColor: 'w' | 'b'
  isCheck: boolean
  isCheckmate: boolean
  isStalemate: boolean
  isDraw: boolean
  drawReason?: 'stalemate' | 'repetition' | '50-move' | 'insufficient'
  resultMessage: string | null
  lastMoveFrom?: Square
  lastMoveTo?: Square
  kingSquareInCheck?: Square
  capturedPieces?: {
    white: string[]
    black: string[]
  }
}

export interface Settings {
  difficulty: Difficulty
  playerColor: 'w' | 'b'
  boardFlipped: boolean
  soundEnabled: boolean
  announceMovesEnabled: boolean
}

export interface AIOpponent {
  difficulty: Difficulty
  skillLevel: number
  depth: number
  elo?: number
  responseTimeMs: number
}

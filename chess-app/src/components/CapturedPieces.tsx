import { useMemo } from 'react'

interface CapturedPiecesProps {
  fen: string
  orientation: 'w' | 'b'
}

const PIECE_VALUES: Record<string, number> = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
}

const STARTING_PIECES = {
  p: 8,
  n: 2,
  b: 2,
  r: 2,
  q: 1,
}

export function CapturedPieces({ fen, orientation }: CapturedPiecesProps) {
  const { whiteCaptured, blackCaptured, whiteScore, blackScore } = useMemo(() => {
    const board = fen.split(' ')[0]
    const pieces: Record<string, number> = {
      p: 0, n: 0, b: 0, r: 0, q: 0, k: 0,
      P: 0, N: 0, B: 0, R: 0, Q: 0, K: 0,
    }

    for (const char of board) {
      if (/[pnbrqkPNBRQK]/.test(char)) {
        pieces[char]++
      }
    }

    const getCaptured = () => {
      // Actually, we want to know what White has LOST (to show on Black's side) and vice versa?
      // Usually:
      // Top player (Black): Shows White pieces captured by Black.
      // Bottom player (White): Shows Black pieces captured by White.
      
      // Let's calculate missing pieces for each color.
      // White pieces missing:
      const whiteMissing: string[] = []
      const blackMissing: string[] = []

      // Check White pieces (Uppercase)
      for (const [piece, count] of Object.entries(STARTING_PIECES)) {
        const whitePiece = piece.toUpperCase()
        const currentCount = pieces[whitePiece] || 0
        for (let i = 0; i < count - currentCount; i++) {
          whiteMissing.push(whitePiece)
        }
      }

      // Check Black pieces (Lowercase)
      for (const [piece, count] of Object.entries(STARTING_PIECES)) {
        const blackPiece = piece
        const currentCount = pieces[blackPiece] || 0
        for (let i = 0; i < count - currentCount; i++) {
          blackMissing.push(blackPiece)
        }
      }
      
      return { whiteMissing, blackMissing }
    }

    const { whiteMissing, blackMissing } = getCaptured()

    // Calculate material score
    let wScore = 0
    let bScore = 0
    
    // Sum of pieces ON BOARD
    for (const [p, count] of Object.entries(pieces)) {
      if (p === p.toUpperCase()) { // White
        wScore += (PIECE_VALUES[p.toLowerCase()] || 0) * count
      } else { // Black
        bScore += (PIECE_VALUES[p] || 0) * count
      }
    }

    return {
      whiteCaptured: blackMissing, // Pieces White has captured (Black pieces missing)
      blackCaptured: whiteMissing, // Pieces Black has captured (White pieces missing)
      whiteScore: wScore,
      blackScore: bScore
    }
  }, [fen])

  const renderCaptured = (pieces: string[]) => {
    // Sort pieces: Q, R, B, N, P
    const order = ['q', 'r', 'b', 'n', 'p']
    const sorted = [...pieces].sort((a, b) => {
      return order.indexOf(a.toLowerCase()) - order.indexOf(b.toLowerCase())
    })

    return (
      <div className="flex -space-x-1 h-6 items-center">
        {sorted.map((p, i) => (
          <img
            key={i}
            src={`https://images.chesscomfiles.com/chess-themes/pieces/neo/150/${p === p.toUpperCase() ? 'w' : 'b'}${p.toLowerCase()}.png`}
            alt={p}
            className="w-6 h-6 object-contain"
          />
        ))}
      </div>
    )
  }

  const scoreDiff = whiteScore - blackScore
  
  // If orientation is 'w' (White at bottom):
  // Top: Black player info (shows White pieces captured by Black)
  // Bottom: White player info (shows Black pieces captured by White)
  
  // But usually "Captured Pieces" component is displayed near the player who CAPTURED them.
  // So near White player, we show Black pieces captured.
  
  const piecesToShow = orientation === 'w' ? whiteCaptured : blackCaptured
  const advantage = orientation === 'w' ? (scoreDiff > 0 ? `+${scoreDiff}` : '') : (scoreDiff < 0 ? `+${Math.abs(scoreDiff)}` : '')

  return (
    <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700/50 px-2 py-1 rounded text-sm min-h-[32px]">
      {renderCaptured(piecesToShow)}
      {advantage && <span className="font-semibold text-gray-600 dark:text-gray-300 text-xs">{advantage}</span>}
    </div>
  )
}

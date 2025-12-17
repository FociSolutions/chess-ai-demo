import { useState, useRef, useMemo } from 'react'
import { Chessboard } from 'react-chessboard'
import { Chess, type Square } from 'chess.js'
import type { GameState } from '../types/chess'
import { PromotionSelector } from './PromotionSelector'

interface ChessBoardProps {
  gameState: GameState
  onMove: (from: Square, to: Square, promotion?: 'q' | 'r' | 'b' | 'n') => void
  getLegalMoves: (square?: Square) => Square[]
  boardFlipped?: boolean
  onAnnounce?: (message: string) => void
}

export function ChessBoard({ gameState, onMove, getLegalMoves, boardFlipped = false, onAnnounce }: ChessBoardProps) {
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null)
  const [pendingPromotion, setPendingPromotion] = useState<{
    from: Square
    to: Square
  } | null>(null)
  const [isShaking, setIsShaking] = useState(false)
  const liveRegionRef = useRef<HTMLDivElement>(null)

  const triggerShake = () => {
    setIsShaking(true)
    setTimeout(() => setIsShaking(false), 400)
  }

  // Announce to screen readers
  const announce = (message: string) => {
    if (onAnnounce) {
      onAnnounce(message)
    }
    if (liveRegionRef.current) {
      liveRegionRef.current.textContent = message
    }
  }

  const handleSquareClick = (square: Square) => {
    if (gameState.status !== 'playerTurn') return

    if (!selectedSquare) {
      const legal = getLegalMoves(square)
      if (legal.length > 0) {
        setSelectedSquare(square)
        announce(`${square} selected, ${legal.length} legal moves available`)
      } else {
        announce('No legal moves from this square')
      }
      return
    }

    if (selectedSquare === square) {
      setSelectedSquare(null)
      announce('Selection cleared')
      return
    }

    const legal = getLegalMoves(selectedSquare)
    if (legal.includes(square)) {
      const game = new Chess(gameState.fen)
      const piece = game.get(selectedSquare)
      const isPawn = piece && piece.type === 'p'
      
      const isPawnPromotion = isPawn &&
        ((selectedSquare[1] === '7' && square[1] === '8') ||
         (selectedSquare[1] === '2' && square[1] === '1'))

      if (isPawnPromotion) {
        setPendingPromotion({ from: selectedSquare, to: square })
        announce('Pawn promotion required')
      } else {
        onMove(selectedSquare, square)
        setSelectedSquare(null)
        announce(`Move from ${selectedSquare} to ${square}`)
      }
    } else {
      const newLegal = getLegalMoves(square)
      if (newLegal.length > 0) {
        setSelectedSquare(square)
        announce(`${square} selected, ${newLegal.length} legal moves available`)
      } else {
        setSelectedSquare(null)
        announce('Illegal move')
        triggerShake()
      }
    }
  }

  const handlePieceDrop = (sourceSquare: string, targetSquare: string): boolean => {
    if (gameState.status !== 'playerTurn') {
      return false
    }

    const legalMoves = getLegalMoves(sourceSquare as Square)
    
    if (!legalMoves.includes(targetSquare as Square)) {
      triggerShake()
      return false
    }

    // Check if this is a promotion move
    const game = new Chess(gameState.fen)
    const piece = game.get(sourceSquare as Square)
    const isPawn = piece && piece.type === 'p'

    const isPawnPromotion = isPawn &&
      ((sourceSquare[1] === '7' && targetSquare[1] === '8') ||
       (sourceSquare[1] === '2' && targetSquare[1] === '1'))

    if (isPawnPromotion) {
      setPendingPromotion({ from: sourceSquare as Square, to: targetSquare as Square })
      return true
    }

    onMove(sourceSquare as Square, targetSquare as Square)
    return true
  }

  const handlePromotion = (piece: 'q' | 'r' | 'b' | 'n') => {
    if (pendingPromotion) {
      onMove(pendingPromotion.from, pendingPromotion.to, piece)
      setPendingPromotion(null)
    }
  }

  const handlePromotionCancel = () => {
    setPendingPromotion(null)
    setSelectedSquare(null)
  }

  // Handle clicks on the board using event delegation
  const handleBoardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Find the data-square attribute in the clicked element or its parents
    let target = e.target as HTMLElement
    while (target && !target.hasAttribute('data-square')) {
      target = target.parentElement as HTMLElement
    }
    
    if (target && target.hasAttribute('data-square')) {
      const square = target.getAttribute('data-square') as Square
      handleSquareClick(square)
    }
  }

  // Calculate custom square styles
  const customSquareStyles = useMemo(() => {
    const styles: Record<string, React.CSSProperties> = {}

    // Last move
    if (gameState.lastMoveFrom) {
      styles[gameState.lastMoveFrom] = { backgroundColor: 'rgba(255, 255, 0, 0.4)' }
    }
    if (gameState.lastMoveTo) {
      styles[gameState.lastMoveTo] = { backgroundColor: 'rgba(255, 255, 0, 0.4)' }
    }

    // Selected square
    if (selectedSquare) {
      styles[selectedSquare] = { backgroundColor: 'rgba(255, 255, 0, 0.6)' }
      
      // Legal moves
      const legalMoves = getLegalMoves(selectedSquare)
      legalMoves.forEach(move => {
        styles[move] = {
          background: 'radial-gradient(circle, rgba(0,0,0,.2) 25%, transparent 25%)',
          borderRadius: '50%'
        }
      })
    }

    // Check
    if (gameState.isCheck && gameState.kingSquareInCheck) {
      styles[gameState.kingSquareInCheck] = {
        background: 'radial-gradient(circle, rgba(255,0,0,.5) 50%, transparent 50%)',
        borderRadius: '50%'
      }
    }

    // AI Thinking - Highlight AI King
    if (gameState.status === 'aiThinking') {
      const board = gameState.fen.split(' ')[0]
      const rows = board.split('/')
      const targetPiece = gameState.aiColor === 'w' ? 'K' : 'k'
      
      let aiKingSquare: Square | null = null
      for (let r = 0; r < 8; r++) {
        let c = 0
        for (const char of rows[r]) {
          if (/\d/.test(char)) {
            c += parseInt(char)
          } else {
            if (char === targetPiece) {
              const file = String.fromCharCode(97 + c)
              const rank = 8 - r
              aiKingSquare = `${file}${rank}` as Square
              break
            }
            c++
          }
        }
        if (aiKingSquare) break
      }

      if (aiKingSquare) {
        styles[aiKingSquare] = {
          boxShadow: 'inset 0 0 12px 4px rgba(59, 130, 246, 0.6)', // Blue glow
          transition: 'box-shadow 0.5s ease-in-out'
        }
      }
    }

    return styles
  }, [gameState, selectedSquare, getLegalMoves])

  return (
    <div className={`w-full ${isShaking ? 'animate-shake' : ''}`}>
      {/* Live region for screen readers */}
      <div
        ref={liveRegionRef}
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      />
      
      <div onClick={handleBoardClick}>
        <Chessboard
          options={{
            id: 'chessboard',
            position: gameState.fen,
            onPieceDrop: ({ sourceSquare, targetSquare }) => {
              if (!sourceSquare || !targetSquare) return false
              return handlePieceDrop(sourceSquare, targetSquare)
            },
            boardOrientation: boardFlipped
              ? (gameState.playerColor === 'w' ? 'black' : 'white')
              : (gameState.playerColor === 'w' ? 'white' : 'black'),
            darkSquareStyle: { backgroundColor: '#769656' },
            lightSquareStyle: { backgroundColor: '#eeeed2' },
            squareStyles: customSquareStyles,
            animationDurationInMs: 200
          }}
        />
      </div>
      {pendingPromotion && (
        <PromotionSelector
          onSelect={handlePromotion}
          onCancel={handlePromotionCancel}
          playerColor={gameState.playerColor}
        />
      )}
    </div>
  )
}

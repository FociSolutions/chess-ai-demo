import { useState, useEffect, useRef, useMemo } from 'react'
import { Chessboard } from 'react-chessboard'
import type { Square } from 'chess.js'
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
  const liveRegionRef = useRef<HTMLDivElement>(null)

  console.log('ChessBoard render - status:', gameState.status, 'draggable:', gameState.status === 'playerTurn')

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
      const isPawnPromotion =
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
      }
    }
  }

  // Apply custom square styles to DOM directly
  useEffect(() => {
    const board = document.querySelector('#chessboard-board')
    if (!board) return

    // IMPORTANT:
    // react-chessboard paints the checkerboard via each square's inline `backgroundColor`.
    // If we clear or overwrite `backgroundColor`, the board colors disappear.

    // Reset only styles we own (leave background/backgroundColor alone)
    const allSquares = board.querySelectorAll('[data-square]')
    allSquares.forEach((sq) => {
      const elem = sq as HTMLElement
      elem.style.outline = ''
      elem.style.outlineOffset = ''
      elem.style.boxShadow = ''
      elem.style.backgroundImage = ''
      elem.style.backgroundSize = ''
      elem.style.backgroundPosition = ''
      elem.style.backgroundRepeat = ''
    })

    const squareShadows = new Map<string, string[]>()
    const addShadow = (square: string, shadow: string) => {
      const list = squareShadows.get(square) ?? []
      list.push(shadow)
      squareShadows.set(square, list)
    }

    // Selected square highlight (overlay without touching base backgroundColor)
    if (selectedSquare) {
      addShadow(selectedSquare, 'inset 0 0 0 9999px rgba(255, 255, 0, 0.35)')

      // Legal move indicators (a subtle dot via background-image; keeps base color)
      const legalMoves = getLegalMoves(selectedSquare)
      legalMoves.forEach((square) => {
        const targetElem = board.querySelector(`[data-square="${square}"]`) as HTMLElement
        if (targetElem) {
          targetElem.style.backgroundImage = 'radial-gradient(circle at center, rgba(0, 0, 0, 0.28) 0 12%, transparent 13%)'
          targetElem.style.backgroundRepeat = 'no-repeat'
          targetElem.style.backgroundPosition = 'center'
          targetElem.style.backgroundSize = '100% 100%'
        }
      })
    }

    // Last move highlights (overlay)
    if (gameState.lastMoveFrom && gameState.lastMoveTo) {
      addShadow(gameState.lastMoveFrom, 'inset 0 0 0 9999px rgba(155, 199, 0, 0.28)')
      addShadow(gameState.lastMoveTo, 'inset 0 0 0 9999px rgba(155, 199, 0, 0.28)')
    }

    // Check highlight (overlay + glow)
    if (gameState.isCheck && gameState.kingSquareInCheck) {
      addShadow(gameState.kingSquareInCheck, 'inset 0 0 0 9999px rgba(255, 0, 0, 0.25)')
      addShadow(gameState.kingSquareInCheck, 'inset 0 0 10px rgba(255, 0, 0, 0.55)')
    }

    // Apply merged shadows
    squareShadows.forEach((shadows, square) => {
      const elem = board.querySelector(`[data-square="${square}"]`) as HTMLElement
      if (elem) elem.style.boxShadow = shadows.join(', ')
    })
  }, [selectedSquare, gameState.isCheck, gameState.kingSquareInCheck, gameState.lastMoveFrom, gameState.lastMoveTo])

  const handlePieceDrop = (sourceSquare: string, targetSquare: string): boolean => {
    console.log('Piece drop from', sourceSquare, '→', targetSquare, 'Status:', gameState.status)

    if (gameState.status !== 'playerTurn') {
      console.log('Not player turn, returning false')
      return false
    }

    const legalMoves = getLegalMoves(sourceSquare as Square)
    console.log('Legal moves from', sourceSquare, ':', legalMoves)
    
    if (!legalMoves.includes(targetSquare as Square)) {
      console.log('Target not in legal moves, returning false')
      return false
    }

    // Check if this is a promotion move
    const isPawnPromotion =
      ((sourceSquare[1] === '7' && targetSquare[1] === '8') ||
       (sourceSquare[1] === '2' && targetSquare[1] === '1'))

    if (isPawnPromotion) {
      console.log('Pawn promotion detected')
      setPendingPromotion({ from: sourceSquare as Square, to: targetSquare as Square })
      return true
    }

    console.log('Making move')
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

  return (
    <div className="w-full max-w-2xl">
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

import { useState } from 'react'
import { Chessboard } from 'react-chessboard'
import type { Square } from 'chess.js'
import type { GameState } from '../types/chess'
import { PromotionSelector } from './PromotionSelector'

interface ChessBoardProps {
  gameState: GameState
  onMove: (from: Square, to: Square, promotion?: 'q' | 'r' | 'b' | 'n') => void
  getLegalMoves: (square?: Square) => Square[]
}

export function ChessBoard({ gameState, onMove, getLegalMoves }: ChessBoardProps) {
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null)
  const [pendingPromotion, setPendingPromotion] = useState<{
    from: Square
    to: Square
  } | null>(null)

  console.log('ChessBoard render - status:', gameState.status, 'draggable:', gameState.status === 'playerTurn')



  const handlePieceDrop = ({ sourceSquare, targetSquare }: { sourceSquare: string; targetSquare: string | null }): boolean => {
    console.log('Piece drop from', sourceSquare, '→', targetSquare, 'Status:', gameState.status)
    
    if (!targetSquare) {
      console.log('No target square (dropped off board)')
      return false
    }
    
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

  // Highlight customization
  const customSquareStyles: Record<string, React.CSSProperties> = {}
  
  // Highlight selected square
  if (selectedSquare) {
    customSquareStyles[selectedSquare] = {
      backgroundColor: 'rgba(255, 255, 0, 0.4)',
    }
  }

  // Highlight legal moves
  if (selectedSquare) {
    const legalMoves = getLegalMoves(selectedSquare)
    legalMoves.forEach((square) => {
      customSquareStyles[square] = {
        background: 'radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)',
        borderRadius: '50%',
      }
    })
  }

  // Highlight last move
  if (gameState.lastMoveFrom && gameState.lastMoveTo) {
    customSquareStyles[gameState.lastMoveFrom] = {
      backgroundColor: 'rgba(155, 199, 0, 0.41)',
    }
    customSquareStyles[gameState.lastMoveTo] = {
      backgroundColor: 'rgba(155, 199, 0, 0.41)',
    }
  }

  return (
    <div className="w-full max-w-2xl">
      <Chessboard
        options={{
          id: 'chessboard',
          position: gameState.fen,
          onPieceDrop: handlePieceDrop,
          boardOrientation: gameState.playerColor === 'w' ? 'white' : 'black',
          squareStyles: customSquareStyles,
          boardStyle: {
            borderRadius: '4px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
          },
        }}
      />
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

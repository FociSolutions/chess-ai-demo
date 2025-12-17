import type { GameState } from '../types/chess'

interface GameStatusProps {
  gameState: GameState
}

export function GameStatus({ gameState }: GameStatusProps) {
  const getTurnText = () => {
    if (gameState.status === 'gameOver') {
      return gameState.resultMessage || 'Game Over'
    }

    if (gameState.status === 'aiThinking') {
      return 'AI is thinking...'
    }

    if (gameState.status === 'playerTurn') {
      return 'Your turn'
    }

    return ''
  }

  const getStatusText = () => {
    if (gameState.isCheckmate) {
      return 'Checkmate!'
    }
    if (gameState.isCheck) {
      return 'Check!'
    }
    if (gameState.isStalemate) {
      return 'Stalemate'
    }
    if (gameState.isDraw) {
      return `Draw (${gameState.drawReason})`
    }
    return ''
  }

  const getTurnAndMoveAnnouncement = () => {
    let message = getTurnText()
    if (gameState.isCheck) {
      message += ' - You are in check!'
    }
    return message
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 space-y-3">
      <div className="text-xl font-bold text-center" role="status" aria-live="polite">
        {getTurnAndMoveAnnouncement()}
      </div>
      
      {getStatusText() && (
        <div className="text-center text-lg font-semibold text-red-600 dark:text-red-400" role="alert">
          {getStatusText()}
        </div>
      )}
      
      <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
        Move {Math.floor(gameState.moves.length / 2) + 1}
      </div>

      {/* Captured pieces display */}
      {gameState.capturedPieces && (gameState.capturedPieces.white.length > 0 || gameState.capturedPieces.black.length > 0) && (
        <div className="space-y-2 border-t pt-3 mt-3">
          {gameState.capturedPieces.black.length > 0 && (
            <div className="text-sm">
              <span className="font-semibold">You captured: </span>
              <span className="text-lg">{gameState.capturedPieces.black.join(' ')}</span>
            </div>
          )}
          {gameState.capturedPieces.white.length > 0 && (
            <div className="text-sm">
              <span className="font-semibold">AI captured: </span>
              <span className="text-lg">{gameState.capturedPieces.white.join(' ')}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

import type { GameState } from '../types/chess'
import { CapturedPieces } from './CapturedPieces'

interface GameStatusProps {
  gameState: GameState
  engineError?: Error | null
}

export function GameStatus({ gameState, engineError }: GameStatusProps) {
  if (engineError) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-center">
        <div className="text-red-600 dark:text-red-400 font-semibold">
          AI Error: {engineError.message}
        </div>
        <div className="text-sm text-red-500 dark:text-red-300 mt-1">
          Please try refreshing the page.
        </div>
      </div>
    )
  }

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
    return null
  }

  const statusText = getStatusText()

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {getTurnText()}
          </h2>
          {statusText && (
            <p className="text-red-600 dark:text-red-400 font-semibold mt-1">
              {statusText}
            </p>
          )}
        </div>
        
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-gray-400 w-12">White:</span>
            <CapturedPieces fen={gameState.fen} orientation="w" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-gray-400 w-12">Black:</span>
            <CapturedPieces fen={gameState.fen} orientation="b" />
          </div>
        </div>
      </div>
    </div>
  )
}

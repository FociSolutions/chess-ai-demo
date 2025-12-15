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

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 space-y-2">
      <div className="text-xl font-bold text-center">{getTurnText()}</div>
      {getStatusText() && (
        <div className="text-center text-lg font-semibold text-red-600 dark:text-red-400">
          {getStatusText()}
        </div>
      )}
      <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
        Move {Math.floor(gameState.moves.length / 2) + 1}
      </div>
    </div>
  )
}

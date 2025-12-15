import type { GameState } from '../types/chess'

interface GameControlsProps {
  gameState: GameState
  canUndo: boolean
  canNewGame: boolean
  onNewGame: () => void
  onResign: () => void
  onUndo: () => void
  boardFlipped: boolean
  onFlipBoard: () => void
}

export function GameControls({
  gameState,
  canUndo,
  canNewGame,
  onNewGame,
  onResign,
  onUndo,
  boardFlipped,
  onFlipBoard,
}: GameControlsProps) {
  const isGameOver = gameState.status === 'gameOver'
  const isThinking = gameState.status === 'aiThinking'

  return (
    <div className="flex flex-wrap gap-2 justify-center mt-4">
      <button
        onClick={onNewGame}
        disabled={!canNewGame}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
        title="Start a new game"
      >
        New Game
      </button>

      <button
        onClick={onUndo}
        disabled={!canUndo || isThinking}
        className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
        title="Undo last full turn (player + AI move)"
      >
        Undo
      </button>

      <button
        onClick={onResign}
        disabled={!isGameOver && gameState.status === 'startScreen'}
        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
        title="Resign the current game"
      >
        Resign
      </button>

      <button
        onClick={onFlipBoard}
        disabled={gameState.status === 'startScreen'}
        className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
        title={boardFlipped ? 'Flip board to normal orientation' : 'Flip board to opposite orientation'}
      >
        Flip Board
      </button>

      {isThinking && (
        <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded">
          <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
          AI thinking...
        </div>
      )}
    </div>
  )
}

import { useEffect, useRef } from 'react'
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
  const controlsCooldownUntil = useRef<number>(0)

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid firing shortcuts in text inputs/textareas if added later
      const target = e.target as HTMLElement | null
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.getAttribute('contenteditable') === 'true')) {
        return
      }

      const now = Date.now()
      if (e.repeat) return
      if (now < controlsCooldownUntil.current) return

      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'n' || e.key === 'N') {
          e.preventDefault()
          controlsCooldownUntil.current = Date.now() + 200
          if (canNewGame) onNewGame()
        } else if (e.key === 'z' || e.key === 'Z') {
          e.preventDefault()
          controlsCooldownUntil.current = Date.now() + 200
          if (canUndo && !isThinking) onUndo()
        }
      } else if (e.key === 'r' || e.key === 'R') {
        if (gameState.status !== 'startScreen' && gameState.status !== 'initializing') {
          e.preventDefault()
          controlsCooldownUntil.current = Date.now() + 200
          onResign()
        }
      } else if (e.key === 'f' || e.key === 'F') {
        if (gameState.status !== 'startScreen') {
          e.preventDefault()
          controlsCooldownUntil.current = Date.now() + 200
          onFlipBoard()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [canUndo, canNewGame, isGameOver, isThinking, gameState.status, onNewGame, onResign, onUndo, onFlipBoard])

  return (
    <div className="flex flex-wrap gap-2 justify-center mt-4">
      <button
        onClick={onNewGame}
        disabled={!canNewGame}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
        title="Start a new game (Ctrl+N)"
        aria-label="New Game - keyboard shortcut Ctrl+N"
      >
        New Game
      </button>

      <button
        onClick={onUndo}
        disabled={!canUndo || isThinking}
        className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
        title="Undo last full turn (Ctrl+Z)"
        aria-label="Undo - keyboard shortcut Ctrl+Z"
      >
        Undo
      </button>

      <button
        onClick={onResign}
        disabled={gameState.status === 'startScreen' || gameState.status === 'initializing'}
        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
        title="Resign the current game (R)"
        aria-label="Resign - keyboard shortcut R"
      >
        Resign
      </button>

      <button
        onClick={onFlipBoard}
        disabled={gameState.status === 'startScreen'}
        className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
        title={boardFlipped ? 'Flip board to normal orientation (F)' : 'Flip board to opposite orientation (F)'}
        aria-label={boardFlipped ? 'Flip board - keyboard shortcut F' : 'Flip board - keyboard shortcut F'}
      >
        Flip Board
      </button>

      {isThinking && (
        <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded">
          <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
          AI thinking...
        </div>
      )}

      {/* Keyboard shortcuts legend */}
      <div className="w-full mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
        <p>Keyboard shortcuts: Ctrl+N (New), Ctrl+Z (Undo), R (Resign), F (Flip)</p>
      </div>
    </div>
  )
}

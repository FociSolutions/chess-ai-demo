import { useEffect, useRef } from 'react'
import { Plus, Undo2, Flag, RefreshCw } from 'lucide-react'
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

  const buttonClass = "p-3 rounded-lg transition-colors duration-200 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2"
  const primaryClass = "bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500 disabled:bg-gray-300 dark:disabled:bg-gray-700 dark:disabled:text-gray-500 disabled:cursor-not-allowed"
  const secondaryClass = "bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-400 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:disabled:bg-gray-800 dark:disabled:text-gray-600"
  const dangerClass = "bg-gray-200 text-gray-700 hover:bg-red-100 hover:text-red-600 focus:ring-red-500 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-red-900/30 dark:hover:text-red-400 dark:disabled:bg-gray-800 dark:disabled:text-gray-600"

  return (
    <div className="flex flex-wrap gap-2 justify-center mt-4 bg-white dark:bg-gray-800 p-2 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
      <button
        onClick={onNewGame}
        disabled={!canNewGame}
        className={`${buttonClass} ${primaryClass}`}
        title="New Game (Ctrl+N)"
        aria-label="New Game - keyboard shortcut Ctrl+N"
      >
        <Plus size={24} />
      </button>

      <button
        onClick={onUndo}
        disabled={!canUndo || isThinking}
        className={`${buttonClass} ${secondaryClass}`}
        title="Undo (Ctrl+Z)"
        aria-label="Undo - keyboard shortcut Ctrl+Z"
      >
        <Undo2 size={24} />
      </button>

      <button
        onClick={onResign}
        disabled={gameState.status === 'startScreen' || gameState.status === 'initializing'}
        className={`${buttonClass} ${dangerClass}`}
        title="Resign (R)"
        aria-label="Resign - keyboard shortcut R"
      >
        <Flag size={24} />
      </button>

      <button
        onClick={onFlipBoard}
        disabled={gameState.status === 'startScreen'}
        className={`${buttonClass} ${secondaryClass}`}
        title="Flip Board (F)"
        aria-label="Flip Board - keyboard shortcut F"
      >
        <RefreshCw size={24} className={boardFlipped ? "rotate-180 transition-transform" : "transition-transform"} />
      </button>
    </div>
  )
}

import { useState } from 'react'
import { DifficultySelector } from './DifficultySelector'
import { BoardThemeSelector } from './BoardThemeSelector'
import type { Difficulty, BoardTheme } from '../types/chess'

interface StartScreenProps {
  onStartGame: (difficulty: Difficulty, playerColor: 'w' | 'b', theme: BoardTheme) => void
  engineReady: boolean
}

export function StartScreen({ onStartGame, engineReady }: StartScreenProps) {
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [color, setColor] = useState<'w' | 'b'>('w')
  const [theme, setTheme] = useState<BoardTheme>('green')

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-900 dark:text-white">Chess vs AI</h1>
        <div className="flex items-center justify-center gap-2 mb-8">
          {!engineReady && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          )}
          <p className="text-center text-gray-600 dark:text-gray-400">
            {engineReady ? 'Ready to play!' : 'Loading chess engine...'}
          </p>
        </div>

        <DifficultySelector
          selectedDifficulty={difficulty}
          selectedColor={color}
          onDifficultyChange={setDifficulty}
          onColorChange={setColor}
        />

        <div className="mt-6">
          <BoardThemeSelector
            selectedTheme={theme}
            onThemeChange={setTheme}
          />
        </div>

        <button
          onClick={() => onStartGame(difficulty, color, theme)}
          disabled={!engineReady}
          className="w-full mt-8 py-4 bg-blue-600 text-white rounded-lg font-semibold text-lg hover:bg-blue-700 disabled:bg-gray-400 dark:disabled:bg-gray-700 dark:disabled:text-gray-500 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {!engineReady && (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          )}
          {engineReady ? 'Start Game' : 'Loading...'}
        </button>
      </div>
    </div>
  )
}

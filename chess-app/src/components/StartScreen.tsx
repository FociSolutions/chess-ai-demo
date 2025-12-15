import { useState } from 'react'
import { DifficultySelector } from './DifficultySelector'
import type { Difficulty } from '../types/chess'

interface StartScreenProps {
  onStartGame: (difficulty: Difficulty, playerColor: 'w' | 'b') => void
  engineReady: boolean
}

export function StartScreen({ onStartGame, engineReady }: StartScreenProps) {
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [color, setColor] = useState<'w' | 'b'>('w')

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-2">Chess vs AI</h1>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
          {engineReady ? 'Ready to play!' : 'Loading chess engine...'}
        </p>

        <DifficultySelector
          selectedDifficulty={difficulty}
          selectedColor={color}
          onDifficultyChange={setDifficulty}
          onColorChange={setColor}
        />

        <button
          onClick={() => onStartGame(difficulty, color)}
          disabled={!engineReady}
          className="w-full mt-8 py-4 bg-blue-600 text-white rounded-lg font-semibold text-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {engineReady ? 'Start Game' : 'Loading...'}
        </button>
      </div>
    </div>
  )
}

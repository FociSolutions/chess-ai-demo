import type { Difficulty } from '../types/chess'

interface DifficultySelectorProps {
  selectedDifficulty: Difficulty
  selectedColor: 'w' | 'b'
  onDifficultyChange: (difficulty: Difficulty) => void
  onColorChange: (color: 'w' | 'b') => void
}

const difficulties: { value: Difficulty; label: string; description: string }[] = [
  { value: 'easy', label: 'Easy', description: '~200 ELO' },
  { value: 'medium', label: 'Medium', description: '~800 ELO' },
  { value: 'hard', label: 'Hard', description: '~1200 ELO' },
  { value: 'veryHard', label: 'Very Hard', description: '~2000 ELO' },
]

export function DifficultySelector({
  selectedDifficulty,
  selectedColor,
  onDifficultyChange,
  onColorChange,
}: DifficultySelectorProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-3">Difficulty</h3>
        <div className="grid grid-cols-2 gap-3">
          {difficulties.map(({ value, label, description }) => (
            <button
              key={value}
              onClick={() => onDifficultyChange(value)}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedDifficulty === value
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-blue-300'
              }`}
            >
              <div className="font-semibold">{label}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{description}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Play as</h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onColorChange('w')}
            className={`p-4 rounded-lg border-2 transition-all ${
              selectedColor === 'w'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-blue-300'
            }`}
          >
            <div className="font-semibold">White</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">First move</div>
          </button>
          <button
            onClick={() => onColorChange('b')}
            className={`p-4 rounded-lg border-2 transition-all ${
              selectedColor === 'b'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-blue-300'
            }`}
          >
            <div className="font-semibold">Black</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Second move</div>
          </button>
        </div>
      </div>
    </div>
  )
}

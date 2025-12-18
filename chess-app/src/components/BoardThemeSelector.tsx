import type { BoardTheme } from '../types/chess'
import { THEME_COLORS } from '../lib/boardThemes'

interface BoardThemeSelectorProps {
  selectedTheme: BoardTheme
  onThemeChange: (theme: BoardTheme) => void
}

const themes: { value: BoardTheme; label: string }[] = [
  { value: 'green', label: 'Green' },
  { value: 'blue', label: 'Blue' },
  { value: 'brown', label: 'Brown' },
]

export function BoardThemeSelector({
  selectedTheme,
  onThemeChange,
}: BoardThemeSelectorProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Board Theme</h3>
      <div className="grid grid-cols-3 gap-3">
        {themes.map(({ value, label }) => {
          const colors = THEME_COLORS[value]
          return (
            <button
              key={value}
              onClick={() => onThemeChange(value)}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedTheme === value
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-blue-300'
              }`}
            >
              <div className="font-semibold text-gray-900 dark:text-white mb-2">{label}</div>
              <div className="flex gap-1">
                <div
                  className="w-8 h-8 rounded border border-gray-300"
                  style={{ backgroundColor: colors.light }}
                  aria-label={`${label} light square`}
                />
                <div
                  className="w-8 h-8 rounded border border-gray-300"
                  style={{ backgroundColor: colors.dark }}
                  aria-label={`${label} dark square`}
                />
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

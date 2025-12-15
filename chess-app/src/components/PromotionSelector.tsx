interface PromotionSelectorProps {
  onSelect: (piece: 'q' | 'r' | 'b' | 'n') => void
  onCancel: () => void
  playerColor: 'w' | 'b'
}

const pieceSymbols = {
  w: { q: '♕', r: '♖', b: '♗', n: '♘' },
  b: { q: '♛', r: '♜', b: '♝', n: '♞' },
}

const pieceNames = {
  q: 'Queen',
  r: 'Rook',
  b: 'Bishop',
  n: 'Knight',
}

export function PromotionSelector({ onSelect, onCancel, playerColor }: PromotionSelectorProps) {
  const pieces: ('q' | 'r' | 'b' | 'n')[] = ['q', 'r', 'b', 'n']

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-sm w-full mx-4">
        <h2 className="text-2xl font-bold text-center mb-6">Promote Pawn</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          {pieces.map((piece) => (
            <button
              key={piece}
              onClick={() => onSelect(piece)}
              className="p-6 rounded-lg border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
            >
              <div className="text-6xl text-center mb-2">{pieceSymbols[playerColor][piece]}</div>
              <div className="text-center font-semibold">{pieceNames[piece]}</div>
            </button>
          ))}
        </div>
        <button
          onClick={onCancel}
          className="w-full py-3 bg-gray-200 dark:bg-gray-700 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

import type { Move } from '../types/chess'

interface MoveHistoryProps {
  moves: Move[]
  currentMoveIndex?: number
}

export function MoveHistory({ moves, currentMoveIndex }: MoveHistoryProps) {
  if (moves.length === 0) {
    return (
      <div className="text-center text-gray-500 py-4">
        No moves yet
      </div>
    )
  }

  // Group moves into pairs (white move, black move)
  const movePairs: [Move, Move | undefined][] = []
  for (let i = 0; i < moves.length; i += 2) {
    movePairs.push([moves[i], moves[i + 1]])
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mt-4">
      <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
        Move History
      </h3>
      <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
        {movePairs.map((pair, pairIndex) => {
          const moveNumber = pairIndex + 1
          const [whiteMove, blackMove] = pair
          const whiteIsHighlighted = currentMoveIndex === pairIndex * 2
          const blackIsHighlighted = currentMoveIndex === pairIndex * 2 + 1

          return (
            <div
              key={pairIndex}
              className="flex items-center gap-2 text-sm font-mono"
            >
              <span className="w-8 text-gray-500 dark:text-gray-400">
                {moveNumber}.
              </span>

              <span
                className={`px-2 py-1 rounded ${
                  whiteIsHighlighted
                    ? 'bg-yellow-200 dark:bg-yellow-700 font-bold'
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                {whiteMove.san}
              </span>

              {blackMove && (
                <span
                  className={`px-2 py-1 rounded ${
                    blackIsHighlighted
                      ? 'bg-yellow-200 dark:bg-yellow-700 font-bold'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {blackMove.san}
                </span>
              )}

              {/* Show move flags as indicators */}
              <div className="flex gap-1 ml-auto text-xs">
                {(whiteMove.flags.capture || blackMove?.flags.capture) && (
                  <span title="Capture" className="text-red-500">
                    ×
                  </span>
                )}
                {(whiteMove.flags.check || blackMove?.flags.check) && (
                  <span title="Check" className="text-orange-500">
                    +
                  </span>
                )}
                {(whiteMove.flags.castling || blackMove?.flags.castling) && (
                  <span title="Castling" className="text-blue-500">
                    O
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

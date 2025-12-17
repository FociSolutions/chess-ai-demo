import { useEffect, useRef } from 'react'
import type { Move } from '../types/chess'

interface MoveHistoryProps {
  moves: Move[]
}

export function MoveHistory({ moves }: MoveHistoryProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [moves.length])

  // Group moves into pairs
  const movePairs: { white: Move; black?: Move }[] = []
  for (let i = 0; i < moves.length; i += 2) {
    movePairs.push({ white: moves[i], black: moves[i + 1] })
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow h-[400px] flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700">
      <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <div className="grid grid-cols-[3rem_1fr_1fr] gap-2 font-semibold text-sm text-gray-600 dark:text-gray-400">
          <div className="text-center">#</div>
          <div>White</div>
          <div>Black</div>
        </div>
      </div>
      
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto scroll-smooth"
      >
        {moves.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400 italic text-sm">
            Game hasn't started
          </div>
        ) : (
          <div className="grid grid-cols-[3rem_1fr_1fr] text-sm">
            {movePairs.map((pair, index) => (
              <div key={index} className="contents group">
                <div className="py-2 text-center text-gray-500 bg-gray-50 dark:bg-gray-800/50 font-mono text-xs flex items-center justify-center border-b border-gray-100 dark:border-gray-800">
                  {index + 1}.
                </div>
                <div className="py-2 px-3 font-medium text-gray-800 dark:text-gray-200 border-b border-gray-100 dark:border-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition-colors">
                  {pair.white.san}
                </div>
                <div className="py-2 px-3 font-medium text-gray-800 dark:text-gray-200 border-b border-gray-100 dark:border-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition-colors">
                  {pair.black?.san || ''}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

import { useChessGame } from './hooks/useChessGame'
import { StartScreen } from './components/StartScreen'
import { ChessBoard } from './components/ChessBoard'
import { GameStatus } from './components/GameStatus'
import type { Difficulty } from './types/chess'
import type { Square } from 'chess.js'

function App() {
  const { gameState, startGame, makePlayerMove, getLegalMoves, engineStatus } = useChessGame()

  const handleStartGame = (difficulty: Difficulty, playerColor: 'w' | 'b') => {
    startGame(playerColor, difficulty)
  }

  const handleMove = (from: Square, to: Square, promotion?: 'q' | 'r' | 'b' | 'n') => {
    makePlayerMove(from, to, promotion)
  }

  if (gameState.status === 'startScreen' || gameState.status === 'initializing') {
    return (
      <StartScreen
        onStartGame={handleStartGame}
        engineReady={engineStatus === 'ready' || engineStatus === 'thinking'}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 flex items-center justify-center">
      <div className="max-w-4xl w-full">
        <div className="mb-4">
          <GameStatus gameState={gameState} />
        </div>
        <div className="flex justify-center">
          <ChessBoard gameState={gameState} onMove={handleMove} getLegalMoves={getLegalMoves} />
        </div>
      </div>
    </div>
  )
}

export default App

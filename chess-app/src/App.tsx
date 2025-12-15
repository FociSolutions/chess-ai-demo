import { useChessGame } from './hooks/useChessGame'
import { StartScreen } from './components/StartScreen'
import { ChessBoard } from './components/ChessBoard'
import { GameStatus } from './components/GameStatus'
import { GameControls } from './components/GameControls'
import { MoveHistory } from './components/MoveHistory'
import type { Difficulty } from './types/chess'
import type { Square } from 'chess.js'

function App() {
  const {
    gameState,
    startGame,
    makePlayerMove,
    getLegalMoves,
    undo,
    resign,
    resetGame,
    toggleBoardFlip,
    boardFlipped,
    engineStatus,
  } = useChessGame()

  const handleStartGame = (difficulty: Difficulty, playerColor: 'w' | 'b') => {
    startGame(playerColor, difficulty)
  }

  const handleMove = (from: Square, to: Square, promotion?: 'q' | 'r' | 'b' | 'n') => {
    makePlayerMove(from, to, promotion)
  }

  const handleUndo = () => {
    undo()
  }

  const handleNewGame = () => {
    resetGame()
  }

  const handleResign = () => {
    resign()
  }

  const handleFlipBoard = () => {
    toggleBoardFlip()
  }

  const canUndo = gameState.moves.length >= 2 && gameState.status !== 'startScreen'
  const canNewGame = gameState.status !== 'startScreen' && gameState.status !== 'initializing'

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
      <div className="max-w-5xl w-full">
        <div className="mb-4">
          <GameStatus gameState={gameState} />
        </div>
        <div className="flex flex-col lg:flex-row gap-4 justify-center">
          <div className="flex justify-center lg:w-2/3">
            <div>
              <ChessBoard
                gameState={gameState}
                onMove={handleMove}
                getLegalMoves={getLegalMoves}
                boardFlipped={boardFlipped}
              />
              <GameControls
                gameState={gameState}
                canUndo={canUndo}
                canNewGame={canNewGame}
                onNewGame={handleNewGame}
                onResign={handleResign}
                onUndo={handleUndo}
                boardFlipped={boardFlipped}
                onFlipBoard={handleFlipBoard}
              />
            </div>
          </div>
          <div className="lg:w-1/3">
            <MoveHistory moves={gameState.moves} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
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
    engineError,
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
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 flex items-center justify-center">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-6 items-start">
        {/* Left Column: Board + Status */}
        <div className="flex flex-col gap-4">
          <GameStatus gameState={gameState} engineError={engineError} />
          <div className="bg-white dark:bg-gray-800 p-1 rounded-xl shadow-lg overflow-hidden">
            <ChessBoard
              gameState={gameState}
              onMove={handleMove}
              getLegalMoves={getLegalMoves}
              boardFlipped={boardFlipped}
            />
          </div>
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

        {/* Right Column: History */}
        <div className="lg:sticky lg:top-4">
          <MoveHistory moves={gameState.moves} />
        </div>
      </div>
    </div>
  )
}

export default App

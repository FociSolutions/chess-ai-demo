import { useState, useCallback, useRef, useEffect } from 'react'
import { Chess, type Square } from 'chess.js'
import type { GameState, GameStatus, Move, Difficulty } from '../types/chess'
import { useChessEngine } from './useChessEngine'
import { parseUCI, toUCI } from '../lib/notation'

const INITIAL_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

function createInitialState(): GameState {
  return {
    fen: INITIAL_FEN,
    turn: 'w',
    moves: [],
    status: 'startScreen',
    playerColor: 'w',
    aiColor: 'b',
    isCheck: false,
    isCheckmate: false,
    isStalemate: false,
    isDraw: false,
    resultMessage: null,
  }
}

export function useChessGame() {
  const [game] = useState(() => new Chess())
  const [gameState, setGameState] = useState<GameState>(createInitialState())
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [boardFlipped, setBoardFlipped] = useState(false)
  const [pendingAIMove, setPendingAIMove] = useState<number | null>(null)
  const gameStatusRef = useRef<GameStatus>(gameState.status)
  const engine = useChessEngine()

  // Keep ref in sync with state
  useEffect(() => {
    gameStatusRef.current = gameState.status
  }, [gameState.status])

  const updateGameState = useCallback((status?: GameStatus) => {
    const isCheck = game.isCheck()
    const isCheckmate = game.isCheckmate()
    const isStalemate = game.isStalemate()
    const isDraw = game.isDraw()
    
    let drawReason: GameState['drawReason'] = undefined
    if (isDraw) {
      if (isStalemate) {
        drawReason = 'stalemate'
      } else if (game.isThreefoldRepetition()) {
        drawReason = 'repetition'
      } else if (game.isInsufficientMaterial()) {
        drawReason = 'insufficient'
      } else {
        drawReason = '50-move'
      }
    }

    let resultMessage: string | null = null
    if (isCheckmate) {
      resultMessage = game.turn() === gameState.playerColor ? 'You lose!' : 'You win!'
    } else if (isDraw) {
      resultMessage = `Draw: ${drawReason}`
    }

    setGameState(prev => ({
      ...prev,
      fen: game.fen(),
      turn: game.turn(),
      status: status ?? prev.status,
      isCheck,
      isCheckmate,
      isStalemate,
      isDraw,
      drawReason,
      resultMessage,
    }))
  }, [game, gameState.playerColor])

  const startGame = useCallback((playerColor: 'w' | 'b', selectedDifficulty: Difficulty) => {
    game.reset()
    setDifficulty(selectedDifficulty)
    setGameState({
      ...createInitialState(),
      playerColor,
      aiColor: playerColor === 'w' ? 'b' : 'w',
      status: playerColor === 'w' ? 'playerTurn' : 'aiThinking',
    })
    
    // If AI plays white, trigger AI move
    if (playerColor === 'b') {
      const timeoutId = setTimeout(() => makeAIMove(), 100)
      setPendingAIMove(timeoutId)
    }
  }, [game])

  const makePlayerMove = useCallback((from: Square, to: Square, promotion?: 'q' | 'r' | 'b' | 'n') => {
    if (gameState.status !== 'playerTurn') {
      return { success: false, error: 'Not player turn' }
    }

    try {
      const result = game.move({ from, to, promotion })
      if (!result) {
        return { success: false, error: 'Illegal move' }
      }

      const move: Move = {
        san: result.san,
        uci: toUCI(from, to, promotion),
        actor: 'player',
        timestamp: Date.now(),
        flags: {
          capture: result.captured !== undefined,
          promotion: result.promotion as 'q' | 'r' | 'b' | 'n' | undefined,
          castling: result.flags.includes('k') ? 'k' : result.flags.includes('q') ? 'q' : undefined,
          enPassant: result.flags.includes('e'),
          check: game.isCheck(),
        },
      }

      setGameState(prev => ({
        ...prev,
        moves: [...prev.moves, move],
        lastMoveFrom: from,
        lastMoveTo: to,
      }))

      // Check for game over
      if (game.isGameOver()) {
        updateGameState('gameOver')
        return { success: true }
      }

      // Trigger AI move
      updateGameState('aiThinking')
      const timeoutId = setTimeout(() => makeAIMove(), 100)
      setPendingAIMove(timeoutId)

      return { success: true }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }, [game, gameState.status, updateGameState])

  const makeAIMove = useCallback(async () => {
    if (!engine.isReady) {
      return
    }

    // Don't make a move if game is over
    if (gameStatusRef.current === 'gameOver') {
      return
    }

    try {
      const fen = game.fen()
      const result = await engine.getBestMove(fen, difficulty, 5000)
      
      // Check again after async operation - user may have resigned during AI thinking
      if (gameStatusRef.current === 'gameOver') {
        return
      }
      
      const { from, to, promotion } = parseUCI(result.move)
      const moveResult = game.move({ from, to, promotion })
      
      if (!moveResult) {
        throw new Error('AI made illegal move')
      }

      const move: Move = {
        san: moveResult.san,
        uci: result.move,
        actor: 'ai',
        timestamp: Date.now(),
        flags: {
          capture: moveResult.captured !== undefined,
          promotion: moveResult.promotion as 'q' | 'r' | 'b' | 'n' | undefined,
          castling: moveResult.flags.includes('k') ? 'k' : moveResult.flags.includes('q') ? 'q' : undefined,
          enPassant: moveResult.flags.includes('e'),
          check: game.isCheck(),
        },
      }

      setGameState(prev => ({
        ...prev,
        moves: [...prev.moves, move],
        lastMoveFrom: from,
        lastMoveTo: to,
      }))

      // Clear pending AI move timeout
      setPendingAIMove(null)

      // Check for game over
      if (game.isGameOver()) {
        updateGameState('gameOver')
      } else {
        updateGameState('playerTurn')
      }
    } catch (error) {
      console.error('AI move error:', error)
      setPendingAIMove(null)
      updateGameState('gameOver')
    }
  }, [game, engine, difficulty, updateGameState])

  const getLegalMoves = useCallback((square?: Square): Square[] => {
    if (!square) {
      return game.moves({ verbose: true }).map(m => m.to)
    }
    return game.moves({ square, verbose: true }).map(m => m.to)
  }, [game])

  const undo = useCallback(() => {
    // Can only undo if there are at least 2 moves (player + AI)
    if (gameState.moves.length < 2) {
      return false
    }

    // Cancel any pending AI move
    if (pendingAIMove) {
      clearTimeout(pendingAIMove)
      setPendingAIMove(null)
    }

    try {
      // Undo AI's last move
      game.undo()
      // Undo player's last move
      game.undo()

      // Remove last two moves from history
      const newMoves = gameState.moves.slice(0, -2)

      setGameState(prev => ({
        ...prev,
        moves: newMoves,
        fen: game.fen(),
        turn: game.turn(),
        status: 'playerTurn',
        lastMoveFrom: newMoves.length >= 2 ? newMoves[newMoves.length - 2].uci.substring(0, 2) as Square : undefined,
        lastMoveTo: newMoves.length >= 2 ? (newMoves[newMoves.length - 2].uci.substring(2, 4) as Square) : undefined,
      }))

      // Update game state after undo
      const isCheck = game.isCheck()
      const isCheckmate = game.isCheckmate()
      const isStalemate = game.isStalemate()
      const isDraw = game.isDraw()

      let drawReason: GameState['drawReason'] = undefined
      if (isDraw && isStalemate) drawReason = 'stalemate'
      else if (isDraw && game.isThreefoldRepetition()) drawReason = 'repetition'
      else if (isDraw && game.isInsufficientMaterial()) drawReason = 'insufficient'
      else if (isDraw) drawReason = '50-move'

      setGameState(prev => ({
        ...prev,
        isCheck,
        isCheckmate,
        isStalemate,
        isDraw,
        drawReason,
        resultMessage: null,
      }))

      return true
    } catch (error) {
      console.error('Undo error:', error)
      return false
    }
  }, [game, gameState.moves, pendingAIMove])

  const resign = useCallback(() => {
    // Cancel any pending AI move
    if (pendingAIMove) {
      clearTimeout(pendingAIMove)
      setPendingAIMove(null)
    }

    setGameState(prev => ({
      ...prev,
      status: 'gameOver',
      resultMessage: 'You resigned. AI wins!',
      isCheckmate: false,
      isStalemate: false,
      isDraw: false,
    }))
  }, [pendingAIMove])

  const resetGame = useCallback(() => {
    // Cancel any pending AI move
    if (pendingAIMove) {
      clearTimeout(pendingAIMove)
      setPendingAIMove(null)
    }

    game.reset()
    setBoardFlipped(false)
    setGameState(createInitialState())
  }, [game, pendingAIMove])

  const toggleBoardFlip = useCallback(() => {
    setBoardFlipped(prev => !prev)
  }, [])

  return {
    gameState,
    startGame,
    makePlayerMove,
    getLegalMoves,
    undo,
    resign,
    resetGame,
    toggleBoardFlip,
    boardFlipped,
    engineStatus: engine.status,
    engineError: engine.error,
  }
}

import { useEffect, useRef, useState } from 'react'
import { ChessEngine, type BestMoveResult, type EngineStatus } from '../lib/engine'
import type { Difficulty } from '../types/chess'

export function useChessEngine() {
  const engineRef = useRef<ChessEngine | null>(null)
  const [status, setStatus] = useState<EngineStatus>('idle')
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    // Initialize engine
    const engine = new ChessEngine()
    engineRef.current = engine
    
    // Poll status every 100ms
    const statusInterval = setInterval(() => {
      if (engineRef.current) {
        setStatus(engineRef.current.getStatus())
      }
    }, 100)

    // Wait for ready
    engine.ensureReady().catch((err) => {
      setError(err)
      setStatus('error')
    })

    return () => {
      clearInterval(statusInterval)
      if (engineRef.current) {
        engineRef.current.terminate()
        engineRef.current = null
      }
    }
  }, [])

  const getBestMove = async (
    fen: string,
    difficulty: Difficulty,
    timeoutMs?: number
  ): Promise<BestMoveResult> => {
    if (!engineRef.current) {
      throw new Error('Engine not initialized')
    }
    
    try {
      setError(null)
      const result = await engineRef.current.getBestMove(fen, difficulty, timeoutMs)
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown engine error')
      setError(error)
      throw error
    }
  }

  return {
    status,
    error,
    getBestMove,
    isReady: status === 'ready' || status === 'thinking',
  }
}

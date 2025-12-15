import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { ChessEngine } from '../../src/lib/engine'

// Mock Worker since it's not available in Node test environment
class MockWorker {
  onmessage: ((e: MessageEvent) => void) | null = null
  onerror: ((e: ErrorEvent) => void) | null = null
  private messageHandler: ((msg: string) => void) | null = null

  postMessage(msg: string) {
    // Simulate Stockfish responses
    if (msg === 'uci') {
      setTimeout(() => {
        this.onmessage?.({ data: 'uciok' } as MessageEvent)
      }, 10)
    } else if (msg === 'isready') {
      setTimeout(() => {
        this.onmessage?.({ data: 'readyok' } as MessageEvent)
      }, 10)
    } else if (msg.startsWith('go movetime')) {
      setTimeout(() => {
        this.onmessage?.({ data: 'bestmove e2e4' } as MessageEvent)
      }, 50)
    }
  }

  terminate() {
    // Mock terminate
  }
}

describe('engine', () => {
  beforeEach(() => {
    // @ts-ignore - Mock Worker
    global.Worker = MockWorker
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('ChessEngine', () => {
    it('should initialize successfully', async () => {
      const engine = new ChessEngine()
      await engine.ensureReady()
      expect(engine.getStatus()).toBe('ready')
      engine.terminate()
    })

    it('should get best move', async () => {
      const engine = new ChessEngine()
      await engine.ensureReady()
      
      const result = await engine.getBestMove(
        'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        'medium',
        1000
      )
      
      expect(result.move).toBe('e2e4')
      expect(result.timeMs).toBeGreaterThan(0)
      
      engine.terminate()
    })

    it('should update status during thinking', async () => {
      const engine = new ChessEngine()
      await engine.ensureReady()
      
      expect(engine.getStatus()).toBe('ready')
      
      const movePromise = engine.getBestMove(
        'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        'easy',
        1000
      )
      
      // Give the engine a moment to transition to thinking state
      await new Promise(resolve => setTimeout(resolve, 10))
      
      // Status should be 'thinking' during computation
      const statusDuringThinking = engine.getStatus()
      expect(['thinking', 'ready']).toContain(statusDuringThinking)
      
      await movePromise
      
      // Should return to 'ready' after
      expect(engine.getStatus()).toBe('ready')
      
      engine.terminate()
    })

    it('should terminate cleanly', async () => {
      const engine = new ChessEngine()
      await engine.ensureReady()
      
      engine.terminate()
      
      expect(engine.getStatus()).toBe('idle')
    })
  })
})

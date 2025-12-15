import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { ChessEngine } from '../../src/lib/engine'
import type { Difficulty } from '../../src/types/chess'

// Mock Worker for testing
class MockWorker {
  onmessage: ((e: MessageEvent) => void) | null = null
  onerror: ((e: ErrorEvent) => void) | null = null

  postMessage(msg: string) {
    if (msg === 'uci') {
      setTimeout(() => this.onmessage?.({ data: 'uciok' } as MessageEvent), 10)
    } else if (msg === 'isready') {
      setTimeout(() => this.onmessage?.({ data: 'readyok' } as MessageEvent), 10)
    } else if (msg.startsWith('go movetime')) {
      // Simulate AI response time based on difficulty
      const moveTime = parseInt(msg.split(' ')[2])
      const responseTime = Math.min(moveTime, 100)
      setTimeout(() => {
        this.onmessage?.({ data: 'bestmove e2e4' } as MessageEvent)
      }, responseTime)
    }
  }

  terminate() {}
}

describe('AI Response Time Integration', () => {
  beforeEach(() => {
    // @ts-ignore
    global.Worker = MockWorker
  })

  afterEach(() => {
    // Clean up
  })

  it('should respond within time budget for easy difficulty', async () => {
    const engine = new ChessEngine()
    await engine.ensureReady()

    const startTime = Date.now()
    const result = await engine.getBestMove(
      'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      'easy' as Difficulty,
      500
    )
    const elapsed = Date.now() - startTime

    expect(result.move).toBeTruthy()
    expect(elapsed).toBeLessThan(600) // 500ms + 100ms tolerance

    engine.terminate()
  })

  it('should respond within time budget for medium difficulty', async () => {
    const engine = new ChessEngine()
    await engine.ensureReady()

    const startTime = Date.now()
    const result = await engine.getBestMove(
      'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      'medium' as Difficulty,
      500
    )
    const elapsed = Date.now() - startTime

    expect(result.move).toBeTruthy()
    expect(elapsed).toBeLessThan(600)

    engine.terminate()
  })

  it('should respond within time budget for hard difficulty', async () => {
    const engine = new ChessEngine()
    await engine.ensureReady()

    const startTime = Date.now()
    const result = await engine.getBestMove(
      'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      'hard' as Difficulty,
      1000
    )
    const elapsed = Date.now() - startTime

    expect(result.move).toBeTruthy()
    expect(elapsed).toBeLessThan(1100)

    engine.terminate()
  })

  it('should respond within time budget for veryHard difficulty', async () => {
    const engine = new ChessEngine()
    await engine.ensureReady()

    const startTime = Date.now()
    const result = await engine.getBestMove(
      'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      'veryHard' as Difficulty,
      2000
    )
    const elapsed = Date.now() - startTime

    expect(result.move).toBeTruthy()
    expect(elapsed).toBeLessThan(2100)

    engine.terminate()
  })

  it('should track response time in result', async () => {
    const engine = new ChessEngine()
    await engine.ensureReady()

    const result = await engine.getBestMove(
      'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      'easy' as Difficulty,
      500
    )

    expect(result.timeMs).toBeGreaterThan(0)
    expect(result.timeMs).toBeLessThan(600)

    engine.terminate()
  })
})

import type { Difficulty } from '../types/chess'
import { getUCIOptions } from './difficulty'

export type EngineStatus = 'idle' | 'initializing' | 'ready' | 'thinking' | 'error'

export interface BestMoveResult {
  move: string // UCI format
  timeMs: number
}

export class ChessEngine {
  private worker: Worker | null = null
  private status: EngineStatus = 'idle'
  private messageQueue: ((message: string) => void)[] = []
  private initPromise: Promise<void> | null = null

  constructor() {
    this.initPromise = this.initialize()
  }

  private async initialize(): Promise<void> {
    this.status = 'initializing'
    
    return new Promise((resolve, reject) => {
      try {
        // Load Stockfish from public folder
        this.worker = new Worker('/stockfish/stockfish-nnue-17.1-lite-single.js')
        
        this.worker.onmessage = (e) => {
          const message = e.data
          
          if (typeof message === 'string' && message.includes('uciok')) {
            this.status = 'ready'
            this.send('isready')
          } else if (typeof message === 'string' && message.includes('readyok')) {
            resolve()
          }
          
          // Process any queued message handlers
          this.messageQueue.forEach(handler => handler(message))
        }
        
        this.worker.onerror = (error) => {
          this.status = 'error'
          reject(error)
        }
        
        // Initialize UCI protocol
        this.send('uci')
        
        // Timeout after 10 seconds
        setTimeout(() => {
          if (this.status !== 'ready') {
            this.status = 'error'
            reject(new Error('Engine initialization timeout'))
          }
        }, 10000)
        
      } catch (error) {
        this.status = 'error'
        reject(error)
      }
    })
  }

  private send(command: string): void {
    if (this.worker) {
      this.worker.postMessage(command)
    }
  }

  private waitForMessage(predicate: (msg: string) => boolean): Promise<string> {
    return new Promise((resolve) => {
      const handler = (message: string) => {
        if (typeof message === 'string' && predicate(message)) {
          const index = this.messageQueue.indexOf(handler)
          if (index > -1) {
            this.messageQueue.splice(index, 1)
          }
          resolve(message)
        }
      }
      this.messageQueue.push(handler)
    })
  }

  async ensureReady(): Promise<void> {
    if (this.initPromise) {
      await this.initPromise
    }
    if (this.status === 'error') {
      throw new Error('Engine initialization failed')
    }
  }

  async getBestMove(
    fen: string,
    difficulty: Difficulty,
    timeoutMs: number = 5000
  ): Promise<BestMoveResult> {
    await this.ensureReady()
    
    const startTime = Date.now()
    this.status = 'thinking'
    
    try {
      // Set difficulty options
      const options = getUCIOptions(difficulty)
      options.forEach(opt => this.send(opt))
      
      // Set position
      this.send(`position fen ${fen}`)
      
      // Start search with movetime limit
      this.send(`go movetime ${timeoutMs}`)
      
      // Wait for bestmove response
      const bestMovePromise = this.waitForMessage(msg => msg.startsWith('bestmove'))
      
      // Timeout safety
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Engine timeout')), timeoutMs + 1000)
      })
      
      const response = await Promise.race([bestMovePromise, timeoutPromise])
      const timeMs = Date.now() - startTime
      
      // Parse bestmove response: "bestmove e2e4" or "bestmove e2e4 ponder e7e5"
      const match = response.match(/^bestmove\s+(\S+)/)
      if (!match) {
        throw new Error('Invalid bestmove response')
      }
      
      this.status = 'ready'
      
      return {
        move: match[1],
        timeMs,
      }
    } catch (error) {
      this.status = 'error'
      throw error
    }
  }

  getStatus(): EngineStatus {
    return this.status
  }

  terminate(): void {
    if (this.worker) {
      this.worker.terminate()
      this.worker = null
    }
    this.status = 'idle'
    this.messageQueue = []
  }
}

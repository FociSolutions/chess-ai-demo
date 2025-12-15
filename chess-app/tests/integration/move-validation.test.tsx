import { describe, it, expect } from 'vitest'
import { Chess } from 'chess.js'

describe('Move Validation Integration', () => {
  it('should reject illegal moves', () => {
    const chess = new Chess()
    
    // Try an illegal move (pawn can't move 3 squares)
    // chess.js throws an error for invalid moves, so we need to catch it
    expect(() => chess.move({ from: 'e2', to: 'e5' })).toThrow()
  })

  it('should accept legal pawn moves', () => {
    const chess = new Chess()
    
    // Legal pawn move
    const result = chess.move({ from: 'e2', to: 'e4' })
    expect(result).not.toBeNull()
    expect(result?.san).toBe('e4')
  })

  it('should handle castling correctly', () => {
    const chess = new Chess(
      'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4'
    )
    
    // Kingside castling for white
    const result = chess.move({ from: 'e1', to: 'g1' })
    expect(result).not.toBeNull()
    expect(result?.san).toBe('O-O')
  })

  it('should handle en passant', () => {
    const chess = new Chess()
    
    // Setup en passant scenario
    chess.move({ from: 'e2', to: 'e4' })
    chess.move({ from: 'd7', to: 'd6' })
    chess.move({ from: 'e4', to: 'e5' })
    chess.move({ from: 'f7', to: 'f5' })
    
    // En passant capture
    const result = chess.move({ from: 'e5', to: 'f6' })
    expect(result).not.toBeNull()
    expect(result?.flags).toContain('e')
  })

  it('should require promotion for pawn reaching 8th rank', () => {
    const chess = new Chess('4k3/P7/8/8/8/8/8/4K3 w - - 0 1')
    
    // Move without promotion should throw
    expect(() => chess.move({ from: 'a7', to: 'a8' })).toThrow()
    
    // Reset
    chess.load('4k3/P7/8/8/8/8/8/4K3 w - - 0 1')
    
    // Move with promotion should succeed
    const withPromotion = chess.move({ from: 'a7', to: 'a8', promotion: 'q' })
    expect(withPromotion).not.toBeNull()
    expect(withPromotion?.promotion).toBe('q')
  })

  it('should detect check', () => {
    const chess = new Chess()
    
    chess.load('4k3/8/8/8/8/8/4R3/4K3 b - - 0 1')
    
    expect(chess.isCheck()).toBe(true)
  })

  it('should detect checkmate', () => {
    const chess = new Chess()
    
    // Fool's mate setup
    chess.load('rnb1kbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 1 3')
    
    expect(chess.isCheckmate()).toBe(true)
  })

  it('should detect stalemate', () => {
    const chess = new Chess()
    
    // Correct stalemate position: black king in corner with queen blocking all moves
    chess.load('k7/2Q5/1K6/8/8/8/8/8 b - - 0 1')
    
    expect(chess.isStalemate()).toBe(true)
  })

  it('should detect draw by insufficient material', () => {
    const chess = new Chess()
    
    // King vs King
    chess.load('4k3/8/8/8/8/8/8/4K3 w - - 0 1')
    
    expect(chess.isInsufficientMaterial()).toBe(true)
  })
})

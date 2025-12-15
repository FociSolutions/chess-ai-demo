import { describe, it, expect } from 'vitest'
import { parseUCI, toUCI, isValidUCI } from '../../src/lib/notation'
import type { Square } from 'chess.js'

describe('notation', () => {
  describe('parseUCI', () => {
    it('should parse simple move', () => {
      const result = parseUCI('e2e4')
      expect(result.from).toBe('e2')
      expect(result.to).toBe('e4')
      expect(result.promotion).toBeUndefined()
    })

    it('should parse move with promotion', () => {
      const result = parseUCI('e7e8q')
      expect(result.from).toBe('e7')
      expect(result.to).toBe('e8')
      expect(result.promotion).toBe('q')
    })

    it('should parse different promotion pieces', () => {
      expect(parseUCI('a7a8r').promotion).toBe('r')
      expect(parseUCI('b7b8b').promotion).toBe('b')
      expect(parseUCI('c7c8n').promotion).toBe('n')
    })
  })

  describe('toUCI', () => {
    it('should convert squares to UCI notation', () => {
      expect(toUCI('e2' as Square, 'e4' as Square)).toBe('e2e4')
      expect(toUCI('g1' as Square, 'f3' as Square)).toBe('g1f3')
    })

    it('should include promotion', () => {
      expect(toUCI('e7' as Square, 'e8' as Square, 'q')).toBe('e7e8q')
      expect(toUCI('a7' as Square, 'a8' as Square, 'r')).toBe('a7a8r')
    })
  })

  describe('isValidUCI', () => {
    it('should validate correct UCI notation', () => {
      expect(isValidUCI('e2e4')).toBe(true)
      expect(isValidUCI('a1h8')).toBe(true)
      expect(isValidUCI('e7e8q')).toBe(true)
      expect(isValidUCI('b7b8n')).toBe(true)
    })

    it('should reject invalid UCI notation', () => {
      expect(isValidUCI('e2e9')).toBe(false)
      expect(isValidUCI('i2e4')).toBe(false)
      expect(isValidUCI('e2')).toBe(false)
      expect(isValidUCI('e2e4k')).toBe(false)
      expect(isValidUCI('e2e4qq')).toBe(false)
    })
  })
})

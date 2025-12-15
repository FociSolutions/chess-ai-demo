import { describe, it, expect } from 'vitest'
import { getDifficultyConfig, getUCIOptions } from '../../src/lib/difficulty'
import type { Difficulty } from '../../src/types/chess'

describe('difficulty', () => {
  describe('getDifficultyConfig', () => {
    it('should return correct config for easy difficulty', () => {
      const config = getDifficultyConfig('easy')
      expect(config.difficulty).toBe('easy')
      expect(config.skillLevel).toBe(1)
      expect(config.depth).toBe(1)
      expect(config.elo).toBeUndefined()
    })

    it('should return correct config for medium difficulty', () => {
      const config = getDifficultyConfig('medium')
      expect(config.difficulty).toBe('medium')
      expect(config.skillLevel).toBe(5)
      expect(config.depth).toBe(5)
      expect(config.elo).toBeUndefined()
    })

    it('should return correct config for hard difficulty', () => {
      const config = getDifficultyConfig('hard')
      expect(config.difficulty).toBe('hard')
      expect(config.skillLevel).toBe(10)
      expect(config.depth).toBe(10)
      expect(config.elo).toBeUndefined()
    })

    it('should return correct config for veryHard difficulty with ELO', () => {
      const config = getDifficultyConfig('veryHard')
      expect(config.difficulty).toBe('veryHard')
      expect(config.skillLevel).toBe(20)
      expect(config.depth).toBe(20)
      expect(config.elo).toBe(2000)
    })
  })

  describe('getUCIOptions', () => {
    it('should return skill level option for easy', () => {
      const options = getUCIOptions('easy')
      expect(options).toContain('setoption name Skill Level value 1')
      expect(options.some(opt => opt.includes('UCI_Elo'))).toBe(false)
    })

    it('should return skill level option for medium', () => {
      const options = getUCIOptions('medium')
      expect(options).toContain('setoption name Skill Level value 5')
      expect(options.some(opt => opt.includes('UCI_Elo'))).toBe(false)
    })

    it('should return skill level option for hard', () => {
      const options = getUCIOptions('hard')
      expect(options).toContain('setoption name Skill Level value 10')
      expect(options.some(opt => opt.includes('UCI_Elo'))).toBe(false)
    })

    it('should return ELO options for veryHard', () => {
      const options = getUCIOptions('veryHard')
      expect(options).toContain('setoption name Skill Level value 20')
      expect(options).toContain('setoption name UCI_LimitStrength value true')
      expect(options).toContain('setoption name UCI_Elo value 2000')
    })
  })
})

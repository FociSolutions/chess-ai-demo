import type { Difficulty, AIOpponent } from '../types/chess'

interface DifficultyConfig {
  skillLevel: number
  depth: number
  elo?: number
}

const difficultyMap: Record<Difficulty, DifficultyConfig> = {
  easy: {
    skillLevel: 1,
    depth: 1,
  },
  medium: {
    skillLevel: 5,
    depth: 5,
  },
  hard: {
    skillLevel: 10,
    depth: 10,
  },
  veryHard: {
    skillLevel: 20,
    depth: 20,
    elo: 2000,
  },
}

export function getDifficultyConfig(difficulty: Difficulty): AIOpponent {
  const config = difficultyMap[difficulty]
  return {
    difficulty,
    skillLevel: config.skillLevel,
    depth: config.depth,
    elo: config.elo,
    responseTimeMs: 0,
  }
}

export function getUCIOptions(difficulty: Difficulty): string[] {
  const config = getDifficultyConfig(difficulty)
  const options: string[] = [
    `setoption name Skill Level value ${config.skillLevel}`,
  ]
  
  if (config.elo !== undefined) {
    options.push(`setoption name UCI_LimitStrength value true`)
    options.push(`setoption name UCI_Elo value ${config.elo}`)
  }
  
  return options
}

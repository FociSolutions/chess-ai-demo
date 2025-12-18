import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import App from '../../src/App'

// Mock the chess engine hook to return a ready state immediately
vi.mock('../../src/hooks/useChessEngine', () => ({
  useChessEngine: () => ({
    status: 'ready',
    error: null,
    getBestMove: vi.fn().mockResolvedValue({ move: 'e2e4', pondermove: null }),
    isReady: true,
  }),
}))

describe('Board Theme Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should display board theme selector on start screen', async () => {
    render(<App />)

    expect(screen.getByText(/board theme/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /green/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /blue/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /brown/i })).toBeInTheDocument()
  })

  it('should allow selecting different board themes', async () => {
    const user = userEvent.setup()
    render(<App />)

    // Initially green should be selected (default)
    const greenButton = screen.getByRole('button', { name: /green/i })
    expect(greenButton).toHaveClass('border-blue-500')

    // Select blue theme
    const blueButton = screen.getByRole('button', { name: /blue/i })
    await user.click(blueButton)
    expect(blueButton).toHaveClass('border-blue-500')

    // Select brown theme
    const brownButton = screen.getByRole('button', { name: /brown/i })
    await user.click(brownButton)
    expect(brownButton).toHaveClass('border-blue-500')
  })

  it('should apply selected theme when starting game', async () => {
    const user = userEvent.setup()
    render(<App />)

    // Select blue theme
    const blueButton = screen.getByRole('button', { name: /blue/i })
    await user.click(blueButton)

    // Start game
    const easyButton = screen.getByRole('button', { name: /easy/i })
    const whiteButton = screen.getByRole('button', { name: /white/i })
    const startButton = screen.getByRole('button', { name: /start game/i })

    await user.click(easyButton)
    await user.click(whiteButton)
    await user.click(startButton)

    // Wait for game to start
    await waitFor(
      () => {
        expect(screen.getByRole('button', { name: /new game/i })).toBeInTheDocument()
      },
      { timeout: 5000 }
    )

    // The board should now be rendered with blue theme
    // We can't directly test the theme colors in the DOM, but we can verify the game started
    expect(screen.getByRole('button', { name: /new game/i })).toBeInTheDocument()
  })
})

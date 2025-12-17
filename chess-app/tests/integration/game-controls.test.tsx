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

describe('Game Controls Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should display game controls after game starts', async () => {
    const user = userEvent.setup()
    render(<App />)

    // Engine is mocked to be ready immediately
    const startButton = screen.getByRole('button', { name: /start game/i })
    expect(startButton).not.toBeDisabled()

    // Start a game with Easy difficulty
    const easyButton = screen.getByRole('button', { name: /easy/i })
    const whiteButton = screen.getByRole('button', { name: /white/i })

    await user.click(easyButton)
    await user.click(whiteButton)
    await user.click(startButton)

    // Wait for controls
    await waitFor(
      () => {
        expect(screen.getByRole('button', { name: /new game/i })).toBeInTheDocument()
      },
      { timeout: 5000 }
    )

    // Verify all controls are present
    expect(screen.getByRole('button', { name: /new game/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /undo/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /resign/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /flip board/i })).toBeInTheDocument()
  })

  it('should have undo button disabled when no moves yet', async () => {
    const user = userEvent.setup()
    render(<App />)

    const startButton = screen.getByRole('button', { name: /start game/i })
    const easyButton = screen.getByRole('button', { name: /easy/i })
    const whiteButton = screen.getByRole('button', { name: /white/i })

    await user.click(easyButton)
    await user.click(whiteButton)
    await user.click(startButton)

    await waitFor(
      () => {
        const undoButton = screen.getByRole('button', { name: /undo/i })
        expect(undoButton).toBeDisabled()
      },
      { timeout: 5000 }
    )
  })

  it('should allow resignation', async () => {
    const user = userEvent.setup()
    render(<App />)

    const startButton = screen.getByRole('button', { name: /start game/i })
    const easyButton = screen.getByRole('button', { name: /easy/i })
    const whiteButton = screen.getByRole('button', { name: /white/i })

    await user.click(easyButton)
    await user.click(whiteButton)
    await user.click(startButton)

    await waitFor(
      () => {
        expect(screen.getByRole('button', { name: /resign/i })).toBeInTheDocument()
      },
      { timeout: 5000 }
    )

    const resignButton = screen.getByRole('button', { name: /resign/i })
    await user.click(resignButton)

    await waitFor(
      () => {
        expect(screen.getByText(/you resigned/i)).toBeInTheDocument()
      },
      { timeout: 5000 }
    )
  })

  it('should display move history', async () => {
    const user = userEvent.setup()
    render(<App />)

    const startButton = screen.getByRole('button', { name: /start game/i })
    const easyButton = screen.getByRole('button', { name: /easy/i })
    const whiteButton = screen.getByRole('button', { name: /white/i })

    await user.click(easyButton)
    await user.click(whiteButton)
    await user.click(startButton)

    await waitFor(
      () => {
        // Look for either "Moves" heading or "Game hasn't started" text
        const moveHistory = screen.queryByText('Moves')
        const noMoves = screen.queryByText("Game hasn't started")
        expect(moveHistory || noMoves).toBeTruthy()
      },
      { timeout: 10000 }
    )
  }, 20000)

  it('should return to start screen after new game', async () => {
    const user = userEvent.setup()
    render(<App />)

    const startButton = screen.getByRole('button', { name: /start game/i })
    const easyButton = screen.getByRole('button', { name: /easy/i })
    const whiteButton = screen.getByRole('button', { name: /white/i })

    await user.click(easyButton)
    await user.click(whiteButton)
    await user.click(startButton)

    await waitFor(
      () => {
        expect(screen.getByRole('button', { name: /new game/i })).toBeInTheDocument()
      },
      { timeout: 5000 }
    )

    const newGameButton = screen.getByRole('button', { name: /new game/i })
    await user.click(newGameButton)

    await waitFor(
      () => {
        expect(screen.getByRole('button', { name: /easy/i })).toBeInTheDocument()
      },
      { timeout: 5000 }
    )
  })
})

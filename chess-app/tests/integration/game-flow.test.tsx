import { describe, it, expect, beforeEach, vi } from 'vitest'
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

describe('Game Flow Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should display the start screen and allow starting a game', async () => {
    const user = userEvent.setup()
    render(<App />)

    // Engine should be ready immediately due to mock
    expect(screen.getByText('Ready to play!')).toBeInTheDocument()

    // Select difficulty (Medium should be selected by default)
    expect(screen.getByText('Medium')).toBeInTheDocument()

    // Start game button should be enabled
    const startButton = screen.getByRole('button', { name: /start game/i })
    expect(startButton).not.toBeDisabled()

    // Click start game
    await user.click(startButton)

    // Should transition to game view (no longer showing start screen)
    await waitFor(() => {
      expect(screen.queryByText('Ready to play!')).not.toBeInTheDocument()
    })
  })

  it('should display difficulty options correctly', () => {
    render(<App />)

    expect(screen.getByText('Ready to play!')).toBeInTheDocument()
    
    // All difficulty levels should be visible
    expect(screen.getByText('Easy')).toBeInTheDocument()
    expect(screen.getByText('Medium')).toBeInTheDocument()
    expect(screen.getByText('Hard')).toBeInTheDocument()
    expect(screen.getByText('Very Hard')).toBeInTheDocument()
    
    // Color selection should be visible
    expect(screen.getByText('White')).toBeInTheDocument()
    expect(screen.getByText('Black')).toBeInTheDocument()
  })
})




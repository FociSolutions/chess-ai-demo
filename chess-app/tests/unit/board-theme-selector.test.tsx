import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { BoardThemeSelector } from '../../src/components/BoardThemeSelector'

describe('BoardThemeSelector', () => {
  it('should render all theme options', () => {
    const onThemeChange = vi.fn()
    render(<BoardThemeSelector selectedTheme="green" onThemeChange={onThemeChange} />)

    expect(screen.getByRole('button', { name: /green/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /blue/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /brown/i })).toBeInTheDocument()
  })

  it('should highlight the selected theme', () => {
    const onThemeChange = vi.fn()
    render(<BoardThemeSelector selectedTheme="blue" onThemeChange={onThemeChange} />)

    const blueButton = screen.getByRole('button', { name: /blue/i })
    expect(blueButton).toHaveClass('border-blue-500')
  })

  it('should call onThemeChange when a theme is clicked', async () => {
    const user = userEvent.setup()
    const onThemeChange = vi.fn()
    render(<BoardThemeSelector selectedTheme="green" onThemeChange={onThemeChange} />)

    const brownButton = screen.getByRole('button', { name: /brown/i })
    await user.click(brownButton)

    expect(onThemeChange).toHaveBeenCalledWith('brown')
  })

  it('should display color swatches for each theme', () => {
    const onThemeChange = vi.fn()
    render(<BoardThemeSelector selectedTheme="green" onThemeChange={onThemeChange} />)

    // Each theme should have two color swatches (light and dark)
    expect(screen.getByLabelText(/green light square/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/green dark square/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/blue light square/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/blue dark square/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/brown light square/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/brown dark square/i)).toBeInTheDocument()
  })
})

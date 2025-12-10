import { render, screen } from '@testing-library/react'
import { SpaceHero } from '@/components/space/space-hero'
import { describe, it, expect } from 'vitest'

describe('SpaceHero', () => {
  it('renders the main heading', () => {
    render(<SpaceHero />)
    const heading = screen.getByRole('heading', { name: /космическая витрина наблюдений/i })
    expect(heading).toBeInTheDocument()
  })

  it('renders the dashboard label', () => {
    render(<SpaceHero />)
    expect(screen.getByText('Space Dashboard')).toBeInTheDocument()
  })
})

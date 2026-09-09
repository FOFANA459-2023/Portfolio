import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TechStack } from './TechStack'

describe('TechStack', () => {
  it('renders a list, because that is what a stack is', () => {
    render(<TechStack items={['React', 'TypeScript']} />)
    expect(screen.getByRole('list')).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
  })

  it('shows every entry when no limit is given', () => {
    const items = ['React', 'TypeScript', 'Vite', 'Node.js', 'PostgreSQL', 'Docker', 'Stripe']
    render(<TechStack items={items} />)
    for (const item of items) {
      expect(screen.getByText(item)).toBeInTheDocument()
    }
  })

  it('counts the remainder into one marker when a limit is given', () => {
    render(<TechStack items={['a', 'b', 'c', 'd', 'e']} limit={2} />)
    expect(screen.getAllByRole('listitem')).toHaveLength(3)
    expect(screen.getByText('+3 more')).toBeInTheDocument()
    expect(screen.queryByText('c')).not.toBeInTheDocument()
  })

  it('shows no overflow marker when the limit is not reached', () => {
    render(<TechStack items={['a', 'b']} limit={5} />)
    expect(screen.queryByText(/more/)).not.toBeInTheDocument()
  })

  it('keeps multi-word names unbroken, so "Django REST Framework" never splits', () => {
    render(<TechStack items={['Django REST Framework']} />)
    expect(screen.getByText('Django REST Framework')).toHaveClass('whitespace-nowrap')
  })

  it('renders nothing but an empty list for an empty stack', () => {
    render(<TechStack items={[]} />)
    expect(screen.queryAllByRole('listitem')).toHaveLength(0)
  })
})

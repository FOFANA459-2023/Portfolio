import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProjectIndex } from './ProjectIndex'
import { projects } from '@/data/projects'

vi.mock('@/lib/scroll', () => ({ scrollToSection: vi.fn() }))
const { scrollToSection } = await import('@/lib/scroll')

describe('ProjectIndex', () => {
  it('names every project on one screen, before any of them is presented', () => {
    render(<ProjectIndex projects={projects} />)
    for (const project of projects) {
      expect(screen.getByText(project.title)).toBeInTheDocument()
    }
  })

  it('is a navigation landmark, so it can be jumped to rather than read past', () => {
    render(<ProjectIndex projects={projects} />)
    expect(screen.getByRole('navigation', { name: /projects at a glance/i })).toBeInTheDocument()
  })

  it('jumps to the project a row names', async () => {
    render(<ProjectIndex projects={projects} />)
    const rows = screen.getAllByRole('button')
    await userEvent.click(rows[1])
    expect(scrollToSection).toHaveBeenCalledWith(`project-${projects[1].id}`)
  })

  it('keeps the status readable when the label is hidden on small screens', () => {
    render(<ProjectIndex projects={projects} />)
    // The visible word is hidden below `sm`, so the same word is repeated for
    // assistive technology. Both copies present means neither width loses it.
    expect(screen.getAllByText('Live').length).toBeGreaterThanOrEqual(projects.length)
  })

  it('shows the first few stack entries so the row is scannable', () => {
    render(<ProjectIndex projects={projects} />)
    const first = projects[0]
    // Asserted on the row's text rather than by query, because the cell mixes
    // the category, a separator span and the stack into one line, and a name
    // like "React" appears in more than one project.
    const rows = screen.getAllByRole('listitem')
    expect(rows[0].textContent).toContain(first.stack.slice(0, 3).join(', '))
  })
})

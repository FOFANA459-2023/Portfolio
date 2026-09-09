import { describe, it, expect } from 'vitest'
import { cn } from './cn'

describe('cn', () => {
  it('joins the truthy parts with single spaces', () => {
    expect(cn('a', 'b', 'c')).toBe('a b c')
  })

  it('drops every falsy value a conditional class can produce', () => {
    expect(cn('a', false, null, undefined, '', 'b')).toBe('a b')
  })

  it('returns an empty string rather than undefined when nothing survives', () => {
    expect(cn(false, null, undefined)).toBe('')
  })

  it('does not resolve conflicts, which is why size lives outside variant maps', () => {
    // Documented behaviour, not an oversight: `cn` is a joiner, so two
    // competing utilities are settled by stylesheet order rather than by the
    // call site. Anything that needs a real override has to be structured so
    // the conflict never reaches here.
    expect(cn('px-4', 'px-6')).toBe('px-4 px-6')
  })
})

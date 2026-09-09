import { describe, it, expect } from 'vitest'
import { validateField, validateAll, limits } from './validate'

describe('validateField', () => {
  it('accepts an ordinary name, address and message', () => {
    expect(validateField('name', 'Mei Tanaka')).toBeUndefined()
    expect(validateField('email', 'mei.tanaka@example.com')).toBeUndefined()
    expect(validateField('message', 'I would like to talk about a role.')).toBeUndefined()
  })

  it('trims before measuring, so whitespace is not a message', () => {
    expect(validateField('message', '          ')).toBe('Please write a message.')
    expect(validateField('name', '   ')).toBe('Please enter your name.')
  })

  it('rejects addresses that are missing a part', () => {
    for (const bad of ['mei', 'mei@', '@example.com', 'mei@example', 'mei @example.com']) {
      expect(validateField('email', bad)).toBeDefined()
    }
  })

  it('accepts the awkward addresses that real people have', () => {
    for (const good of [
      'mei+jobs@example.co.uk',
      "o'brien@example.com",
      'first.last@sub.domain.example',
      'x@y.io',
    ]) {
      expect(validateField('email', good)).toBeUndefined()
    }
  })

  it('enforces both ends of every length limit', () => {
    expect(validateField('name', 'A')).toBe('That looks a little short.')
    expect(validateField('name', 'A'.repeat(limits.name.max + 1))).toContain(
      String(limits.name.max),
    )
    expect(validateField('message', 'too short')).toBe('A little more detail would help.')
    expect(validateField('message', 'x'.repeat(limits.message.max + 1))).toContain(
      String(limits.message.max),
    )
  })

  it('rejects an address that is well formed but absurdly long', () => {
    const long = `${'a'.repeat(limits.email.max)}@example.com`
    expect(validateField('email', long)).toBe('That email address is too long.')
  })

  it('treats the boundary itself as valid', () => {
    expect(validateField('name', 'A'.repeat(limits.name.max))).toBeUndefined()
    expect(validateField('message', 'x'.repeat(limits.message.max))).toBeUndefined()
    expect(validateField('name', 'A'.repeat(limits.name.min))).toBeUndefined()
  })
})

describe('validateAll', () => {
  it('returns nothing when every field is good', () => {
    expect(
      validateAll({
        name: 'Mei Tanaka',
        email: 'mei@example.com',
        message: 'A message that is comfortably long enough.',
      }),
    ).toEqual({})
  })

  it('reports every bad field at once rather than stopping at the first', () => {
    const errors = validateAll({ name: '', email: 'nope', message: '' })
    expect(Object.keys(errors).sort()).toEqual(['email', 'message', 'name'])
  })
})

export type Field = 'name' | 'email' | 'message'
export type Errors = Partial<Record<Field, string>>

/* Deliberately permissive. The job of client-side email validation is to catch
 * typos before a round trip, not to adjudicate RFC 5322 — anything stricter
 * starts rejecting addresses that genuinely work. */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export const limits = {
  name: { min: 2, max: 80 },
  email: { max: 160 },
  message: { min: 10, max: 2000 },
} as const

export function validateField(field: Field, value: string): string | undefined {
  const v = value.trim()

  switch (field) {
    case 'name':
      if (!v) return 'Please enter your name.'
      if (v.length < limits.name.min) return 'That looks a little short.'
      if (v.length > limits.name.max) return `Please keep this under ${limits.name.max} characters.`
      return undefined

    case 'email':
      if (!v) return 'Please enter your email so I can reply.'
      if (!EMAIL.test(v)) return 'That does not look like a valid email address.'
      if (v.length > limits.email.max) return 'That email address is too long.'
      return undefined

    case 'message':
      if (!v) return 'Please write a message.'
      if (v.length < limits.message.min) return 'A little more detail would help.'
      if (v.length > limits.message.max)
        return `Please keep this under ${limits.message.max} characters.`
      return undefined
  }
}

export function validateAll(values: Record<Field, string>): Errors {
  const errors: Errors = {}
  for (const field of ['name', 'email', 'message'] as const) {
    const error = validateField(field, values[field])
    if (error) errors[field] = error
  }
  return errors
}

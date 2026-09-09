import { describe, it, expect } from 'vitest'
import { securityHeaders } from './index.js'

/** Pull one directive out of the policy, as the browser would read it. */
function directive(headers, name) {
  return headers['Content-Security-Policy']
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name} `))
}

describe('the contact origin', () => {
  it('is allowed to be reached, or the form fails silently in the browser', () => {
    const headers = securityHeaders('https://api.web3forms.com')
    expect(directive(headers, 'connect-src')).toBe(
      "connect-src 'self' https://api.web3forms.com",
    )
  })

  it('falls back to same-origin only when none is configured', () => {
    expect(directive(securityHeaders(undefined), 'connect-src')).toBe("connect-src 'self'")
    expect(directive(securityHeaders(''), 'connect-src')).toBe("connect-src 'self'")
  })
})

describe('the policy', () => {
  it('allows the fonts the page actually loads', () => {
    const headers = securityHeaders('')
    expect(directive(headers, 'style-src')).toContain('https://fonts.googleapis.com')
    expect(directive(headers, 'font-src')).toContain('https://fonts.gstatic.com')
  })

  it('allows no inline or evaluated script', () => {
    const scriptSrc = directive(securityHeaders(''), 'script-src')
    expect(scriptSrc).toBe("script-src 'self'")
    expect(scriptSrc).not.toContain('unsafe-inline')
    expect(scriptSrc).not.toContain('unsafe-eval')
  })

  it('refuses to be framed, and says so twice for older browsers', () => {
    const headers = securityHeaders('')
    expect(directive(headers, 'frame-ancestors')).toBe("frame-ancestors 'none'")
    expect(headers['X-Frame-Options']).toBe('DENY')
  })

  it('sets the headers a scanner looks for', () => {
    const headers = securityHeaders('')
    for (const name of [
      'Strict-Transport-Security',
      'X-Content-Type-Options',
      'Referrer-Policy',
      'Permissions-Policy',
      'Cross-Origin-Opener-Policy',
    ]) {
      expect(headers[name], name).toBeTruthy()
    }
  })
})

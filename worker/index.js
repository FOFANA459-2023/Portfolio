/**
 * The Cloudflare Worker that serves the built site.
 *
 * The static assets could be served with no Worker at all, by pointing
 * `wrangler.jsonc` at `dist/` and nothing else. This exists for one reason:
 * response headers. A pure assets deployment sends Cloudflare's defaults, and
 * the defaults do not include a content security policy, a referrer policy, or
 * anything that tells a browser to stop guessing at content types.
 *
 * Everything the page needs is either bundled and same-origin or comes from
 * Google Fonts, which is why the policy can be as tight as it is. The one
 * variable is the contact endpoint, because that lives on another host and the
 * form has to be allowed to reach it.
 */

/** @param {string | undefined} contactOrigin */
function securityHeaders(contactOrigin) {
  const connect = ["'self'", contactOrigin].filter(Boolean).join(' ')

  return {
    'Content-Security-Policy': [
      "default-src 'self'",
      // Everything executable is bundled and served from this origin. No
      // 'unsafe-inline' and no 'unsafe-eval': if a script has to be inlined
      // later it gets a nonce, not a blanket exemption.
      "script-src 'self'",
      // Inline styles are unavoidable here: the animation library writes to
      // the style attribute on every frame, and stripping that would mean
      // giving up the transitions rather than tightening anything real.
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      'font-src https://fonts.gstatic.com',
      "img-src 'self' data:",
      `connect-src ${connect}`,
      // Nothing on this site frames anything, is framed, or submits a form
      // anywhere but the contact endpoint above.
      "frame-ancestors 'none'",
      "form-action 'none'",
      "base-uri 'none'",
      "object-src 'none'",
      'upgrade-insecure-requests',
    ].join('; '),
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Resource-Policy': 'same-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  }
}

export default {
  /**
   * @param {Request} request
   * @param {{ ASSETS: { fetch: (request: Request) => Promise<Response> }, CONTACT_ORIGIN?: string }} env
   */
  async fetch(request, env) {
    const response = await env.ASSETS.fetch(request)

    // Rebuilt rather than mutated: the response from the assets binding is
    // immutable, so setting a header on it throws.
    const headers = new Headers(response.headers)
    for (const [name, value] of Object.entries(securityHeaders(env.CONTACT_ORIGIN))) {
      headers.set(name, value)
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    })
  },
}

import { site } from '@/data/site'

/**
 * Where a contact-form submission goes.
 *
 * Two delivery routes, and which one is live is decided by which environment
 * variable is set at build time.
 *
 *   VITE_CONTACT_ENDPOINT  ->  the mailer in `server/`, which sends the message
 *                              from Varlee's own Gmail using the template in
 *                              `server/email.mjs`. Needs a Node process to be
 *                              running somewhere, because Gmail delivery is
 *                              SMTP over a raw socket.
 *   VITE_WEB3FORMS_KEY     ->  Web3Forms. No server, nothing to maintain, and
 *                              their default template rather than ours.
 *
 * The endpoint wins where both are set. Neither of these is a secret: an
 * endpoint URL is public by definition and a Web3Forms access key is a public
 * identifier by design. The Gmail app password is *not* here and must never be
 * — Vite inlines every `VITE_*` value into the bundle it ships, so anything in
 * this file is readable by anyone who opens the page source.
 */

const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit'

export const contactEndpoint = import.meta.env.VITE_CONTACT_ENDPOINT as string | undefined
export const accessKey = import.meta.env.VITE_WEB3FORMS_KEY as string | undefined

const hasEndpoint = Boolean(contactEndpoint && contactEndpoint.trim().length > 0)
const hasAccessKey = Boolean(accessKey && accessKey.trim().length > 0)

export const isContactConfigured = hasEndpoint || hasAccessKey

/**
 * Whether to show the "set this variable" notice under the form.
 *
 * Development only, and not merely because it is untidy in production. It
 * names the site's own environment variables, which is the sort of thing a
 * visitor should never be shown, and it makes a working page look broken to
 * the one reader it most needs to impress. In production an unconfigured form
 * is not annotated, it is replaced.
 */
export const showSetupNotice = import.meta.env.DEV && !isContactConfigured

export interface ContactPayload {
  name: string
  email: string
  message: string
  /** Honeypot. Real people never see this field, so anything in it is a bot. */
  botcheck: string
}

function requestBody(payload: ContactPayload): { url: string; body: unknown } {
  if (hasEndpoint) {
    return {
      url: contactEndpoint!.trim(),
      body: {
        name: payload.name,
        email: payload.email,
        message: payload.message,
        botcheck: payload.botcheck,
      },
    }
  }

  return {
    url: WEB3FORMS_ENDPOINT,
    body: {
      access_key: accessKey,
      subject: `Portfolio enquiry from ${payload.name}`,
      from_name: `${site.name} via portfolio`,
      // Puts the sender's address on Reply-To, so replying from Gmail works.
      replyto: payload.email,
      name: payload.name,
      email: payload.email,
      message: payload.message,
      botcheck: false,
    },
  }
}

export async function sendContactMessage(payload: ContactPayload): Promise<void> {
  if (payload.botcheck) {
    // Silently accept and drop — telling a bot it failed just teaches it.
    return
  }
  if (!isContactConfigured) {
    // Unreachable from the UI, which shows an address instead of a form when
    // it cannot deliver. Worded for a visitor anyway, because an error message
    // is the wrong place to find out that a build was misconfigured.
    throw new Error(
      import.meta.env.DEV
        ? 'The contact form is not configured. Set VITE_CONTACT_ENDPOINT or VITE_WEB3FORMS_KEY and rebuild.'
        : 'This form is not available right now. Please use the email address above.',
    )
  }

  const { url, body } = requestBody(payload)

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15000)

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      signal: controller.signal,
      body: JSON.stringify(body),
    })

    const result = (await response.json().catch(() => null)) as { message?: string } | null

    if (!response.ok) {
      throw new Error(result?.message ?? `Delivery failed (${response.status}).`)
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('That took too long. Check your connection and try again.')
    }
    throw error
  } finally {
    clearTimeout(timeout)
  }
}

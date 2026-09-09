import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

/**
 * The delivery route is chosen at module scope from build-time environment, so
 * every test here has to stub the environment and then re-import the module.
 * `resetModules` is what makes the second import re-evaluate rather than hand
 * back the first one out of the cache.
 */
async function loadContact(env: Record<string, string>) {
  vi.resetModules()
  vi.stubEnv('VITE_CONTACT_ENDPOINT', env.VITE_CONTACT_ENDPOINT ?? '')
  vi.stubEnv('VITE_WEB3FORMS_KEY', env.VITE_WEB3FORMS_KEY ?? '')
  return import('./contact')
}

const payload = {
  name: 'Mei Tanaka',
  email: 'mei@example.com',
  message: 'Hello.',
  botcheck: '',
}

let fetchMock: ReturnType<typeof vi.fn>

beforeEach(() => {
  fetchMock = vi.fn(async () => new Response(JSON.stringify({ message: 'Sent.' }), { status: 200 }))
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

describe('delivery route', () => {
  it('is unconfigured when neither variable is set, and says so instead of failing silently', async () => {
    const { isContactConfigured, sendContactMessage } = await loadContact({})
    expect(isContactConfigured).toBe(false)
    await expect(sendContactMessage(payload)).rejects.toThrow(/not configured/i)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('offers the setup notice only while unconfigured, and never once configured', async () => {
    // Vitest runs in development mode, so the DEV half of the gate is true
    // here and this asserts the half that varies. The production half is a
    // build-time constant that Vite strips from the bundle entirely.
    const unconfigured = await loadContact({})
    expect(unconfigured.showSetupNotice).toBe(true)

    const configured = await loadContact({ VITE_WEB3FORMS_KEY: 'test-key' })
    expect(configured.showSetupNotice).toBe(false)
  })

  it('posts to the mailer when an endpoint is set', async () => {
    const { sendContactMessage } = await loadContact({
      VITE_CONTACT_ENDPOINT: 'https://mail.example.com/api/contact',
    })
    await sendContactMessage(payload)

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('https://mail.example.com/api/contact')
    expect(JSON.parse(String(init.body))).toMatchObject({ name: 'Mei Tanaka' })
  })

  it('falls back to Web3Forms when only a key is set', async () => {
    const { sendContactMessage } = await loadContact({ VITE_WEB3FORMS_KEY: 'test-key' })
    await sendContactMessage(payload)

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toContain('web3forms.com')
    expect(JSON.parse(String(init.body))).toMatchObject({ access_key: 'test-key' })
  })

  it('prefers the endpoint when both are set', async () => {
    const { sendContactMessage } = await loadContact({
      VITE_CONTACT_ENDPOINT: 'https://mail.example.com/api/contact',
      VITE_WEB3FORMS_KEY: 'test-key',
    })
    await sendContactMessage(payload)
    expect(fetchMock.mock.calls[0][0]).toBe('https://mail.example.com/api/contact')
  })

  it('puts the sender on Reply-To so answering the mail reaches them', async () => {
    const { sendContactMessage } = await loadContact({ VITE_WEB3FORMS_KEY: 'test-key' })
    await sendContactMessage(payload)
    const body = JSON.parse(String((fetchMock.mock.calls[0][1] as RequestInit).body))
    expect(body.replyto).toBe('mei@example.com')
  })
})

describe('the honeypot', () => {
  it('accepts and drops rather than reporting a failure back to the bot', async () => {
    const { sendContactMessage } = await loadContact({ VITE_WEB3FORMS_KEY: 'test-key' })
    await expect(sendContactMessage({ ...payload, botcheck: 'filled by a bot' })).resolves
      .toBeUndefined()
    expect(fetchMock).not.toHaveBeenCalled()
  })
})

describe('failures', () => {
  it('surfaces the server message when the request is rejected', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ message: 'Origin not allowed.' }), { status: 403 }),
    )
    const { sendContactMessage } = await loadContact({
      VITE_CONTACT_ENDPOINT: 'https://mail.example.com/api/contact',
    })
    await expect(sendContactMessage(payload)).rejects.toThrow('Origin not allowed.')
  })

  it('falls back to the status code when the body carries no message', async () => {
    fetchMock.mockResolvedValueOnce(new Response('not json', { status: 500 }))
    const { sendContactMessage } = await loadContact({ VITE_WEB3FORMS_KEY: 'test-key' })
    await expect(sendContactMessage(payload)).rejects.toThrow(/500/)
  })

  it('turns an abort into something a person can act on', async () => {
    fetchMock.mockRejectedValueOnce(new DOMException('aborted', 'AbortError'))
    const { sendContactMessage } = await loadContact({ VITE_WEB3FORMS_KEY: 'test-key' })
    await expect(sendContactMessage(payload)).rejects.toThrow(/took too long/i)
  })
})

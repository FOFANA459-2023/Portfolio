import http from 'node:http'
import { fileURLToPath } from 'node:url'
import nodemailer from 'nodemailer'
import { buildEnquiryEmail } from './email.mjs'

/**
 * The contact form's delivery endpoint.
 *
 * This exists because of a hard constraint, not a preference. The site itself
 * is static: Vite inlines every `VITE_*` variable into the bundle it ships, so
 * a Gmail app password put there would be readable by anyone who opens the
 * page source. And Gmail delivery is SMTP over a raw socket, which a browser
 * cannot open and neither can an edge runtime like Cloudflare Workers. Sending
 * mail as a Gmail account therefore needs a Node process somewhere — this one.
 *
 * It holds one secret, does one thing, and has one dependency. Run it anywhere
 * Node runs; point `VITE_CONTACT_ENDPOINT` at it and the form posts here
 * instead of to Web3Forms.
 */

try {
  process.loadEnvFile(fileURLToPath(new URL('.env', import.meta.url)))
} catch {
  // No .env beside this file — fall back to real environment variables.
}

const {
  GMAIL_USER,
  GMAIL_APP_PASSWORD,
  CONTACT_TO = GMAIL_USER,
  ALLOWED_ORIGIN = '*',
  PORT = '8787',
} = process.env

if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
  console.error('Set GMAIL_USER and GMAIL_APP_PASSWORD in server/.env before starting.')
  process.exit(1)
}

const transport = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
})

/** Crude but sufficient: one IP, five messages an hour. */
const seen = new Map()
const WINDOW_MS = 60 * 60 * 1000
const LIMIT = 5

function rateLimited(ip) {
  const now = Date.now()
  const hits = (seen.get(ip) ?? []).filter((t) => now - t < WINDOW_MS)
  hits.push(now)
  seen.set(ip, hits)
  return hits.length > LIMIT
}

function json(res, status, body) {
  const payload = JSON.stringify(body)
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Length': Buffer.byteLength(payload),
  })
  res.end(payload)
}

function readBody(req, limitBytes = 32_000) {
  return new Promise((resolve, reject) => {
    let size = 0
    const chunks = []
    req.on('data', (chunk) => {
      size += chunk.length
      if (size > limitBytes) {
        reject(new Error('Body too large'))
        req.destroy()
        return
      }
      chunks.push(chunk)
    })
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') return json(res, 204, {})
  if (req.method !== 'POST' || !req.url?.startsWith('/api/contact')) {
    return json(res, 404, { message: 'Not found' })
  }

  const ip = req.headers['cf-connecting-ip'] ?? req.socket.remoteAddress ?? 'unknown'
  if (rateLimited(String(ip))) {
    return json(res, 429, { message: 'Too many messages. Try again later.' })
  }

  let payload
  try {
    payload = JSON.parse(await readBody(req))
  } catch {
    return json(res, 400, { message: 'Could not read that request.' })
  }

  // The honeypot. A bot fills every field it finds, so anything here means the
  // sender is not a person — accepted and dropped, because telling a bot it
  // failed only teaches it what to change.
  if (payload?.botcheck) return json(res, 200, { message: 'Sent.' })

  const name = String(payload?.name ?? '').trim()
  const email = String(payload?.email ?? '').trim()
  const message = String(payload?.message ?? '').trim()

  if (!name || !email || !message) {
    return json(res, 400, { message: 'Name, email and message are all required.' })
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return json(res, 400, { message: 'That email address does not look right.' })
  }
  if (message.length > 5000) {
    return json(res, 400, { message: 'That message is too long.' })
  }

  const mail = buildEnquiryEmail({ name, email, message })

  try {
    await transport.sendMail({
      // The envelope sender must be the authenticated account — Gmail rewrites
      // anything else — so the visitor's address goes on Reply-To instead, and
      // hitting Reply in the inbox answers them rather than yourself.
      from: `"Portfolio — ${name}" <${GMAIL_USER}>`,
      to: CONTACT_TO,
      replyTo: mail.replyTo,
      subject: mail.subject,
      text: mail.text,
      html: mail.html,
    })
    return json(res, 200, { message: 'Sent.' })
  } catch (error) {
    console.error('Delivery failed:', error?.message ?? error)
    return json(res, 502, { message: 'Could not deliver that message.' })
  }
})

server.listen(Number(PORT), () => {
  console.log(`Contact mailer listening on http://localhost:${PORT}/api/contact`)
  console.log(`Delivering to ${CONTACT_TO}`)
})

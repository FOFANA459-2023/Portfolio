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
 * Nothing is hard-coded. Every address, origin and credential comes from the
 * environment, so this file is safe to publish and the deployment it runs in
 * is the only thing that knows anything secret.
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
  SITE_NAME,
  ALLOWED_ORIGINS = '',
  PORT = '8787',
} = process.env

/* -- Start-up checks. Every one of these fails closed: the process refuses to
      run rather than run insecurely, because a mailer that quietly accepts the
      whole internet is worse than one that is obviously not started. -------- */

if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
  console.error('Set GMAIL_USER and GMAIL_APP_PASSWORD in server/.env before starting.')
  process.exit(1)
}

const allowedOrigins = ALLOWED_ORIGINS.split(',')
  .map((value) => value.trim().replace(/\/$/, ''))
  .filter(Boolean)

if (allowedOrigins.length === 0) {
  console.error(
    'Set ALLOWED_ORIGINS in server/.env to the site(s) allowed to post here,\n' +
      'comma-separated, e.g. ALLOWED_ORIGINS=http://localhost:5173',
  )
  process.exit(1)
}

if (allowedOrigins.includes('*')) {
  console.error(
    'ALLOWED_ORIGINS cannot be "*". That lets any page on the internet send mail\n' +
      'from this address. List the exact origins instead.',
  )
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

/**
 * The requesting origin, but only if it is one we allow.
 *
 * Returning null for anything else does two jobs: no `Access-Control-Allow-Origin`
 * header goes back, so a browser blocks the response, and the handler below
 * refuses the request outright — because CORS is a rule browsers choose to
 * obey and `curl` does not.
 */
function allowedOrigin(req) {
  const origin = req.headers.origin?.replace(/\/$/, '')
  return origin && allowedOrigins.includes(origin) ? origin : null
}

function json(res, status, body, origin) {
  const payload = JSON.stringify(body)
  res.writeHead(status, {
    'Content-Type': 'application/json',
    // Echoed back per request rather than sent as a wildcard, so the header
    // only ever names an origin already on the list.
    ...(origin ? { 'Access-Control-Allow-Origin': origin } : {}),
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    // The response differs by Origin, so caches must key on it.
    Vary: 'Origin',
    'X-Content-Type-Options': 'nosniff',
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
  const origin = allowedOrigin(req)

  // Liveness, for the container runtime and any load balancer in front of it.
  // Deliberately says nothing about configuration: a probe endpoint that
  // reports which variables are set is a reconnaissance endpoint.
  if (req.method === 'GET' && req.url === '/healthz') {
    return json(res, 200, { status: 'ok' }, origin)
  }

  if (req.method === 'OPTIONS') return json(res, 204, {}, origin)
  if (req.method !== 'POST' || !req.url?.startsWith('/api/contact')) {
    return json(res, 404, { message: 'Not found' }, origin)
  }

  // Enforced, not merely advertised. A request carrying an origin we do not
  // know is refused here, whatever the client chooses to do about CORS.
  if (!origin) {
    return json(res, 403, { message: 'Origin not allowed.' }, null)
  }

  const ip = req.headers['cf-connecting-ip'] ?? req.socket.remoteAddress ?? 'unknown'
  if (rateLimited(String(ip))) {
    return json(res, 429, { message: 'Too many messages. Try again later.' }, origin)
  }

  let payload
  try {
    payload = JSON.parse(await readBody(req))
  } catch {
    return json(res, 400, { message: 'Could not read that request.' }, origin)
  }

  // The honeypot. A bot fills every field it finds, so anything here means the
  // sender is not a person — accepted and dropped, because telling a bot it
  // failed only teaches it what to change.
  if (payload?.botcheck) return json(res, 200, { message: 'Sent.' }, origin)

  const name = String(payload?.name ?? '').trim()
  const email = String(payload?.email ?? '').trim()
  const message = String(payload?.message ?? '').trim()

  if (!name || !email || !message) {
    return json(res, 400, { message: 'Name, email and message are all required.' }, origin)
  }
  if (name.length > 120) {
    return json(res, 400, { message: 'That name is too long.' }, origin)
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return json(res, 400, { message: 'That email address does not look right.' }, origin)
  }
  if (message.length > 5000) {
    return json(res, 400, { message: 'That message is too long.' }, origin)
  }

  const mail = buildEnquiryEmail({ name, email, message, siteName: SITE_NAME })

  try {
    await transport.sendMail({
      // The envelope sender must be the authenticated account — Gmail rewrites
      // anything else — so the visitor's address goes on Reply-To instead, and
      // hitting Reply in the inbox answers them rather than yourself. The
      // display name is stripped of the characters that could otherwise break
      // out of the quoted string and forge a second header.
      from: `"${name.replace(/["\\\r\n]/g, ' ')} via portfolio" <${GMAIL_USER}>`,
      to: CONTACT_TO,
      replyTo: mail.replyTo,
      subject: mail.subject,
      text: mail.text,
      html: mail.html,
    })
    return json(res, 200, { message: 'Sent.' }, origin)
  } catch (error) {
    // Logged without the payload or the credentials — just enough to debug.
    console.error('Delivery failed:', error?.code ?? error?.message ?? 'unknown error')
    return json(res, 502, { message: 'Could not deliver that message.' }, origin)
  }
})

server.listen(Number(PORT), () => {
  console.log(`Contact mailer listening on http://localhost:${PORT}/api/contact`)
  console.log(`Accepting posts from: ${allowedOrigins.join(', ')}`)
})

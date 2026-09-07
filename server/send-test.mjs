import { fileURLToPath } from 'node:url'
import nodemailer from 'nodemailer'
import { buildEnquiryEmail } from './email.mjs'

/**
 * Sends one sample enquiry so the template can be looked at in a real inbox
 * rather than a browser. Same code path the live endpoint uses — if this
 * arrives and looks right, so will the real thing.
 *
 *   cd server && npm run test-email
 */

try {
  process.loadEnvFile(fileURLToPath(new URL('.env', import.meta.url)))
} catch {
  /* fall back to real environment variables */
}

const { GMAIL_USER, GMAIL_APP_PASSWORD, CONTACT_TO = GMAIL_USER } = process.env

if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
  console.error('Set GMAIL_USER and GMAIL_APP_PASSWORD in server/.env first.')
  process.exit(1)
}

const sample = {
  name: 'Mei Tanaka',
  email: 'mei.tanaka@example.com',
  message: `Hi Varlee,

I came across your portfolio while looking for a frontend intern for our team in Fukuoka. The scholarship platform is the one that made me get in touch — a two-hundred-test pipeline on a solo project is not something we see often.

Would you have twenty minutes this week for a call?

Mei`,
  origin: 'Portfolio contact form — test send',
}

const mail = buildEnquiryEmail(sample)

const transport = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
})

const info = await transport.sendMail({
  from: `"Portfolio — ${sample.name}" <${GMAIL_USER}>`,
  to: CONTACT_TO,
  replyTo: mail.replyTo,
  subject: `${mail.subject} (test)`,
  text: mail.text,
  html: mail.html,
})

console.log('Sent to', CONTACT_TO)
console.log('Message id:', info.messageId)
console.log('Server said:', info.response)

/**
 * The message that lands in the inbox.
 *
 * Built to be read in two seconds on a phone: who it is from, what they said,
 * and one button that replies to them. Everything else — the timestamp, the
 * origin — sits underneath in small type where it can be ignored.
 *
 * Email is not the web. There is no external stylesheet, no flexbox, no grid
 * and no web font: layout is a table, every rule is an inline style, and the
 * typefaces are the ones already on the machine. The palette is the site's,
 * so a reply thread looks like it came from the same place as the page.
 */

const INK = '#211f1b'
const FAINT = '#67635b'
const PAPER = '#f0ece4'
const CARD = '#ffffff'
const LINE = '#ded8cb'
const ACCENT = '#d6440f'

const SERIF = "Georgia, 'Times New Roman', Times, serif"
const SANS =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"

/** Anything a sender typed goes through this before it reaches the markup. */
function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/** Their message, with its paragraph breaks kept and nothing else trusted. */
function messageToHtml(message) {
  return escapeHtml(message)
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map(
      (block) =>
        `<p style="margin:0 0 16px;font-family:${SANS};font-size:16px;line-height:1.65;color:${INK};">${block.replace(
          /\n/g,
          '<br />',
        )}</p>`,
    )
    .join('')
}

function formatWhen(date, timeZone) {
  try {
    return new Intl.DateTimeFormat('en-GB', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone,
    }).format(date)
  } catch {
    return date.toISOString()
  }
}

/**
 * @param {{ name: string, email: string, message: string, siteName?: string,
 *           origin?: string, timeZone?: string, sentAt?: Date }} enquiry
 * @returns {{ subject: string, html: string, text: string, replyTo: string }}
 */
export function buildEnquiryEmail(enquiry) {
  const {
    name,
    email,
    message,
    siteName = 'varleefofana.com',
    origin = 'Portfolio contact form',
    timeZone = 'Asia/Tokyo',
    sentAt = new Date(),
  } = enquiry

  const when = formatWhen(sentAt, timeZone)
  const safeName = escapeHtml(name)
  const safeEmail = escapeHtml(email)
  const replySubject = encodeURIComponent(`Re: your message from ${siteName}`)

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light" />
    <title>New enquiry from ${safeName}</title>
  </head>
  <body style="margin:0;padding:0;background-color:${PAPER};">
    <!-- Preheader: the grey line of text a client shows next to the subject. -->
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
      ${safeName} &lt;${safeEmail}&gt; — sent from your portfolio contact form.
    </div>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
           style="background-color:${PAPER};padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                 style="max-width:600px;">

            <tr>
              <td style="padding:0 4px 20px;font-family:${SANS};font-size:11px;
                         letter-spacing:0.14em;text-transform:uppercase;color:${FAINT};">
                ${escapeHtml(origin)}
              </td>
            </tr>

            <tr>
              <td style="background-color:${CARD};border:1px solid ${LINE};border-radius:10px;
                         padding:32px 28px;">

                <p style="margin:0 0 6px;font-family:${SANS};font-size:11px;letter-spacing:0.14em;
                          text-transform:uppercase;color:${FAINT};">New enquiry</p>

                <h1 style="margin:0 0 4px;font-family:${SERIF};font-size:30px;font-weight:400;
                           line-height:1.15;color:${INK};">${safeName}</h1>

                <p style="margin:0 0 24px;font-family:${SANS};font-size:15px;line-height:1.5;">
                  <a href="mailto:${safeEmail}"
                     style="color:${ACCENT};text-decoration:none;">${safeEmail}</a>
                </p>

                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr><td style="border-top:1px solid ${LINE};font-size:0;line-height:0;height:1px;">&nbsp;</td></tr>
                </table>

                <div style="padding-top:24px;">
                  ${messageToHtml(message)}
                </div>

                <table role="presentation" cellpadding="0" cellspacing="0" border="0"
                       style="margin-top:12px;">
                  <tr>
                    <td style="background-color:${INK};border-radius:999px;">
                      <a href="mailto:${safeEmail}?subject=${replySubject}"
                         style="display:inline-block;padding:13px 26px;font-family:${SANS};
                                font-size:15px;color:${PAPER};text-decoration:none;">
                        Reply to ${safeName}
                      </a>
                    </td>
                  </tr>
                </table>

              </td>
            </tr>

            <tr>
              <td style="padding:18px 4px 0;font-family:${SANS};font-size:12px;line-height:1.6;
                         color:${FAINT};">
                ${escapeHtml(when)} (${escapeHtml(timeZone)}) &nbsp;·&nbsp;
                Replying to this email goes straight to ${safeName}.
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`

  const text = [
    `NEW ENQUIRY — ${origin}`,
    '',
    `From:    ${name}`,
    `Email:   ${email}`,
    `Sent:    ${when} (${timeZone})`,
    '',
    '---',
    '',
    message.trim(),
    '',
    '---',
    '',
    `Reply to this email and it goes straight to ${name}.`,
  ].join('\n')

  return {
    subject: `Portfolio enquiry — ${name}`,
    html,
    text,
    replyTo: email,
  }
}

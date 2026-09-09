# Varlee Fofana — Portfolio

Personal portfolio. React 19 + TypeScript + Vite, Tailwind CSS v4, Motion for animation,
Lenis for smooth scroll. The page itself is static; `server/` is a small, separate
Node mailer that delivers contact-form messages over Gmail SMTP.

```bash
npm install
npm run dev
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server on http://localhost:5173 |
| `npm run build` | Typecheck (`tsc -b`) then production build to `dist/` |
| `npm run preview` | Serve the built `dist/` on port 4173 |
| `npm run lint` | oxlint |
| `npm run typecheck` | Types only, no build |
| `npm test` | Unit and component tests (Vitest) |
| `npm run test:coverage` | The same, with coverage gates |
| `npm run test:e2e` | End-to-end and accessibility (Playwright) |
| `npm run verify` | Everything CI runs, in the order CI runs it |

---

## Testing

86 tests, in two layers.

**Unit and component**, in `src/**/*.test.{ts,tsx}`, run by Vitest in jsdom.
They cover the form validation rules, the contact delivery routing, the motion
preference helpers, and the two components with real behaviour in them.
Coverage is scoped to `src/lib` and `src/data` rather than averaged across a
wall of presentational JSX, and gated at 95% statements and branches.

`src/data/content.test.ts` is the unusual one: it enforces the editorial rules
that would otherwise be undone by the next person to edit a string. No em or en
dashes anywhere a visitor reads, no location for him, no "junior", no
"internship", no count of the projects, https on every outbound link, and alt
text on every screenshot.

**End-to-end**, in `e2e/`, run by Playwright against `npm run preview`, which
serves the built `dist/` rather than the dev server, because that is the
artefact being deployed. Desktop and mobile both run. Alongside the usual
journeys, `@axe-core/playwright` scans for WCAG 2.1 A and AA violations on the
page and inside an open case study, and there are currently none.

```bash
npm run test:e2e:install   # once, to fetch the browser
npm run test:e2e
```

---

## CI/CD

`.github/workflows/ci.yml` runs on every push and pull request to `main`, in
five jobs:

| Job | What it proves |
| --- | --- |
| **quality** | oxlint, `tsc -b` across app, config and e2e, unit tests, coverage gates |
| **build** | The production build succeeds, and reports its own bundle size |
| **e2e** | The built site passes 30 end-to-end and accessibility checks |
| **security** | `npm audit --audit-level=high`, gitleaks over the history, and a grep of `dist/` for credential patterns |
| **docker** | The mailer image builds, refuses to start misconfigured, and answers `/healthz` |

The docker job is not just a build. It runs the image three times and asserts
that it *refuses* to start without `ALLOWED_ORIGINS`, *refuses* a wildcard, and
then answers its health endpoint when configured properly. It publishes to GHCR
only from `main`.

`codeql.yml` runs GitHub's `security-and-quality` query pack, and
`dependabot.yml` groups dependency updates so that React, the test tools and
the build tools each arrive as one pull request rather than five.

`deploy.yml` publishes to Cloudflare on a green CI run only. `workflow_run`
fires on failure too, so it checks the conclusion explicitly rather than
trusting the trigger.

### Deploying

The site is a Cloudflare Worker serving static assets, configured in
`wrangler.jsonc`. There is a small Worker in `worker/index.js` in front of the
assets for one reason: response headers. A pure assets deployment cannot set a
Content-Security-Policy, and this one does, along with HSTS, a referrer policy
and the rest.

Two repository secrets and one variable make the deploy work:

| Name | Kind | What it is |
| --- | --- | --- |
| `CLOUDFLARE_API_TOKEN` | secret | A token with **Workers Scripts: Edit** |
| `CLOUDFLARE_ACCOUNT_ID` | secret | From the Cloudflare dashboard |
| `VITE_CONTACT_ENDPOINT` | variable | The mailer's URL, once it has a host |

There is no `public/_redirects`. That is Pages syntax, and Workers rejects it
as *"Infinite loop detected in this rule"*; the single-page fallback is
`assets.not_found_handling` in `wrangler.jsonc` instead.

---

## The contact form

Messages have two possible routes to the inbox. Set one of them; the form shows a
visible "Setup needed" notice rather than failing silently while neither is set.

### Route A — the mailer in `server/` (what is set up now)

A ~150-line Node service with one dependency. It sends from **fvarlee@gmail.com**
over Gmail SMTP using the template in `server/email.mjs`, so the mail that arrives
is designed rather than generic, and Reply goes straight back to the sender.

```bash
cp server/.env.example server/.env    # fill in GMAIL_USER, GMAIL_APP_PASSWORD,
                                      # and ALLOWED_ORIGINS
cd server && npm install && npm start # listens on :8787
npm run test-email                    # sends one sample enquiry to yourself
```

Then point the site at it:

```
VITE_CONTACT_ENDPOINT=http://localhost:8787/api/contact
```

**This needs a Node process running somewhere.** That is not a preference — Gmail
delivery is SMTP over a raw TCP socket, which a browser cannot open and neither can
an edge runtime like Cloudflare Workers. Any always-on Node host works; the same
Oracle Cloud Always Free VM that runs the other two projects is the obvious one.

### What keeps it safe

- **Nothing is hard-coded.** No address, domain or credential appears in any
  committed file — `index.mjs` and `email.mjs` read everything from the
  environment, so both are safe to publish as they are.
- **The app password never goes in a `VITE_*` variable.** Vite inlines those into
  the bundle it ships, so it would be readable by anyone who opens the page
  source. It lives only in `server/.env`, ignored by the root `.gitignore` and
  again by `server/.gitignore`.
- **`ALLOWED_ORIGINS` is required and cannot be `*`.** The process refuses to
  start without an explicit list, and refuses a wildcard outright — a mailer
  that quietly accepts the whole internet is worse than one that will not boot.
  Add the real site to the list when you deploy.
- **The origin check is enforced, not advertised.** A request whose `Origin` is
  not on the list gets a 403 and no `Access-Control-Allow-Origin` header at all,
  because CORS is a rule browsers choose to obey and `curl` does not.
- Five messages per IP per hour, a 32KB body cap, length and format checks on
  every field, a honeypot that accepts and drops silently, HTML-escaping of
  everything a sender typed, and `Reply-To` rather than a forged `From` — Gmail
  rewrites the envelope sender anyway.

### Route B — Web3Forms (no server to run)

1. Go to [web3forms.com](https://web3forms.com) and enter **fvarlee@gmail.com**.
   Web3Forms delivers to whichever address created the key, so it has to be that one.
2. Put the access key into `.env.local` as `VITE_WEB3FORMS_KEY`, and add the **same
   variable** in the host's dashboard — Vite bakes env vars in at build time, so a
   local `.env.local` never reaches production.

That key is a public, client-side identifier by design and is safe in the shipped
bundle. The trade is their default email template instead of ours.

## Still to do

Marked with `TODO` in the source.

### 2. Set the production domain

`https://varleefofana.com` is a placeholder. It appears in exactly two places:

- `src/data/site.ts` → `site.url`
- `index.html` → the `canonical` link, `og:url`, and the JSON-LD `url`

`index.html` needs its own copy because those tags are read before any JavaScript runs.

---

## Editing content

Everything a visitor reads lives in `src/data/`. No copy is written into a component.

- **`src/data/projects.ts`** — the three projects.
  Order in the array is the order on the page; `number` is authored, not derived.
- **`src/data/site.ts`** — name, positioning, bio, the About facts, socials, nav order.
- **`src/data/skills.ts`** — the four stack groups.

### Adding a project

Append an entry, give it the next `number`, drop its screenshots in
`src/assets/projects/` and import them at the top of the file. Nothing else changes —
the showcase and the case study both render from that array.

Every project uses the same arrangement, mirrored on alternate entries: a column of
facts that stays pinned while the column of screenshots scrolls past it. One layout
mirrored is not three layouts to hold in your head, and the alternation is what keeps
three projects in a row from reading as a list.

`metrics` is two or three hard figures shown beside the summary. Every one has to be
true of the shipped product and checkable from its repository — they are authored, not
computed, so nothing drifts silently, and nothing goes in that cannot be verified.

The pinned column is gated behind a `tall:` variant (defined at the top of
`index.css`), because it is around 760px high — on a short laptop it would be taller
than the space between the header and the bottom of the window, and its last rows
would be unreachable while pinned. Above 900px of viewport height it pins; below, it
falls back to ordinary flow.

Above the three projects, `ProjectIndex` lists all of them in one screen — name,
category, the first three stack entries and whether it is live — because the full
treatment gives each project a full stretch of the page, and someone deciding whether
to read should not have to scroll three times to find out what the three things are.

Repository links:

```ts
repos: [{ label: 'Frontend', url }, { label: 'Backend', url }]  // split repos
repos: [{ label: 'Repository', url }]                           // one repo or a monorepo
repos: []                                                       // "Private repository"
```

Screenshots are 1600×1000 WebP (16:10). They are captured at a 16:10 viewport at 2×
and downscaled — the frame reserves their exact height before they load, so nothing
on the page shifts.

---

## Deploying to Cloudflare Pages

| Setting | Value |
| --- | --- |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Node version | 20 or newer |
| Environment variable | `VITE_WEB3FORMS_KEY` |

`public/_redirects` already contains the SPA fallback (`/* /index.html 200`).

---

## How it is put together

```
src/
├─ assets/
│  ├─ portrait.webp           325x450 cut-out, cropped to the subject
│  └─ projects/               1600x1000 product screenshots
├─ data/                      ← everything you edit
├─ types/                     Project, ProjectShot, SkillGroup, SocialLink…
├─ lib/
│  ├─ scroll.ts               Lenis singleton + scrollToSection / scrollToTop
│  ├─ contact.ts              posts to server/ or to Web3Forms
│  ├─ validate.ts             form rules
│  ├─ motion-preference.ts    reduced-motion + pointer queries
│  ├─ status.ts               how a project's status is worded, in one place
│  └─ cn.ts
├─ hooks/                     useLenis, useActiveSection, useScrollLock,
│                             useBandUnderNav
├─ components/
│  ├─ layout/                 Nav, MobileMenu, Footer
│  ├─ ui/                     Section, SectionHeading, AnimatedText, Reveal,
│  │                          Frame, TechStack, Button, ExternalLink, Icons
│  └─ sections/               Hero, Projects, ProjectIndex, ProjectShowcase,
│                             ProjectLinks, CaseStudy, About, Contact,
│                             ContactForm
└─ styles/index.css           theme tokens + band definitions + base layers

server/                        separate package, never imported by the site
├─ index.mjs                   POST /api/contact -> Gmail SMTP, GET /healthz
├─ email.mjs                   the enquiry email, table-based and inline-styled
├─ send-test.mjs               sends one sample enquiry to yourself
├─ Dockerfile                  multi-stage, non-root, with a health check
└─ .env                        GMAIL_APP_PASSWORD lives here, and only here
                               (gitignored twice over)

e2e/                           Playwright specs, run against the built dist/
worker/index.js                the Cloudflare Worker: assets + security headers
wrangler.jsonc                 Cloudflare deployment config
.github/workflows/             ci.yml, deploy.yml, codeql.yml
```

The mailer runs anywhere Node or Docker runs:

```bash
docker build -t contact-mailer ./server
docker run -p 8787:8787 --env-file server/.env contact-mailer
```

### Bands are the design

The page alternates between two grounds as you scroll — warm paper (`#f0ece4`)
and a warm charcoal (`#232220`). Hero, projects, about, contact: light, dark,
light, dark. That alternation is what separates the sections, which is why none
of them needs a divider, a border, or a background effect to announce itself.

The two grounds are deliberately closer together than paper-white and black:
each section also fades in from the ground above it over its first 6rem
(`.band-seam`), so a boundary is a stretch of scrolling rather than a hard line.
How far the dark ground can be lifted is capped by the accent, which has to stay
above 3:1 on it and on the raised surface above it.

It works through one set of semantic colour names — `bg`, `bg-2`, `fg`,
`fg-soft`, `fg-faint`, `line`, `line-soft` — which each band re-declares.
A component writes `bg-bg text-fg` once and is correct on both grounds. **There
is not a single `dark:` variant in this codebase.**

```tsx
<Section id="projects" band="dark">   {/* sets data-band; everything inside flips */}
```

One rule matters if you extend this: in `index.css` the band overrides declare
**literal values**, never an indirection like `--color-bg: var(--band-bg)`.
A custom property whose value is another `var()` resolves once, where it is
declared, and then inherits the already-substituted result — so redefining the
inner variable further down the tree does nothing at all. That bug is invisible
in code review and obvious the moment you look at the page.

The header watches which band it is over (`useBandUnderNav`) and inverts to
match, using an IntersectionObserver collapsed to a 1px line at the header's own
baseline rather than a scroll handler.

### Type and colour

Two families. **Instrument Serif** carries every display size — the name, the
section titles, the project titles. **Inter Tight** carries everything that has
to be read rather than looked at, including the small-caps metadata labels,
which is what lets the page ship without a third font for monospace.

The palette is the two grounds and **one** accent (`#d6440f`), picked to clear
3:1 on both of them so a focus ring or a hover underline is legible either way —
4.5:1 on paper, 4.2:1 on black. It is used for focus, hover underlines, the
active nav marker and the availability dot. Nothing else.

**Tailwind v4 is CSS-first.** There is no `tailwind.config.js` and no PostCSS
config; the `@theme` block at the top of `src/styles/index.css` is the config.

**Motion is the package formerly published as Framer Motion.** Imports come from
`motion/react`.

### Things worth knowing before you edit

- **Grid items need `min-w-0`.** A grid item defaults to `min-width: auto`, so it
  refuses to shrink below its content's min-content width. One `truncate` or one
  `whitespace-nowrap` inside a column is enough to silently widen the whole row
  on a phone. Every multi-column grid here carries `min-w-0` for this reason.
- **`TechStack` needs its explicit `{' '}`.** Each entry is `whitespace-nowrap`
  so a line never breaks inside "Power BI" or "Django REST Framework" — but
  adjacent JSX elements have no whitespace between them, so without an explicit
  space there is no break opportunity anywhere and the list becomes one
  unbreakable line that overflows.
- **Headings animate by line, not by character.** `AnimatedText` masks each line
  and slides it up. One span per glyph costs a node per character, breaks
  selection and copy-paste, and forces assistive technology onto an `aria-label`
  instead of the real text.
- **Navigating from the mobile menu is deferred.** The menu holds a scroll lock,
  and a stopped Lenis silently discards `scrollTo`. The target is stashed in a
  ref and the scroll runs from the menu's unmount cleanup, after the lock is
  released. `AnimatePresence`'s `onExitComplete` is too early — the exiting
  child, and therefore its lock, still exists at that point.
- **`<body>` must not have a background-color.** `<html>` carries it, and that
  one is propagated to the canvas. A background on `<body>` paints as an
  ordinary block background, which happens *after* negative-z-index descendants
  and would cover anything sitting behind the content.
- **The portfolio's own preview is a screenshot of this page.** Re-capture it
  whenever the design changes, or project 03 will show the previous one.

### Motion and accessibility

`prefers-reduced-motion` is honoured structurally, not cosmetically.
`<MotionConfig reducedMotion="user">` covers every Motion animation; on top of
that Lenis is never constructed at all, and the CSS transitions that never pass
through Motion are neutralised by a media query at the bottom of `index.css`.
The site is fully usable with zero animation.

Both overlays — the case study and the mobile menu — are real dialogs: scroll
locked behind them, focus moved in and trapped, Escape to close, focus returned
to the trigger on the way out. Nothing on the page is reachable by hover alone,
and the large project screenshots are real `<button>`s so they are reachable by
keyboard and announced as controls.

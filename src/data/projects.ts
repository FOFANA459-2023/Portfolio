import type { Project } from '@/types'

import myscholyBoard from '@/assets/projects/myscholy-board.webp'
import myscholyHome from '@/assets/projects/myscholy-home.webp'
import chattobiraQuiz from '@/assets/projects/chattobira-quiz.webp'
import chattobiraHome from '@/assets/projects/chattobira-home.webp'
import revelleHome from '@/assets/projects/revelle-home.webp'
import revelleShop from '@/assets/projects/revelle-shop.webp'
import revelleProduct from '@/assets/projects/revelle-product.webp'

/* ---------------------------------------------------------------------------
 * The only place project content lives. Every component below `sections/`
 * renders from this array and nothing else — no project name, URL or claim is
 * written into JSX anywhere.
 *
 * Adding a project: append an entry, give it the next `number`, drop its
 * screenshots in `src/assets/projects/` and import them above. Nothing else
 * needs to change; the showcase, the case study, the hero frame, the nav count
 * and the skills cross-reference all derive from here.
 *
 *   repos: []                                   -> "Private repository"
 *   repos: [{ label: 'Repository', url }]        -> single repo / monorepo
 *   repos: [{ label: 'Frontend',  url },
 *           { label: 'Backend',   url }]         -> split repos
 *
 * Everything here is taken from the projects' own repositories and running
 * deployments. Do not add a claim that is not true of the shipped product.
 * ------------------------------------------------------------------------- */
export const projects: Project[] = [
  {
    id: 'myscholy',
    number: '01',
    title: 'myScholy',
    category: 'Education platform',
    summary:
      'A scholarship board that puts live, funded opportunities in one place — and tells a student whether they actually qualify.',
    problem:
      'Good scholarships go unclaimed every year. Not because students are not looking, but because the information is scattered across dozens of university pages and embassy PDFs, and by the time it reaches a student the deadline has usually passed.',
    solution:
      'One board of live opportunities, filterable by country, degree level and funding type. Students can check their eligibility with a short quiz, ask the assistant a question, and get new scholarships pushed to them by email instead of going back to check.',
    features: [
      'Filter by country, degree level and funding type — every filtered view is its own shareable URL',
      'An eligibility quiz and an on-site assistant that answer from the live board rather than a canned FAQ',
      'An email digest of five open scholarships every 72 hours',
      'Admins post by pasting the announcement text, a link or a PDF — the form fills itself and warns on duplicates',
      'Dashboard with statistics, a user directory, CSV export and archive/repost workflows',
      'A message centre that groups contact-form threads by sender and replies from the myScholy address',
    ],
    engineering: [
      'The whole data layer is a single hand-written fetch wrapper: it attaches and refreshes JWTs with concurrent refreshes collapsed into one request, de-duplicates identical in-flight GETs, and serves a stale-while-revalidate cache in which each mutation declares the tags it invalidates.',
      'Every push runs ESLint and Ruff, 200+ unit tests across Vitest and Django, and Playwright end-to-end tests — and deploys only if all of it is green.',
      'Server-side URL fetching sits behind an SSRF guard, public endpoints are rate-limited, permissions are role-based with cached lookups, and the browser never holds a database key.',
      'The digest job records every send, so two servers triggering it cannot email the same student twice. It runs on a systemd timer, because cron cannot express "every 72 hours".',
      'The API runs on an Oracle Cloud VM behind Caddy, with a warm standby on Render sharing the same database — failing over is one environment variable.',
    ],
    metrics: [
      { value: '200+', label: 'Tests per push' },
      { value: '72h', label: 'Digest cycle' },
      { value: '2', label: 'Clouds, one database' },
    ],
    stack: [
      'React',
      'Tailwind CSS',
      'Vite',
      'Django REST Framework',
      'PostgreSQL',
      'Supabase',
      'Redis',
      'Gemini API',
      'Cloudflare Pages',
      'Oracle Cloud',
      'GitHub Actions',
      'Playwright',
    ],
    repos: [
      { label: 'Frontend', url: 'https://github.com/FOFANA459-2023/myScholy' },
      { label: 'Backend', url: 'https://github.com/FOFANA459-2023/myScholyScholarship_Backend' },
    ],
    liveUrl: 'https://myscholy.pages.dev',
    shots: [
      {
        src: myscholyBoard,
        alt: 'The myScholy scholarship board: a search field, region and degree-level filters, and a grid of scholarship cards each showing country, level, deadline and days remaining.',
        caption: 'Scholarship board — filters and live listings',
      },
      {
        src: myscholyHome,
        alt: 'The myScholy home page, headlined "Empowering students through scholarships", with buttons to explore scholarships, take the assessment and join the community.',
        caption: 'Home',
      },
    ],
    year: '2025 — 2026',
    role: 'Software engineer — frontend, API, infrastructure',
    status: 'live',
  },

  {
    id: 'chattobira',
    number: '02',
    title: 'ChatTobira',
    category: 'AI · Retrieval',
    summary:
      'A study assistant that has read an entire Japanese course and answers with the page number to go and review.',
    problem:
      'My Japanese class moved faster than I did. Answering one homework question meant flipping between a textbook, last week’s handouts and a stack of review sheets to find a single grammar point.',
    solution:
      'An assistant grounded in the actual course material. It answers in English or Japanese with a citation to the printed page, and generates practice tests in the format of the course’s real papers — graded instantly, with a study plan pointing at what to review.',
    features: [
      'Grounded chat in English or Japanese, answering only from course material and citing printed textbook pages',
      'Practice grammar and kanji papers generated in the format of the course’s real test sheets, scoped to a topic',
      'Instant grading with explanations and a study plan pointing at the pages to review',
      'Furigana shown only on kanji the student has not been taught yet',
      'A paper the student has already sat is never generated again',
      'Invite-only access by magic link — no passwords, no public signup',
    ],
    engineering: [
      'The source PDFs had no text layer at all — a 216-page textbook yielded three extractable characters. Ingestion renders every page to an image and transcribes it with a vision model, and a verify step fails the corpus if fewer than 95% of chunks contain Japanese, which is the tripwire for a silent regression back to the useless text layer.',
      'Japanese has no spaces and Postgres has no Japanese full-text configuration. Text is segmented with a morphological analyser at ingest and queries are segmented the same way, then fused with vector search by reciprocal rank fusion — so a student typing みえる finds material written 見える.',
      'It runs at roughly $0/month for a classroom: a semantic answer cache (a hundred students ask the same thirty questions), per-student daily quotas, and a provider cascade that degrades as each free tier is exhausted. Transcription is checkpointed per page, so a rate-limited run resumes tomorrow without re-paying for a single page.',
      'The only copies of the past papers were phone scans of a classmate’s marked script. Those get their own vision prompt that reads the printed sheet and leaves the ink on it, and the verify step fails the corpus if a name, ID or mark ever reaches a chunk — because a prompt is an instruction, not a guarantee.',
      'The test generator is planned from a format specification tabulated from 40 real papers, not from a template — section counts, option styles and mark allocations differ by level, and none of it matched what I assumed before I measured it.',
    ],
    metrics: [
      { value: '3', label: 'Characters of text in a 216-page book' },
      { value: '40', label: 'Past papers tabulated' },
      { value: '~$0', label: 'Monthly running cost' },
    ],
    stack: [
      'Next.js',
      'TypeScript',
      'Tailwind CSS',
      'Cloudflare Workers',
      'Supabase',
      'PostgreSQL',
      'pgvector',
      'Python',
      'Vercel AI SDK',
      'Gemini API',
      'GitHub Actions',
      'Playwright',
    ],
    repos: [{ label: 'Repository', url: 'https://github.com/FOFANA459-2023/ChatTobira' }],
    liveUrl: 'https://chattobira.fvarlee.workers.dev',
    liveLabel: 'Open the app',
    access:
      'Open to try — three free questions and one free practice test. Full access is invite-only, because the course material behind it is copyrighted.',
    shots: [
      {
        src: chattobiraQuiz,
        alt: 'The ChatTobira practice-test screen, offering a Grammar or a Kanji and Vocabulary paper, a textbook selector, and a button to start the practice test.',
        caption: 'Practice tests — generated in the real paper format',
      },
      {
        src: chattobiraHome,
        alt: 'The ChatTobira chat screen with a bilingual welcome explaining that it answers from Ritsumeikan Asia Pacific University course material and does not retain conversations.',
        caption: 'Grounded chat',
      },
    ],
    year: '2026',
    role: 'Software engineer — ingestion, retrieval, app, ops',
    status: 'live',
  },

  {
    id: 'revelle',
    number: '03',
    title: 'Revelle Beauty',
    category: 'E-commerce',
    summary:
      'A cosmetics storefront built around the one thing a customer is actually choosing — the shade — with a checkout that never lets the browser name a price.',
    problem:
      'Selling colour cosmetics online is mostly a colour problem. A lipstick is not one product but a dozen shades, each with its own photography, its own stock and its own hex value. Most store templates file all of that behind a dropdown, which is the one place the thing being chosen should never be.',
    solution:
      'A storefront where the shade leads: real swatches drawn from the product’s own hex on the card, the grid and the product page, with photography linked to whichever one you pick. Behind it, the rest of a commerce pipeline — accounts, a server-side cart, Stripe checkout, order tracking, and an admin that runs the whole catalogue.',
    features: [
      'Shade swatches rendered from each variant’s real hex, on the card, the grid and the product page — with the photography switching to the shade you pick',
      'A catalogue you can search and filter by category, price and shade, plus a recommendation engine on every product',
      'Customer accounts with login-gated checkout, order history and two-way order tracking',
      'A cart that lives on the server, so it survives a closed tab and cannot be edited in the browser',
      'An admin for the entire catalogue: products, variants, shade hexes, per-shade photography, stock and the order pipeline',
      'A message centre that personalises replies to customers and notifies the admin the moment one is delivered',
      'Password reset by emailed link, with interchangeable Resend, SMTP and console mail drivers',
    ],
    engineering: [
      'The browser never states a price. Checkout posts { variantId, quantity } and nothing else, and one pricing service reads every figure back out of the database — shared by cart validation and checkout, so there is no second place a total can be computed. Money is integer cents everywhere it travels and only becomes a formatted string at the very edge.',
      'The database is remote, so every round trip is paid for twice — once on the way out and once on the way back. Each catalogue endpoint is exactly one SQL statement: a product’s variants and images arrive as aggregated JSON inside its own row, and the paginated list gets its rows and its total count from the same query through a window function. There is no N+1 anywhere in the read path, and a cache for the public catalogue sits in front of all of it.',
      'The storefront and the API are separate repositories that share one type-only contract package, imported by both as @contracts/*. It compiles to nothing, so neither side ships the other’s code, but renaming a field on the server breaks the client’s typecheck instead of a customer’s checkout.',
      'Shade swatches are the one place a runtime colour has to reach the DOM, and Tailwind v4 cannot generate a class for a hex that only exists in a database row — it silently emits nothing at all. Every hex enters through a single CSS custom property consumed by one class, which is also what makes the rule that no saturated colour appears anywhere in the chrome something you can actually enforce.',
      'The storefront is a Cloudflare Worker serving static assets. The API cannot be: it listens on a socket, opens raw TCP to Postgres and links a native image binary, none of which exist in that runtime. So it runs in Docker on an Oracle Cloud free-tier VM and is reached through the Worker — by a wildcard-DNS hostname, because a Worker cannot fetch a bare IP address, and on port 80, because it cannot fetch a non-standard port either.',
      'The browser never talks to the database; Express is the single trust boundary. Row-level security is enabled deny-all on every table, admin auth is a bcrypt hash exchanged for a JWT in an httpOnly SameSite=Strict cookie scoped to the admin routes, and the Stripe webhook is mounted on the raw body before any JSON parser — a global parser further up silently breaks signature verification.',
    ],
    metrics: [
      { value: '92', label: 'Tests, front end and back' },
      { value: '1', label: 'SQL round trip per endpoint' },
      { value: '42', label: 'Live shades, stocked and photographed' },
    ],
    stack: [
      'React 19',
      'TypeScript',
      'Vite',
      'Tailwind CSS v4',
      'TanStack Query',
      'Zustand',
      'Express 5',
      'Node.js',
      'PostgreSQL',
      'Supabase',
      'Stripe',
      'Docker',
      'Cloudflare Workers',
      'Oracle Cloud',
      'Playwright',
      'Vitest',
    ],
    repos: [
      { label: 'Frontend', url: 'https://github.com/FOFANA459-2023/RevelleBeauty' },
      { label: 'Backend', url: 'https://github.com/FOFANA459-2023/RevelleBeauty-Backend' },
    ],
    liveUrl: 'https://revellebeauty.fvarlee.workers.dev',
    liveLabel: 'Open the store',
    access:
      'Live and browsable end to end. Payments are the one thing not switched on — the checkout is wired for Stripe and waiting on the brand’s live keys.',
    shots: [
      {
        src: revelleHome,
        alt: 'The Revelle Beauty home page: the words BE YOU. BE BOLD. BE REVELLE. set large in a serif on cream, beside two photographs of the products being worn.',
        caption: 'Home — the brand, before the catalogue',
      },
      {
        src: revelleShop,
        alt: 'The Revelle Beauty catalogue: a search field, category and price filters, and a grid of product cards each showing its shade swatches and price.',
        caption: 'Catalogue — searchable and filterable by shade',
      },
      {
        src: revelleProduct,
        alt: 'A Revelle Beauty product page for High Shine Lip Oil, with a row of round shade swatches, a quantity stepper and an add-to-bag button.',
        caption: 'Product — swatches drawn from the real hex',
      },
    ],
    year: '2026',
    role: 'Software engineer — storefront, API, admin, deployment',
    status: 'live',
  },
]

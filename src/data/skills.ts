import type { SkillGroup } from '@/types'

/**
 * The stack, grouped by what it is for rather than by layer, and deliberately
 * finite. Everything listed here is used by a project in `projects.ts` —
 * nothing is here because it looked good in a list.
 *
 * `note` is what makes this section readable: a group of nine nouns says very
 * little on its own, and the line beside it says what they are actually for.
 */
export const skillGroups: SkillGroup[] = [
  {
    name: 'Interface',
    note: 'What I reach for first, and where most of my time goes.',
    items: [
      'React',
      'TypeScript',
      'JavaScript',
      'Next.js',
      'Tailwind CSS',
      'TanStack Query',
      'Zustand',
      'Motion',
      'Vite',
      'Accessibility',
    ],
  },
  {
    name: 'Services & data',
    note: 'APIs, schemas, and the things that have to stay correct under load.',
    items: [
      'Node.js',
      'Express',
      'Python',
      'Django REST Framework',
      'PostgreSQL',
      'Supabase',
      'Redis',
      'pgvector',
      'REST APIs',
      'Auth & RBAC',
      'Stripe',
    ],
  },
  {
    name: 'Delivery',
    note: 'How it ships, how it is tested, and how I find out when it breaks.',
    items: [
      'Git',
      'GitHub Actions',
      'Docker',
      'Cloudflare Workers',
      'Cloudflare Pages',
      'Oracle Cloud',
      'Playwright',
      'Vitest',
      'pytest',
    ],
  },
]

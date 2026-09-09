import type { MetaEntry, SocialLink } from '@/types'

/**
 * Identity and copy. Everything a visitor reads about the person — as opposed
 * to about a project — is here.
 *
 * `url` is the one place the production origin is written. index.html carries
 * its own copy in the canonical tag and the JSON-LD block, because those are
 * parsed before any JavaScript runs; if you change the domain, change it in
 * both places.
 */
export const site = {
  name: 'Varlee Fofana',
  fullName: 'Varlee Salia-Makulako Fofana',
  firstName: 'Varlee',
  lastName: 'Fofana',

  /** Sits under the name in the hero and in the page title. */
  role: 'Software Engineer',

  // TODO: replace once this is deployed. index.html carries its own copy in
  // the canonical tag and the JSON-LD block; keep the two in step.
  url: 'https://varleefofana.com',

  email: 'fvarlee@gmail.com',

  /** Served from `public/`, so the path is the filename. Kept capitalised
   *  because it is also the name the file lands under when downloaded. */
  resumeUrl: '/Varlee-Fofana-Resume.pdf',
  resumeFileName: 'Varlee-Fofana-Resume.pdf',

  available: true,
  availabilityLabel: 'Open to full-stack and frontend software engineering roles',

  /** The hero. Two sentences, no "passionate", no adjectives about himself. */
  positioning:
    'I build web products end to end: the data model, the API, and the interface people actually touch.',

  /** The About narrative. One paragraph, in his own words.
   *
   *  It does the thing a biography on a hiring page rarely does: it says what
   *  the two halves of his life have to do with each other, and then proves it
   *  with four specific engineering habits rather than an adjective. */
  bio: [
    'Full-stack software engineer building production web products end to end, and reading accounting and finance at Ritsumeikan Asia Pacific University. The two overlap directly in the systems I build. I price from the database rather than trusting the browser, keep derived data from drifting away from its source, put the trust boundary on the server, and let the tests prove it before anything ships.',
  ],

  /** The metadata rail beside the About narrative. Facts, not adjectives. */
  meta: [
    { term: 'Shipped', value: 'Live products, with people using them' },
    { term: 'Working in', value: 'TypeScript · React · Node · Python · PostgreSQL' },
    { term: 'Also', value: 'Django · Express · Docker · Cloudflare · Stripe' },
    { term: 'Studying', value: 'Accounting & Finance, Ritsumeikan APU' },
    { term: 'Open to', value: 'Full-stack and frontend engineering roles', highlight: true },
  ] satisfies MetaEntry[],

  socials: [
    { label: 'GitHub', url: 'https://github.com/FOFANA459-2023', icon: 'github' },
    {
      label: 'LinkedIn',
      url: 'https://www.linkedin.com/in/varlee-s-fofana-105375102/',
      icon: 'linkedin',
    },
    { label: 'Email', url: 'mailto:fvarlee@gmail.com', icon: 'mail' },
  ] satisfies SocialLink[],

  /** Order here is the order of the nav and of the page. The first entry is
   *  the hero, which the wordmark links to rather than the nav. */
  sections: [
    { id: 'top', label: 'Home' },
    { id: 'projects', label: 'Projects' },
    { id: 'about', label: 'About' },
    { id: 'contact', label: 'Contact' },
  ],
} as const


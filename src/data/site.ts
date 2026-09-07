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

  available: true,
  availabilityLabel: 'Open to software engineering roles — frontend and full-stack',

  /** The hero. Two sentences, no "passionate", no adjectives about himself. */
  positioning:
    'I build web products end to end — the data model, the API, and the interface people actually touch.',

  /** The About narrative. Three paragraphs, and no more than three.
   *
   *  Engineering and nothing else. No count of the projects — the section
   *  below names them, and a number in front of the work makes the work sound
   *  like a quantity rather than a body of it. */
  bio: [
    'I build web products end to end: a scholarship platform, a study assistant that answers from a real course, and an e-commerce storefront. On each one I wrote the schema, the API, the interface, the tests, and the deployment that puts it in front of people.',
    'That means the parts that are easy to skip did not get skipped. Authentication and role-based access. A pipeline that runs more than two hundred tests before anything reaches production. A checkout where the browser is never trusted with a price. Retrieval over a 216-page textbook that turned out to have no extractable text in it at all. Where a product needs a server, it runs on infrastructure I provisioned and still maintain.',
    'I am reading Accounting and Finance at Ritsumeikan Asia Pacific University, and I write software because it is the part I did not want to stop doing. I am looking for a software engineering role — frontend or full-stack — somewhere the code reaches real users, because that is the only kind I have written.',
  ],

  /** The metadata rail beside the About narrative. Facts, not adjectives. */
  meta: [
    { term: 'Shipped', value: 'Live products, with people using them' },
    { term: 'Working in', value: 'TypeScript · React · Node · Python · PostgreSQL' },
    { term: 'Also', value: 'Django · Express · Docker · Cloudflare · Stripe' },
    { term: 'Studying', value: 'Accounting & Finance, Ritsumeikan APU' },
    { term: 'Open to', value: 'Software engineering roles — frontend, full-stack', highlight: true },
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


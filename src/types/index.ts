/** A link to source code. A list rather than a pair of optional fields, so one
 *  repository, a split frontend/backend, a monorepo, or nothing at all (private
 *  work) are all the same shape with no conditional keys. */
export interface RepoLink {
  label: string
  url: string
}

/** How a project is running right now. Rendered as a labelled dot, never as
 *  a coloured card. */
export type ProjectStatus = 'live' | 'beta' | 'archived'

/** One screenshot of a running product. `src` is a bundler-resolved import, so
 *  a missing file is a build error rather than a broken image at runtime. */
export interface ProjectShot {
  src: string
  /** Describes what the capture shows, for anyone who cannot see it. */
  alt: string
  /** Shown under the frame as a caption, e.g. "Scholarship board". */
  caption: string
}

/** A single hard number about a project, shown on the showcase. Both halves are
 *  authored: there is no arithmetic here, so nothing can drift out of date
 *  silently — if a figure changes, it changes in the data file. */
export interface ProjectMetric {
  value: string
  label: string
}

export interface Project {
  id: string
  /** Display index, e.g. "01". Authored rather than derived from position so
   *  reordering the array never renumbers a project someone has linked to. */
  number: string
  title: string
  /** Two or three words. Sits opposite the title. */
  category: string
  /** One line, on the showcase. */
  summary: string
  /** What was wrong before the project existed. */
  problem: string
  /** What the project does about it. */
  solution: string
  /** What a user can actually do. Four to six, written as capabilities. */
  features: string[]
  /** Implementation notes worth reading — the "how", not the "what". */
  engineering: string[]
  /** Two or three figures worth stopping on. Every one has to be true of the
   *  shipped product and checkable from the repository. */
  metrics: ProjectMetric[]
  /** Ordered most-recognisable first; the showcase shows the first six. */
  stack: string[]
  repos: RepoLink[]
  liveUrl?: string
  /** Overrides the "Live demo" label where that would misdescribe the link,
   *  e.g. an invite-only product with a public front door. */
  liveLabel?: string
  /** Extra context under the live link, e.g. how access works. */
  access?: string
  /** First entry is the showcase preview; the rest appear in the case study. */
  shots: ProjectShot[]
  /** The host shown in the preview frame's address bar. Derived from liveUrl
   *  where there is one, so it can never drift out of sync. */
  domain?: string
  year: string
  role: string
  status: ProjectStatus
}

export interface SkillGroup {
  name: string
  /** One line on what this group is actually used for. */
  note: string
  items: string[]
}

export interface SocialLink {
  label: string
  url: string
  icon: 'github' | 'linkedin' | 'mail'
}

/** A single line in the About metadata rail. */
export interface MetaEntry {
  term: string
  value: string
  /** Draws the availability dot beside the value. One entry at most — it is
   *  the line a recruiter is scanning for, and two of them is none. */
  highlight?: boolean
}

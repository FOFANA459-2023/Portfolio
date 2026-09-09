import { describe, it, expect } from 'vitest'
import { projects } from './projects'
import { site } from './site'
import { skillGroups } from './skills'

/**
 * The editorial rules, enforced.
 *
 * Everything a visitor reads lives in this directory, which makes it the one
 * place a rule about the writing can actually be checked. These are the rules
 * that have been decided deliberately and would otherwise be undone by the
 * next person who edits a string without knowing about them.
 */

/** Every string a visitor can read, flattened out of the content files. */
function allCopy(): string[] {
  const strings: string[] = [
    site.role,
    site.positioning,
    site.availabilityLabel,
    ...site.bio,
    ...site.meta.flatMap((m) => [m.term, m.value]),
    ...skillGroups.flatMap((g) => [g.name, g.note, ...g.items]),
  ]

  for (const p of projects) {
    strings.push(
      p.title,
      p.category,
      p.summary,
      p.problem,
      p.solution,
      p.role,
      p.year,
      ...p.features,
      ...p.engineering,
      ...p.stack,
      ...p.metrics.flatMap((m) => [m.value, m.label]),
      ...p.shots.flatMap((s) => [s.alt, s.caption]),
    )
    if (p.access) strings.push(p.access)
  }

  return strings
}

describe('the writing', () => {
  it('contains no em or en dashes anywhere a visitor reads', () => {
    const offenders = allCopy().filter((s) => /[—–]/.test(s))
    expect(offenders).toEqual([])
  })

  it('describes the roles he wants, not the ones he does not', () => {
    const copy = allCopy().join(' ').toLowerCase()
    expect(copy).not.toMatch(/\bjunior\b/)
    expect(copy).not.toMatch(/\bintern(ship)?s?\b/)
    expect(copy).not.toMatch(/sole engineer/)
  })

  it('states no location for him', () => {
    // ChatTobira is a Japanese-course assistant, so the product copy says
    // "Japanese" legitimately. What must not appear is where he lives.
    const about = [site.positioning, ...site.bio, ...site.meta.map((m) => m.value)]
      .join(' ')
      .toLowerCase()
    for (const place of ['beppu', 'oita', 'liberia']) {
      expect(about).not.toContain(place)
    }
  })

  it('never counts the projects, which would make the work sound like a quantity', () => {
    const copy = [site.positioning, ...site.bio].join(' ').toLowerCase()
    expect(copy).not.toMatch(/\b(three|3)\s+(products|projects|things)\b/)
  })
})

describe('projects', () => {
  it('has a unique id and display number for each one', () => {
    expect(new Set(projects.map((p) => p.id)).size).toBe(projects.length)
    expect(new Set(projects.map((p) => p.number)).size).toBe(projects.length)
  })

  it('numbers them in the order they are shown', () => {
    expect(projects.map((p) => p.number)).toEqual(
      projects.map((_, i) => String(i + 1).padStart(2, '0')),
    )
  })

  it('gives every one two or three checkable figures', () => {
    for (const p of projects) {
      expect(p.metrics.length, p.id).toBeGreaterThanOrEqual(2)
      expect(p.metrics.length, p.id).toBeLessThanOrEqual(3)
      for (const m of p.metrics) {
        expect(m.value.trim(), p.id).not.toBe('')
        expect(m.label.trim(), p.id).not.toBe('')
      }
    }
  })

  it('describes every screenshot for someone who cannot see it', () => {
    for (const p of projects) {
      expect(p.shots.length, p.id).toBeGreaterThan(0)
      for (const shot of p.shots) {
        expect(shot.src, p.id).toBeTruthy()
        // Long enough to be a description rather than a filename.
        expect(shot.alt.length, `${p.id}: ${shot.alt}`).toBeGreaterThan(30)
        expect(shot.caption.trim(), p.id).not.toBe('')
      }
    }
  })

  it('only ever links out over https', () => {
    const urls = projects.flatMap((p) => [...p.repos.map((r) => r.url), p.liveUrl ?? ''])
    for (const url of urls.filter(Boolean)) {
      expect(url, url).toMatch(/^https:\/\//)
    }
  })

  it('lists a stack for each one, with no duplicates inside it', () => {
    for (const p of projects) {
      expect(p.stack.length, p.id).toBeGreaterThan(3)
      expect(new Set(p.stack).size, p.id).toBe(p.stack.length)
    }
  })
})

describe('site', () => {
  it('points the resume at a file the build actually serves', () => {
    expect(site.resumeUrl.startsWith('/')).toBe(true)
    expect(site.resumeUrl.endsWith('.pdf')).toBe(true)
  })

  it('has a highlighted fact, and only one', () => {
    expect(site.meta.filter((m) => m.highlight)).toHaveLength(1)
  })

  it('links every social over https', () => {
    for (const s of site.socials) {
      if (s.url.startsWith('mailto:')) continue
      expect(s.url, s.label).toMatch(/^https:\/\//)
    }
  })
})

describe('skills', () => {
  it('names nothing twice across the groups', () => {
    const all = skillGroups.flatMap((g) => g.items)
    expect(new Set(all).size).toBe(all.length)
  })

  it('explains what each group is for', () => {
    for (const g of skillGroups) {
      expect(g.note.length, g.name).toBeGreaterThan(20)
      expect(g.items.length, g.name).toBeGreaterThan(3)
    }
  })
})

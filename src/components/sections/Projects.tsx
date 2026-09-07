import { useState } from 'react'
import { AnimatePresence } from 'motion/react'
import { projects } from '@/data/projects'
import type { Project } from '@/types'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { ProjectIndex } from './ProjectIndex'
import { ProjectShowcase } from './ProjectShowcase'
import { CaseStudy } from './CaseStudy'

/**
 * The second band: charcoal. The centre of the page.
 *
 * Three projects, each given a full stretch of the page rather than a cell in a
 * grid. A three-up grid of cards makes every project look like a weekend, and
 * two of these are running in production.
 *
 * The index above them is the concession to the reader who has not decided to
 * read yet: the full treatment costs three screens of scrolling before the
 * third project is even named, and someone assessing this for a role wants all
 * three named in the first one.
 */
export function Projects() {
  const [selected, setSelected] = useState<Project | null>(null)

  return (
    <Section id="projects" band="dark">
      <SectionHeading
        label="Projects"
        title={['Products', 'in production.']}
        lede="Each of these is live, with people using it, and opens into a case study — the problem, what I built, and the parts that turned out to be harder than they look."
        className="mb-12 sm:mb-14"
      />

      <ProjectIndex projects={projects} />

      <div className="mt-24 flex flex-col gap-28 sm:mt-28 sm:gap-36">
        {projects.map((project, i) => (
          <ProjectShowcase
            key={project.id}
            project={project}
            index={i}
            onOpen={setSelected}
          />
        ))}
      </div>

      <AnimatePresence>
        {selected && <CaseStudy project={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </Section>
  )
}

import { MotionConfig } from 'motion/react'

import { useLenis } from '@/hooks/useLenis'
import { Nav } from '@/components/layout/Nav'
import { Footer } from '@/components/layout/Footer'
import { Hero } from '@/components/sections/Hero'
import { Projects } from '@/components/sections/Projects'
import { About } from '@/components/sections/About'
import { Contact } from '@/components/sections/Contact'

/**
 * Four bands: paper, charcoal, paper, charcoal, each fading in from the one
 * above it. That alternation is the structure —
 * it is what separates the sections, so none of them needs a divider, a
 * background effect or a decorative rule to announce itself.
 *
 * There is no preloader and no custom cursor here any more. Both were the kind
 * of thing that reads as craft for about two seconds and as a delay on every
 * visit after that; the first screen now paints as soon as it can.
 */
export default function App() {
  useLenis()

  return (
    // reducedMotion="user" makes every Motion animation on the page respect the
    // OS setting without a branch at each call site.
    <MotionConfig reducedMotion="user">
      <a
        href="#projects"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-300 focus:rounded-full focus:bg-[#211f1b] focus:px-5 focus:py-3 focus:text-[0.9375rem] focus:text-[#f0ece4]"
      >
        Skip to the projects
      </a>

      <Nav />

      <main id="main">
        <Hero />
        <Projects />
        <About />
        <Contact />
      </main>

      <Footer />
    </MotionConfig>
  )
}

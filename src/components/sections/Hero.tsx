import { motion } from 'motion/react'
import { site } from '@/data/site'
import { AnimatedText } from '@/components/ui/AnimatedText'
import { Button } from '@/components/ui/Button'
import { ArrowDownIcon, DownloadIcon } from '@/components/ui/Icons'
import { scrollToSection } from '@/lib/scroll'
import portrait from '@/assets/portrait.webp'

const rise = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] as const } },
}

/**
 * The first band: paper.
 *
 * Two decisions carry this screen.
 *
 * The portrait is a cut-out, so it is placed as one — no card, no rounded box,
 * no panel behind it. It was previously sitting in a `bg-bg-2` rectangle that
 * differed from the paper by about three percent of lightness, which read as a
 * stray grey shape with a man floating in the middle of it. Standing the
 * cut-out directly on the closing rule instead means the photograph belongs to
 * the page rather than being pasted onto it.
 *
 * And the screen closes on a rule with a line of facts on it. A full-height
 * hero whose content is vertically centred leaves a large dead area underneath;
 * giving the bottom something to hold makes the whole screen read as composed
 * rather than as unfinished.
 */
export function Hero() {
  return (
    <section id="top" data-band="light" className="relative overflow-clip bg-bg text-fg">
      <div className="hero-atmosphere" aria-hidden />
      <div className="hero-grid" aria-hidden />
      <div className="relative shell flex min-h-[100svh] flex-col pt-28 sm:pt-32 lg:pt-36">
        <motion.div
          className="flex flex-1"
          initial="hidden"
          animate="visible"
          variants={{ hidden: {}, visible: { transition: { delayChildren: 0.1, staggerChildren: 0.1 } } }}
        >
          {/* The two columns are anchored to opposite ends: the text sits under
              the header, the cut-out stands on the closing rule, and the slack
              between them lives in the middle of the composition rather than
              pooling as a quarter-screen of dead space above everything — which
              is what a single `items-end` on the row produced. */}
          <div className="grid w-full gap-12 lg:grid-cols-12 lg:gap-8">
            <div className="min-w-0 lg:col-span-7">
              <motion.p className="label kicker mb-7" variants={rise}>
                {site.role}
              </motion.p>

              <AnimatedText
                as="h1"
                ariaLabel={`${site.name}, ${site.role}`}
                lines={[
                  site.firstName,
                  <em key="last" className="italic">
                    {site.lastName}
                  </em>,
                ]}
                className="display-1"
                trigger="mount"
                delay={0.15}
                stagger={0.1}
              />

              <motion.p className="prose-body mt-8 max-w-[44ch]" variants={rise}>
                {site.positioning}
              </motion.p>

              {/* Two actions, and only two. The work is the primary one; the
                  resume is here because a recruiter often wants the file
                  before they want the tour, and making them hunt for it is a
                  way of losing them. "Get in touch" is deliberately not here:
                  it is the same words as the button in the header, about sixty
                  pixels up and to the right. */}
              <motion.div className="mt-10 flex flex-wrap items-center gap-3" variants={rise}>
                <Button onClick={() => scrollToSection('projects')} icon={<ArrowDownIcon />}>
                  See the projects
                </Button>

                <Button
                  variant="line"
                  href={site.resumeUrl}
                  download={site.resumeFileName}
                  icon={<DownloadIcon />}
                  aria-label="Download my resume as a PDF"
                >
                  Resume
                </Button>
              </motion.div>
            </div>

            {/* The cut-out stands on the closing rule.

                Not `self-end`: that shrinks the item to its content and aligns
                it to the bottom of the *row*, and an auto-sized row is only as
                tall as its tallest item — so it lands wherever the text column
                happens to end. Leaving the item stretched (the grid default)
                and pushing the image down inside it with flex anchors it to the
                bottom of the section instead, which is where the rule is. */}
            <motion.div
              className="min-w-0 lg:col-span-4 lg:col-start-9 lg:flex lg:h-full lg:items-end lg:justify-end"
              variants={{
                hidden: { opacity: 0, y: 28 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 1.2, delay: 0.25, ease: [0.16, 1, 0.3, 1] },
                },
              }}
            >
              <div className="portrait-halo mx-auto w-full max-w-[17rem] sm:max-w-[20rem] lg:mx-0 lg:ml-auto lg:max-w-[23.5rem]">
                <img
                  src={portrait}
                  alt={site.fullName}
                  width={325}
                  height={450}
                  fetchPriority="high"
                  decoding="async"
                  className="mx-auto block w-full"
                />
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Closing rule. Three readings and a scroll cue — the same register the
            rest of the page is written in. */}
        <motion.div
          className="mt-auto flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-line/80 py-5 backdrop-blur-[2px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.9 }}
        >
          {site.available && (
            <span className="flex items-center gap-2.5">
              <span className="relative flex h-1.5 w-1.5" aria-hidden>
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
              </span>
              <span className="label text-fg-soft">{site.availabilityLabel}</span>
            </span>
          )}
          <span aria-hidden className="hidden h-3 w-px bg-line sm:block" />
          <span className="label">Products in production</span>
          <span aria-hidden className="ml-auto hidden h-px flex-1 bg-line sm:block" />
          <span className="label hidden items-center gap-2 sm:flex">
            Scroll
            <motion.span
              aria-hidden
              className="block h-3 w-px bg-fg-faint"
              animate={{ scaleY: [0.3, 1, 0.3], originY: 0 }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            />
          </span>
        </motion.div>
      </div>
    </section>
  )
}

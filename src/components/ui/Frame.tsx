import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import type { ProjectShot } from '@/types'
import { cn } from '@/lib/cn'

interface FrameProps {
  shot?: ProjectShot
  /** One line printed on the mount above the image — the address of the thing
   *  being shown, or what the capture is of. */
  caption?: string | null
  /** Rendered in place of an image when a project has no capture. */
  children?: ReactNode
  /** True for a frame above the fold; everything else loads lazily. */
  priority?: boolean
  className?: string
  aspect?: string
}

/**
 * A product screenshot, mounted.
 *
 * The mount is the point. These captures are of light interfaces, and on the
 * dark band a bare screenshot is a 1200px slab of near-white meeting the dark
 * ground at a hard edge — by some margin the loudest thing on the page, and the
 * reason the projects section felt like it was shouting. A raised surround at
 * `bg-bg-2` puts one intermediate value between the two, so the eye steps from
 * ground to mount to screen instead of falling off a cliff.
 *
 * It also earns its keep by carrying the address. That is the thing a browser
 * chrome was drawn around the image to say, said in one line instead of three
 * rows of fake furniture.
 *
 * The reveal is a single transform: the image sits slightly oversized and
 * settles to true scale inside its clipping box. Scale is compositor-only, so
 * it costs nothing per frame, and `reducedMotion="user"` removes it entirely.
 *
 * The image carries its intrinsic dimensions, so the box reserves its exact
 * height before the file arrives and nothing on the page shifts while it loads.
 */
export function Frame({
  shot,
  caption,
  children,
  priority = false,
  className,
  aspect = 'aspect-[16/10]',
}: FrameProps) {
  return (
    <figure className={cn('rounded-2xl bg-bg-2 p-3 shadow-[0_20px_50px_-28px_oklch(0.15_0.03_50_/_0.7)] sm:p-5 lg:p-6', className)}>
      {caption && (
        <figcaption className="label px-1 pb-4 pt-0.5">{caption}</figcaption>
      )}

      <div className={cn('relative overflow-hidden rounded-xl bg-bg ring-1 ring-line-soft', aspect)}>
        {shot ? (
          <motion.img
            src={shot.src}
            alt={shot.alt}
            width={1600}
            height={1000}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            fetchPriority={priority ? 'high' : 'auto'}
            className="h-full w-full object-cover object-top"
            initial={{ scale: 1.08 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          />
        ) : (
          children
        )}
      </div>
    </figure>
  )
}

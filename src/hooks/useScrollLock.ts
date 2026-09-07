import { useEffect } from 'react'
import { pauseScroll, resumeScroll } from '@/lib/scroll'

/**
 * Freezes the page behind an overlay without the layout shift you get from a
 * plain `overflow: hidden` — the scrollbar's width is replaced with padding.
 */
export function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return

    const { body, documentElement: html } = document
    const prevBodyOverflow = body.style.overflow
    const prevHtmlOverflow = html.style.overflow
    const prevPadding = body.style.paddingRight
    const gap = window.innerWidth - html.clientWidth

    pauseScroll()
    html.style.overflow = 'hidden'
    body.style.overflow = 'hidden'
    if (gap > 0) body.style.paddingRight = `${gap}px`

    return () => {
      html.style.overflow = prevHtmlOverflow
      body.style.overflow = prevBodyOverflow
      body.style.paddingRight = prevPadding
      resumeScroll()
    }
  }, [locked])
}

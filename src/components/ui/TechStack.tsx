import { cn } from '@/lib/cn'

type Size = 'sm' | 'md'

interface TechStackProps {
  items: string[]
  /** Show at most this many, then a "+N" marker. Omit to show all of them. */
  limit?: number
  /** `sm` in a column, `md` where the stack is a headline fact. */
  size?: Size
  className?: string
}

const sizes: Record<Size, string> = {
  sm: 'px-2.5 py-1 text-[0.75rem] text-fg-soft',
  md: 'px-3 py-1.5 text-[0.8125rem] text-fg',
}

/**
 * A stack, set as chips.
 *
 * This was a dot-separated line of running text for a while, on the argument
 * that nine pills is nine boxes to scan while nine words is one line to read.
 * That argument is right about reading and wrong about this page. Nobody reads
 * a stack — a recruiter scans it for the two or three names they came looking
 * for, and a name set in soft grey inside a sentence is exactly the thing an
 * eye skimming at speed slides off. A chip has an edge, so it can be found
 * without being read.
 *
 * Still no logos. The moment a stack becomes a row of brand icons it stops
 * being information about the project and becomes decoration with somebody
 * else's art direction in it.
 *
 * A list, because it is one: `whitespace-nowrap` so a chip never breaks inside
 * "Django REST Framework", and the ground is `bg-bg-2` so the chips sit right
 * on either band without a single `dark:` variant.
 */
export function TechStack({ items, limit, size = 'sm', className }: TechStackProps) {
  const shown = limit ? items.slice(0, limit) : items
  const overflow = limit ? items.length - shown.length : 0

  return (
    <ul className={cn('flex flex-wrap gap-1.5', className)}>
      {shown.map((item) => (
        <li
          key={item}
          className={cn(
            'whitespace-nowrap rounded-full border border-line bg-bg-2',
            sizes[size],
          )}
        >
          {item}
        </li>
      ))}

      {overflow > 0 && (
        <li
          className={cn(
            'whitespace-nowrap rounded-full border border-dashed border-line text-fg-faint',
            sizes[size],
          )}
        >
          +{overflow} more
        </li>
      )}
    </ul>
  )
}

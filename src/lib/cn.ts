/** Minimal class joiner — enough for this codebase without pulling in clsx. */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ')
}

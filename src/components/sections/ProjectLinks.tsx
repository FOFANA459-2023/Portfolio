import type { Project } from '@/types'
import { ExternalLink } from '@/components/ui/ExternalLink'
import { LockIcon } from '@/components/ui/Icons'
import { cn } from '@/lib/cn'

interface ProjectLinksProps {
  project: Project
  size?: 'sm' | 'md'
  className?: string
}

/**
 * A project's outbound links, in one order everywhere: where to use it, then
 * where to read it.
 *
 * A project with no public repository says "Private repository" rather than
 * quietly omitting the row. The absence is information, and a dead or invented
 * GitHub link would be worse than either.
 */
export function ProjectLinks({ project, size = 'md', className }: ProjectLinksProps) {
  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {project.liveUrl && (
        <ExternalLink
          href={project.liveUrl}
          variant="solid"
          size={size}
          label={`${project.liveLabel ?? 'Live demo'} — ${project.title}`}
        >
          {project.liveLabel ?? 'Live demo'}
        </ExternalLink>
      )}

      {project.repos.length > 0 ? (
        project.repos.map((repo) => (
          <ExternalLink
            key={repo.url}
            href={repo.url}
            size={size}
            label={`${repo.label} repository — ${project.title}`}
          >
            {repo.label}
          </ExternalLink>
        ))
      ) : (
        <span
          className={cn(
            'inline-flex items-center gap-2 rounded-full border border-line text-fg-faint',
            size === 'sm' ? 'px-4 py-2 text-[0.8125rem]' : 'px-5 py-2.5 text-[0.9375rem]',
          )}
        >
          <LockIcon className="h-3.5 w-3.5" />
          Private repository
        </span>
      )}
    </div>
  )
}

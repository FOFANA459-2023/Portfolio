import type { ProjectStatus } from '@/types'

/** How a project's status is worded wherever it is shown. One map, so the
 *  showcase and the case study can never disagree about what "beta" is called. */
export const statusCopy: Record<ProjectStatus, string> = {
  live: 'Live',
  beta: 'In beta',
  archived: 'Archived',
}

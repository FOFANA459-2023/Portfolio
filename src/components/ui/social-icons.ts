import { GitHubIcon, LinkedInIcon, MailIcon } from './Icons'
import type { SocialLink } from '@/types'

/** Maps a social link's `icon` key to its component. Kept apart from Icons.tsx
 *  so that file exports only components and fast refresh keeps working. */
export const socialIcons: Record<SocialLink['icon'], typeof GitHubIcon> = {
  github: GitHubIcon,
  linkedin: LinkedInIcon,
  mail: MailIcon,
}

import BrandBadge from '@/components/BrandComponents/utils/BrandBadge'
import { H2 } from '@/components/typography/TypographyH2'
import { Lead } from '@/components/typography/Lead'
import { cn } from '@/lib/utils/className'
import { compareModelsTheme } from '../utils/compareModelsTheme'

type CompareModelsSectionHeaderProps = {
  badgeLabel: string
  badgeTone?: 'secondary' | 'neutral'
  headingId: string
  heading: string
  lead: string
  align?: 'center' | 'left'
  surface?: 'light' | 'dark'
  className?: string
}

export function CompareModelsSectionHeader({
  badgeLabel,
  badgeTone = 'secondary',
  headingId,
  heading,
  lead,
  align = 'center',
  surface = 'light',
  className
}: CompareModelsSectionHeaderProps) {
  const isCentered = align === 'center'
  const textClass =
    surface === 'dark' ?
      'text-sidebar-foreground/90'
    : compareModelsTheme.bodyMuted

  return (
    <div
      className={cn(
        isCentered ?
          'mx-auto w-full max-w-3xl px-4 text-center md:max-w-4xl'
        : 'max-w-6xl',
        className
      )}
    >
      <BrandBadge
        label={badgeLabel}
        tone={badgeTone}
        className='mb-6 px-6 py-3 text-sm'
      />
      <H2
        ID={headingId}
        className={cn(
          surface === 'dark' ? 'text-sidebar-foreground' : 'text-foreground',
          isCentered && 'mx-auto md:max-w-3xl'
        )}
      >
        {heading}
      </H2>
      <Lead
        Text={lead}
        className={cn(
          'utekos-section-lead mt-6 max-w-2xl pb-0!',
          textClass,
          isCentered && 'mx-auto md:max-w-3xl lg:max-w-4xl'
        )}
      />
    </div>
  )
}

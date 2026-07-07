import type { ComponentType, ReactNode } from 'react'
import Image, { type StaticImageData } from 'next/image'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { cn } from '@/lib/utils/className'

type FeatureCardIcon = ComponentType<{ className?: string }>

type ImageAspect = '4/3' | '16/10' | 'video' | 'square'
type CardDensity = 'media' | 'standard' | 'compact'
type FooterMode = 'bottom' | 'flow'

const imageAspectClassName = {
  '4/3': 'aspect-[4/3]',
  '16/10': 'aspect-[16/10]',
  video: 'aspect-video',
  square: 'aspect-square'
} satisfies Record<ImageAspect, string>

const densityClassName = {
  media: 'h-full min-h-[31rem]',
  standard: 'h-full min-h-72',
  compact: 'h-auto min-h-0'
} satisfies Record<CardDensity, string>

const contentDensityClassName = {
  media: 'grow px-7 pt-5 pb-6',
  standard: 'grow px-7 pt-5 pb-6',
  compact: 'px-7 pt-5 pb-5'
} satisfies Record<CardDensity, string>

const footerModeClassName = {
  bottom: 'mt-auto',
  flow: 'mt-0'
} satisfies Record<FooterMode, string>

type InspirationFeatureCardFooterProps = {
  className?: string
  footerMode?: FooterMode
  label?: ReactNode
  labelClassName?: string
  value?: ReactNode
  valueClassName?: string
}

export function InspirationFeatureCardFooter({
  className,
  footerMode = 'bottom',
  label,
  labelClassName,
  value,
  valueClassName
}: InspirationFeatureCardFooterProps) {
  return (
    <CardFooter
      className={cn(
        'relative z-10 rounded-none border-t border-card-foreground/10 px-7 py-5',
        footerModeClassName[footerMode],
        className
      )}
    >
      <p className='flex w-full items-center justify-between gap-4 text-[0.68rem] leading-none font-semibold tracking-[0.16em] uppercase'>
        <span className={cn('text-card-foreground/55', labelClassName)}>
          {label}
        </span>
        <span
          className={cn(
            'text-right text-card-foreground',
            valueClassName
          )}
        >
          {value}
        </span>
      </p>
    </CardFooter>
  )
}

export function InspirationFeatureCard({
  backgroundSlot,
  className,
  contentClassName,
  density = 'standard',
  description,
  descriptionClassName,
  footer,
  footerClassName,
  footerLabel,
  footerLabelClassName,
  footerMode = 'bottom',
  footerValue,
  footerValueClassName,
  headerClassName,
  icon: Icon,
  iconClassName,
  iconContainerClassName,
  image,
  imageAlt,
  imageAspect = '4/3',
  imageClassName,
  imageContainerClassName,
  imageOverlayClassName,
  imagePriority = false,
  imageSizes = '(min-width: 1280px) 384px, (min-width: 768px) 33vw, 100vw',
  title,
  titleClassName,
  titleContainerClassName
}: {
  backgroundSlot?: ReactNode
  className?: string
  contentClassName?: string
  density?: CardDensity
  description?: ReactNode
  descriptionClassName?: string
  footer?: ReactNode
  footerClassName?: string
  footerLabel?: ReactNode
  footerLabelClassName?: string
  footerMode?: FooterMode
  footerValue?: ReactNode
  footerValueClassName?: string
  headerClassName?: string
  icon?: FeatureCardIcon
  iconClassName?: string
  iconContainerClassName?: string
  image?: StaticImageData
  imageAlt?: string
  imageAspect?: ImageAspect
  imageClassName?: string
  imageContainerClassName?: string
  imageOverlayClassName?: string
  imagePriority?: boolean
  imageSizes?: string
  title: ReactNode
  titleClassName?: string
  titleContainerClassName?: string
}) {
  const resolvedImageAlt =
    imageAlt ?? (typeof title === 'string' ? title : '')

  const hasDescription =
    description !== undefined && description !== null

  const hasFooter =
    footer !== undefined ||
    footerLabel !== undefined ||
    footerValue !== undefined

  return (
    <Card
      size='sm'
      className={cn(
        'group @container relative isolate flex overflow-hidden rounded-3xl border p-0 shadow-[0_24px_80px_-52px_color-mix(in_oklch,var(--foreground)_72%,transparent)] ring-1 ring-foreground/10 transition-all duration-300 ease-out [--card-spacing:0rem] motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-[0_32px_96px_-56px_color-mix(in_oklch,var(--foreground)_86%,transparent)]',
        densityClassName[density],
        className
      )}
    >
      {image ?
        <div
          className={cn(
            'relative w-full overflow-hidden',
            imageAspectClassName[imageAspect],
            imageContainerClassName
          )}
        >
          <Image
            src={image}
            alt={resolvedImageAlt}
            fill
            priority={imagePriority}
            placeholder='blur'
            sizes={imageSizes}
            className={cn(
              'object-cover object-center transition-transform duration-700 ease-out motion-safe:group-hover:scale-105',
              imageClassName
            )}
          />

          <div
            className={cn(
              'absolute inset-0 bg-[linear-gradient(180deg,transparent_36%,color-mix(in_oklch,var(--card)_88%,transparent)_100%)]',
              imageOverlayClassName
            )}
            aria-hidden='true'
          />

          <div
            className='absolute inset-x-0 bottom-0 h-px bg-card-foreground/16'
            aria-hidden='true'
          />
        </div>
      : null}

      {backgroundSlot ?
        <div
          className='pointer-events-none absolute inset-0 z-0'
          aria-hidden='true'
        >
          {backgroundSlot}
        </div>
      : null}

      <CardHeader
        className={cn(
          'relative z-10 flex min-w-0 flex-row items-center gap-4 rounded-none px-7 pt-6 pb-0',
          headerClassName
        )}
      >
        {Icon ?
          <span
            className={cn(
              'relative flex size-12 shrink-0 items-center justify-center rounded-2xl border border-border/70 shadow-[inset_0_1px_0_color-mix(in_oklch,var(--background)_38%,transparent)] ring-1 ring-card-foreground/10 transition-transform duration-300 motion-safe:group-hover:-translate-y-0.5',
              iconContainerClassName
            )}
            aria-hidden='true'
          >
            <span className='absolute inset-0 rounded-2xl bg-card-foreground/10 opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-100' />
            <Icon
              className={cn(
                'relative size-6 transition-colors duration-300',
                iconClassName
              )}
            />
          </span>
        : null}

        <CardTitle
          className={cn(
            'min-w-0 flex-1 text-inherit',
            titleContainerClassName
          )}
        >
          <h3
            className={cn(
              'flex min-h-12 items-center text-xl leading-tight font-bold tracking-tight text-card-foreground md:text-lg xl:text-xl',
              titleClassName
            )}
          >
            <span className='block min-w-0 break-words'>{title}</span>
          </h3>
        </CardTitle>
      </CardHeader>

      <CardContent
        className={cn(
          'relative z-10 text-inherit',
          contentDensityClassName[density],
          contentClassName
        )}
      >
        {hasDescription ?
          typeof description === 'string' ?
            <p
              className={cn(
                'max-w-[36ch] text-sm leading-relaxed tracking-[-0.02em] text-card-foreground/78',
                descriptionClassName
              )}
            >
              {description}
            </p>
          : description
        : null}
      </CardContent>

      {hasFooter ?
        footer ?
          <CardFooter
            className={cn(
              'relative z-10 rounded-none border-t border-card-foreground/10 px-7 py-5',
              footerModeClassName[footerMode],
              footerClassName
            )}
          >
            {footer}
          </CardFooter>
        : <InspirationFeatureCardFooter
            className={footerClassName ?? ''}
            footerMode={footerMode}
            label={footerLabel}
            labelClassName={footerLabelClassName ?? ''}
            value={footerValue}
            valueClassName={footerValueClassName ?? ''}
          />
      : null}
    </Card>
  )
}
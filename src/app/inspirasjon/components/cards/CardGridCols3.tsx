import type { CSSProperties } from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils/className'
import {
  Card,
  CardBadge,
  CardContent,
  CardDescription,
  CardHeader,
  CardIcon,
  CardTitle
} from './Card'
import { CardGridCols3Motion } from './CardGridCols3Motion'
import styles from './CardGridCols3.module.css'

const FALLBACK_BADGES = ['Start', 'Nyt', 'Forleng'] as const

export interface CardGridCols3Item {
  title: string
  description: string
  icon: LucideIcon
  badge?: string
  surface?: string
  border?: string
  shadow?: string
  marker?: string
  glow?: string | null
  sheen?: boolean
  iconSurface?: string
  iconColor?: string
  iconBorder?: string
  titleColor?: string
  descriptionColor?: string
  cardClassName?: string
  iconClassName?: string
  titleClassName?: string
  descriptionClassName?: string
  badgeClassName?: string
  contentClassName?: string
}

export interface CardGridCols3Props {
  items: readonly CardGridCols3Item[]
  heading: string
  headingId: string
  className?: string
  gridClassName?: string
  itemClassName?: string
  align?: 'left' | 'center'
  motion?: boolean
}

export function CardGridCols3({
  items,
  heading,
  headingId,
  className,
  gridClassName,
  itemClassName,
  align = 'left',
  motion = true
}: CardGridCols3Props) {
  const cards = items.map((item, index) => {
    const fallbackBadge = FALLBACK_BADGES[index % FALLBACK_BADGES.length] ?? FALLBACK_BADGES[0]

    return (
      <CardGridCols3Card
        key={`${item.title}-${index}`}
        item={item}
        badge={item.badge ?? fallbackBadge}
      />
    )
  })

  return (
    <div className={cn(styles.root, className)}>
      <h2 id={headingId} className='sr-only'>
        {heading}
      </h2>

      {motion ?
        <CardGridCols3Motion
          labelledBy={headingId}
          className={cn(styles.grid, align === 'center' && 'text-left', gridClassName)}
          itemClassName={cn(styles.item, itemClassName)}
        >
          {cards}
        </CardGridCols3Motion>
      : <ul
          aria-labelledby={headingId}
          className={cn(styles.grid, align === 'center' && 'text-left', gridClassName)}
        >
          {cards.map((card, index) => (
            <li key={`card-grid-cols-3-static-${index}`} className={cn(styles.item, itemClassName)}>
              {card}
            </li>
          ))}
        </ul>
      }
    </div>
  )
}

function CardGridCols3Card({
  item,
  badge
}: {
  item: CardGridCols3Item
  badge: string
}) {
  const {
    title,
    description,
    icon: Icon,
    surface,
    border,
    shadow,
    marker,
    glow,
    sheen,
    iconSurface,
    iconColor,
    iconBorder,
    titleColor,
    descriptionColor,
    cardClassName,
    iconClassName,
    titleClassName,
    descriptionClassName,
    badgeClassName,
    contentClassName
  } = item

  const cardStyle: CSSProperties = {
    ...(surface !== undefined ? { background: surface } : {}),
    ...(border !== undefined ? { borderColor: border } : {}),
    ...(shadow !== undefined ? { boxShadow: shadow } : {})
  }

  const iconStyle: CSSProperties = {
    ...(iconSurface !== undefined ? { backgroundColor: iconSurface } : {}),
    ...(iconBorder !== undefined || border !== undefined ? { borderColor: iconBorder ?? border } : {}),
    ...(iconColor !== undefined ? { color: iconColor } : {})
  }

  const titleStyle: CSSProperties | undefined =
    titleColor !== undefined ? { color: titleColor } : undefined

  const descriptionStyle: CSSProperties | undefined =
    descriptionColor !== undefined ? { color: descriptionColor } : undefined

  const badgeColor = titleColor ?? descriptionColor
  const badgeStyle: CSSProperties | undefined =
    badgeColor !== undefined ? { color: badgeColor } : undefined

  return (
    <Card
      size='sm'
      className={cn('ring-0 py-0', styles.card, cardClassName)}
      style={cardStyle}
    >
      {glow ?
        <div
          className={styles.glow}
          style={{ background: glow }}
          aria-hidden='true'
        />
      : null}

      {sheen ? <div className={styles.sheen} aria-hidden='true' /> : null}

      {marker ?
        <span
          className={styles.marker}
          style={{ background: marker }}
          aria-hidden='true'
        />
      : null}

      <CardContent className={cn(styles.content, contentClassName)}>
        <CardHeader className={styles.header}>
          <div className={styles.topLine}>
            <CardIcon className={cn(styles.iconBox, iconClassName)} style={iconStyle}>
              <Icon className={styles.icon} aria-hidden='true' focusable='false' />
            </CardIcon>

            <div className={styles.copyStack}>
              <CardBadge
                variant='outline'
                className={cn(styles.badge, badgeClassName)}
                {...(badgeStyle !== undefined ? { style: badgeStyle } : {})}
              >
                {badge}
              </CardBadge>
              <CardTitle as='h3' className={cn(styles.title, titleClassName)} style={titleStyle}>
                {title}
              </CardTitle>
            </div>
          </div>

          <CardDescription
            as='p'
            className={cn(styles.description, descriptionClassName)}
            style={descriptionStyle}
          >
            {description}
          </CardDescription>
        </CardHeader>
      </CardContent>
    </Card>
  )
}

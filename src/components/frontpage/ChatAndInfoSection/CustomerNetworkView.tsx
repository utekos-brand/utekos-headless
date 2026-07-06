import Image from 'next/image'
import UtekosLogo from '@public/icon.png'
import {
  iconMap,
  type IconName
} from '@/components/frontpage/components/initialElements'
import type { CustomerNetworkViewProps } from 'types/flow.types'
import { InlineText } from '@/components/typography/TypographyInlineText'

function IconRenderer({
  name,
  className,
  style
}: {
  name: IconName
  className?: string
  style?: React.CSSProperties
}) {
  const Icon = iconMap[name]

  return Icon ?
      <Icon
        aria-hidden='true'
        className={className}
        style={style}
      />
    : null
}

export function CustomerNetworkView({
  nodes,
  edges,
  centerNode
}: CustomerNetworkViewProps) {
  const benefitNodes = nodes.filter(
    node => node.type !== 'center'
  )

  return (
    <div className='relative mx-auto aspect-square w-full max-w-130'>
      <svg
        width='100%'
        height='100%'
        viewBox='0 0 520 520'
        aria-hidden='true'
        className='absolute inset-0 overflow-visible'
      >
        {edges.map(edge => {
          const sourceNode = nodes.find(
            node => node.id === edge.sourceId
          )
          const targetNode = nodes.find(
            node => node.id === edge.targetId
          )

          if (!sourceNode || !targetNode) return null

          const sourceX =
            sourceNode.position.x + sourceNode.width / 2
          const sourceY =
            sourceNode.position.y + sourceNode.height / 2
          const targetX =
            targetNode.position.x + targetNode.width / 2
          const targetY =
            targetNode.position.y + targetNode.height / 2

          const midX = (sourceX + targetX) / 2
          const midY = (sourceY + targetY) / 2
          const pathD = `M ${sourceX},${sourceY} Q ${sourceX},${midY} ${midX},${midY} T ${targetX},${targetY}`

          return (
            <path
              key={edge.id}
              d={pathD}
              stroke={edge.data.color}
              strokeWidth={2}
              strokeLinecap='round'
              strokeDasharray='5 7'
              strokeOpacity={0.72}
              vectorEffect='non-scaling-stroke'
              fill='none'
            />
          )
        })}

        {benefitNodes.map(node => (
          <foreignObject
            key={node.id}
            x={node.position.x}
            y={node.position.y}
            width={node.width}
            height={node.height}
          >
            <div className='flex size-full items-center justify-center rounded-full border border-border bg-[#007272] px-3 text-card-foreground shadow-[0_18px_40px_-28px_color-mix(in_oklab,var(--card)_55%,transparent)] ring-1 ring-card-foreground/10'>
              {node.data ?
                <div className='flex min-w-0 items-center justify-center gap-2'>
                  <span className='dark:border-dark-card-foreground/35 -foreground flex size-7 shrink-0 items-center justify-center rounded-full border border-card-foreground/35 bg-card-foreground text-card'>
                    <IconRenderer
                      name={node.data.icon as IconName}
                      className='size-3.5'
                    />
                  </span>

                  <InlineText className='text-xs leading-tight font-medium tracking-normal text-card-foreground sm:text-sm'>
                    {node.data.text}
                  </InlineText>
                </div>
              : null}
            </div>
          </foreignObject>
        ))}
      </svg>

      {centerNode ?
        <div className='pointer-events-none absolute top-1/2 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2'>
          <div className='relative flex h-28 w-28 items-center justify-center rounded-full border border-border bg-sidebar shadow-[0_0_0_8px_color-mix(in_oklab,var(--color-foreground)_3%,transparent),0_24px_54px_-32px_color-mix(in_oklab,var(--color-background)_92%,transparent)]'>
            <div className='dark:bg-dark-foreground relative h-24 w-24 overflow-hidden rounded-full border-2 border-border bg-foreground'>
              <Image
                src={UtekosLogo}
                alt='Utekos'
                fill
                priority
                sizes='96px'
                className='scale-[1.08] object-cover'
              />
            </div>
          </div>
        </div>
      : null}
    </div>
  )
}

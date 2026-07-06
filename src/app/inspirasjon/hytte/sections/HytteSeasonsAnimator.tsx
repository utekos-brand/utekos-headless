'use client'

import { Children, type ReactNode } from 'react'
import {
  LazyMotion,
  MotionConfig,
  domAnimation,
  useReducedMotion,
  type Variants
} from 'motion/react'
import * as m from 'motion/react-m'
import { cn } from '@/lib/utils/className'

export type HytteSeasonAnimationPreset =
  | 'push-word'
  | 'scroll'
  | 'zoom-in'
  | 'push-line'

const loopDurationSeconds = 4.8

const wordEntrySeconds = 0.5
const wordStaggerSeconds = 0.08

const lineEntrySeconds = 0.52
const lineStaggerSeconds = 0.16
const pushLineSettleSeconds = 0.16

const presetPhaseDelaySeconds = {
  'push-word': 0,
  scroll: 1.2,
  'zoom-in': 2.4,
  'push-line': 3.6
} satisfies Record<HytteSeasonAnimationPreset, number>

const defaultEase: [number, number, number, number] = [
  0.22, 1, 0.36, 1
]

const pushLineEase: [number, number, number, number] = [
  0.12, 0.96, 0.22, 1
]

const zoomEase: [number, number, number, number] = [
  0.18, 1.22, 0.32, 1
]

const seasonItemMotion = {
  rest: {
    y: 0
  },
  hover: {
    y: -4,
    transition: {
      duration: 0.24
    }
  }
} satisfies Variants

const textBlockClassName =
  'mx-auto flex w-full max-w-[22ch] flex-col items-center justify-center gap-1 text-center font-[family-name:var(--font-flex)] text-[1.5rem] leading-[0.96] font-bold tracking-normal text-card-foreground min-[390px]:text-[1.75rem] sm:text-4xl lg:text-[2.5rem] xl:text-5xl'

const textLineClassName = 'block max-w-full whitespace-nowrap'

const splitWords = (text: string) => text.trim().split(/\s+/)

const toProgress = (seconds: number) =>
  Number((seconds / loopDurationSeconds).toFixed(4))

const getEntryStartSeconds = (
  index: number,
  staggerSeconds: number,
  entrySeconds: number
) => {
  const latestSafeStartSeconds =
    loopDurationSeconds - entrySeconds - 0.2

  return Math.min(
    index * staggerSeconds + 0.02,
    latestSafeStartSeconds
  )
}

const getRevealAndHoldTimes = (
  index: number,
  staggerSeconds: number,
  entrySeconds: number
) => {
  const entryStartSeconds = getEntryStartSeconds(
    index,
    staggerSeconds,
    entrySeconds
  )
  const entryEndSeconds = entryStartSeconds + entrySeconds

  return [
    0,
    toProgress(entryStartSeconds),
    toProgress(entryEndSeconds),
    1
  ]
}

const getPushLineTimes = (index: number) => {
  const entryStartSeconds = getEntryStartSeconds(
    index,
    lineStaggerSeconds,
    lineEntrySeconds
  )
  const entryEndSeconds = entryStartSeconds + lineEntrySeconds
  const settleEndSeconds = entryEndSeconds + pushLineSettleSeconds

  return [
    0,
    toProgress(entryStartSeconds),
    toProgress(entryEndSeconds),
    toProgress(settleEndSeconds),
    1
  ]
}

const getLoopTransition = (
  times: number[],
  phaseDelaySeconds: number,
  ease: [number, number, number, number] = defaultEase
) => ({
  delay: phaseDelaySeconds,
  duration: loopDurationSeconds,
  ease,
  repeat: Infinity,
  repeatDelay: 0,
  repeatType: 'loop' as const,
  times
})

const getPushWordMotionProps = ({
  index,
  phaseDelaySeconds,
  shouldReduceMotion
}: {
  index: number
  phaseDelaySeconds: number
  shouldReduceMotion: boolean | null
}) =>
  shouldReduceMotion ?
    {}
  : {
      initial: {
        opacity: 1,
        y: '0%'
      },
      animate: {
        opacity: [0, 0, 1, 1],
        y: ['100%', '100%', '0%', '0%']
      },
      transition: getLoopTransition(
        getRevealAndHoldTimes(
          index,
          wordStaggerSeconds,
          wordEntrySeconds
        ),
        phaseDelaySeconds
      )
    }

const getScrollLineMotionProps = ({
  index,
  phaseDelaySeconds,
  shouldReduceMotion
}: {
  index: number
  phaseDelaySeconds: number
  shouldReduceMotion: boolean | null
}) =>
  shouldReduceMotion ?
    {}
  : {
      initial: {
        opacity: 1,
        y: '0%'
      },
      animate: {
        opacity: [0, 0, 1, 1],
        y: ['115%', '115%', '0%', '0%']
      },
      transition: getLoopTransition(
        getRevealAndHoldTimes(
          index,
          lineStaggerSeconds,
          lineEntrySeconds
        ),
        phaseDelaySeconds
      )
    }

const getZoomMotionProps = ({
  phaseDelaySeconds,
  shouldReduceMotion
}: {
  phaseDelaySeconds: number
  shouldReduceMotion: boolean | null
}) =>
  shouldReduceMotion ?
    {}
  : {
      initial: {
        opacity: 1,
        scale: 1
      },
      animate: {
        opacity: [0, 1, 1, 1],
        scale: [0, 1.1, 1, 1]
      },
      transition: getLoopTransition(
        [0, toProgress(0.48), toProgress(0.82), 1],
        phaseDelaySeconds,
        zoomEase
      )
    }

const getPushLineMotionProps = ({
  index,
  phaseDelaySeconds,
  shouldReduceMotion
}: {
  index: number
  phaseDelaySeconds: number
  shouldReduceMotion: boolean | null
}) =>
  shouldReduceMotion ?
    {}
  : {
      initial: {
        opacity: 1,
        x: '0%'
      },
      animate: {
        opacity: [0, 0, 1, 1, 1],
        x: ['-120%', '-120%', '7%', '0%', '0%']
      },
      transition: getLoopTransition(
        getPushLineTimes(index),
        phaseDelaySeconds,
        pushLineEase
      )
    }

interface HytteSeasonAnimatedTextProps {
  description: string
  preset: HytteSeasonAnimationPreset
  title: string
}

interface HytteSeasonsAnimatorProps {
  children: ReactNode
  className?: string
  itemClassName?: string
  seasonValues: readonly string[]
}

function MotionRuntime({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion='user'>
      <LazyMotion features={domAnimation} strict>
        {children}
      </LazyMotion>
    </MotionConfig>
  )
}

export function HytteSeasonAnimatedText({
  description,
  preset,
  title
}: HytteSeasonAnimatedTextProps) {
  const phaseDelaySeconds = presetPhaseDelaySeconds[preset]

  switch (preset) {
    case 'push-word':
      return (
        <PushWordText
          description={description}
          phaseDelaySeconds={phaseDelaySeconds}
          title={title}
        />
      )
    case 'scroll':
      return (
        <ScrollPresetText
          description={description}
          phaseDelaySeconds={phaseDelaySeconds}
          title={title}
        />
      )
    case 'zoom-in':
      return (
        <ZoomInText
          description={description}
          phaseDelaySeconds={phaseDelaySeconds}
          title={title}
        />
      )
    case 'push-line':
      return (
        <PushLinePresetText
          description={description}
          phaseDelaySeconds={phaseDelaySeconds}
          title={title}
        />
      )
  }
}

export function HytteSeasonsAnimator({
  children,
  className,
  itemClassName,
  seasonValues
}: HytteSeasonsAnimatorProps) {
  const childrenArray = Children.toArray(children)
  const shouldReduceMotion = useReducedMotion()

  const hoverMotionProps =
    shouldReduceMotion ? {} : { whileHover: 'hover' as const }

  return (
    <MotionRuntime>
      <m.ul className={className}>
        {childrenArray.map((child, index) => (
          <m.li
            key={`hytte-season-${seasonValues[index] ?? index}`}
            animate='rest'
            className={cn('min-w-0', itemClassName)}
            data-season={seasonValues[index]}
            initial='rest'
            variants={seasonItemMotion}
            {...hoverMotionProps}
          >
            {child}
          </m.li>
        ))}
      </m.ul>
    </MotionRuntime>
  )
}

function PushWordText({
  description,
  phaseDelaySeconds,
  title
}: {
  description: string
  phaseDelaySeconds: number
  title: string
}) {
  const shouldReduceMotion = useReducedMotion()
  const titleWords = splitWords(title)
  const descriptionWords = splitWords(description)

  return (
    <MotionRuntime>
      <div className={textBlockClassName} data-season-copy='push-word'>
        <h3 className={textLineClassName} data-season-line='title'>
          <span className='inline-block max-w-full whitespace-nowrap'>
            {titleWords.map((word, index) => (
              <span
                key={`${title}-${word}-${index}`}
                className={cn(
                  'inline-block overflow-hidden align-bottom',
                  index < titleWords.length - 1 && 'mr-[0.18em]'
                )}
              >
                <m.span
                  className={cn(
                    'inline-block',
                    !shouldReduceMotion && 'will-change-transform'
                  )}
                  {...getPushWordMotionProps({
                    index,
                    phaseDelaySeconds,
                    shouldReduceMotion
                  })}
                >
                  {word}
                </m.span>
              </span>
            ))}
          </span>
        </h3>

        <p className={textLineClassName} data-season-line='description'>
          <span className='inline-block max-w-full whitespace-nowrap'>
            {descriptionWords.map((word, index) => (
              <span
                key={`${description}-${word}-${index}`}
                className={cn(
                  'inline-block overflow-hidden align-bottom',
                  index < descriptionWords.length - 1 && 'mr-[0.18em]'
                )}
              >
                <m.span
                  className={cn(
                    'inline-block',
                    !shouldReduceMotion && 'will-change-transform'
                  )}
                  {...getPushWordMotionProps({
                    index: titleWords.length + index,
                    phaseDelaySeconds,
                    shouldReduceMotion
                  })}
                >
                  {word}
                </m.span>
              </span>
            ))}
          </span>
        </p>
      </div>
    </MotionRuntime>
  )
}

function ScrollPresetText({
  description,
  phaseDelaySeconds,
  title
}: {
  description: string
  phaseDelaySeconds: number
  title: string
}) {
  const shouldReduceMotion = useReducedMotion()
  const lines = [
    { as: 'h3', text: title },
    { as: 'p', text: description }
  ] as const

  return (
    <MotionRuntime>
      <div
        className={cn(textBlockClassName, 'overflow-hidden')}
        data-season-copy='scroll'
      >
        {lines.map((line, index) => {
          const Component = line.as

          return (
            <Component
              key={`${line.as}-${line.text}`}
              className='block overflow-hidden whitespace-nowrap'
              data-season-line={
                line.as === 'h3' ? 'title' : 'description'
              }
            >
              <m.span
                className={cn(
                  textLineClassName,
                  !shouldReduceMotion && 'will-change-transform'
                )}
                {...getScrollLineMotionProps({
                  index,
                  phaseDelaySeconds,
                  shouldReduceMotion
                })}
              >
                {line.text}
              </m.span>
            </Component>
          )
        })}
      </div>
    </MotionRuntime>
  )
}

function ZoomInText({
  description,
  phaseDelaySeconds,
  title
}: {
  description: string
  phaseDelaySeconds: number
  title: string
}) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <MotionRuntime>
      <m.div
        className={cn(textBlockClassName, 'origin-center')}
        data-season-copy='zoom-in'
        {...getZoomMotionProps({
          phaseDelaySeconds,
          shouldReduceMotion
        })}
      >
        <h3 className={textLineClassName} data-season-line='title'>
          {title}
        </h3>
        <p className={textLineClassName} data-season-line='description'>
          {description}
        </p>
      </m.div>
    </MotionRuntime>
  )
}

function PushLinePresetText({
  description,
  phaseDelaySeconds,
  title
}: {
  description: string
  phaseDelaySeconds: number
  title: string
}) {
  const shouldReduceMotion = useReducedMotion()
  const lines = [
    { as: 'h3', text: title },
    { as: 'p', text: description }
  ] as const

  return (
    <MotionRuntime>
      <div className={textBlockClassName} data-season-copy='push-line'>
        {lines.map((line, index) => {
          const Component = line.as

          return (
            <Component
              key={`${line.as}-${line.text}`}
              className='block overflow-hidden whitespace-nowrap'
              data-season-line={
                line.as === 'h3' ? 'title' : 'description'
              }
            >
              <m.span
                className={cn(
                  textLineClassName,
                  !shouldReduceMotion && 'will-change-transform'
                )}
                {...getPushLineMotionProps({
                  index,
                  phaseDelaySeconds,
                  shouldReduceMotion
                })}
              >
                {line.text}
              </m.span>
            </Component>
          )
        })}
      </div>
    </MotionRuntime>
  )
}
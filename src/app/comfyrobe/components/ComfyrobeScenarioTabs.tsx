'use client'

import { useRef, useState, type KeyboardEvent } from 'react'
import Image from 'next/image'
import { CheckCircle2 } from 'lucide-react'
import { PageSection } from '@/components/layout/PageSection'
import { cn } from '@/lib/utils/className'
import { COMFYROBE_SCENARIOS } from '../data/comfyrobeLandingContent'

type ComfyrobeScenarioId =
  (typeof COMFYROBE_SCENARIOS)[number]['id']

export function ComfyrobeScenarioTabs() {
  const [activeScenarioId, setActiveScenarioId] =
    useState<ComfyrobeScenarioId>(COMFYROBE_SCENARIOS[0].id)
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])

  const activeScenario =
    COMFYROBE_SCENARIOS.find(
      scenario => scenario.id === activeScenarioId
    ) ?? COMFYROBE_SCENARIOS[0]

  const selectTabByIndex = (index: number) => {
    const scenario = COMFYROBE_SCENARIOS[index]
    if (!scenario) return

    setActiveScenarioId(scenario.id)
    tabRefs.current[index]?.focus()
  }

  const handleTabKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number
  ) => {
    const lastIndex = COMFYROBE_SCENARIOS.length - 1
    let nextIndex: number | null = null

    if (event.key === 'ArrowRight') {
      nextIndex = index === lastIndex ? 0 : index + 1
    } else if (event.key === 'ArrowLeft') {
      nextIndex = index === 0 ? lastIndex : index - 1
    } else if (event.key === 'Home') {
      nextIndex = 0
    } else if (event.key === 'End') {
      nextIndex = lastIndex
    }

    if (nextIndex === null) return

    event.preventDefault()
    selectTabByIndex(nextIndex)
  }

  return (
    <PageSection
      id='bruksomrader'
      background='default'
      aria-labelledby='comfyrobe-scenarios-heading'
      contentClassName='lg:py-28'
    >
      <div className='mx-auto max-w-3xl text-center'>
        <p className='font-utekos-text-medium text-sm uppercase tracking-[0.18em] text-foreground'>
          Ett plagg. Mange øyeblikk.
        </p>
        <h2
          id='comfyrobe-scenarios-heading'
          className='mt-4 font-sans text-3xl font-bold text-balance text-foreground sm:text-4xl lg:text-5xl'
        >
          Klar når været eller situasjonen endrer seg
        </h2>
        <p className='font-utekos-text mx-auto mt-5 max-w-2xl text-base leading-7 text-foreground sm:text-lg'>
          Comfyrobe™ er ikke låst til én aktivitet. Velg situasjonen
          som ligner mest på din hverdag.
        </p>
      </div>

      <div
        role='tablist'
        aria-label='Velg bruksområde for Comfyrobe'
        className='mt-8 flex snap-x gap-2 overflow-x-auto pb-2 sm:mt-10 sm:flex-wrap sm:justify-center sm:overflow-visible'
      >
        {COMFYROBE_SCENARIOS.map((scenario, index) => {
          const isActive = scenario.id === activeScenario.id

          return (
            <button
              key={scenario.id}
              ref={element => {
                tabRefs.current[index] = element
              }}
              id={`comfyrobe-tab-${scenario.id}`}
              type='button'
              role='tab'
              aria-selected={isActive}
              aria-controls={`comfyrobe-panel-${scenario.id}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActiveScenarioId(scenario.id)}
              onKeyDown={event => handleTabKeyDown(event, index)}
              className={cn(
                'font-utekos-text-medium min-h-11 shrink-0 snap-start rounded-full border px-5 py-2.5 text-sm text-foreground transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 motion-reduce:transition-none',
                isActive ?
                  'border-primary bg-primary text-primary-foreground'
                : 'border-foreground/30 bg-background hover:border-foreground'
              )}
            >
              {scenario.tabLabel}
            </button>
          )
        })}
      </div>

      <div
        id={`comfyrobe-panel-${activeScenario.id}`}
        role='tabpanel'
        aria-labelledby={`comfyrobe-tab-${activeScenario.id}`}
        tabIndex={0}
        className='mt-6 grid overflow-hidden rounded-3xl border border-foreground/30 bg-background shadow-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50 lg:mt-10 lg:grid-cols-2'
      >
        <div className='relative aspect-4/5 min-h-80 overflow-hidden bg-foreground/[0.04] sm:min-h-112 lg:aspect-auto lg:min-h-144'>
          <Image
            key={activeScenario.imageSrc}
            src={activeScenario.imageSrc}
            alt={activeScenario.imageAlt}
            fill
            sizes='(min-width: 1024px) 50vw, 100vw'
            className='object-cover object-center'
          />
        </div>

        <div className='flex flex-col justify-center p-6 sm:p-9 lg:p-12'>
          <p className='font-utekos-text-medium text-sm uppercase tracking-[0.16em] text-foreground'>
            {activeScenario.eyebrow}
          </p>
          <h3 className='mt-3 font-sans text-3xl font-bold text-balance text-foreground sm:text-4xl'>
            {activeScenario.title}
          </h3>
          <p className='font-utekos-text mt-5 text-base leading-7 text-foreground sm:text-lg'>
            {activeScenario.description}
          </p>

          <ul className='mt-7 space-y-4'>
            {activeScenario.points.map(point => (
              <li
                key={point}
                className='font-utekos-text flex items-start gap-3 text-base leading-6 text-foreground'
              >
                <CheckCircle2
                  className='mt-0.5 size-5 shrink-0'
                  aria-hidden='true'
                />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </PageSection>
  )
}

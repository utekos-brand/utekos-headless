// Path: src/app/handlehjelp/teknologi-materialer/layout/ProductSpecsView.tsx
'use client'

import { useState, useEffect } from 'react'
import {
  ProductLayersVisual,
  MobileProductLayersVisual
} from './ProductLayersVisual'
import { TechnologyBlock } from './TechnoloyBlock'
import type { TechnologyGroup } from '../types'

export function ProductSpecsView({
  technologyGroups
}: {
  technologyGroups: readonly TechnologyGroup[]
}) {
  const [activeTech, setActiveTech] = useState(
    technologyGroups?.[0]?.technologies?.[0]?.title || ''
  )

  useEffect(() => {
    const handleIntersect = (
      entries: IntersectionObserverEntry[]
    ) => {
      entries.forEach(entry => {
        const title = entry.target.getAttribute(
          'data-tech-title'
        )
        if (!title) return

        if (entry.isIntersecting) {
          setActiveTech(title)
        }
      })
    }

    const observer = new IntersectionObserver(handleIntersect, {
      rootMargin: '-45% 0px -45% 0px', // Trigger nøyaktig i midten av skjermen
      threshold: 0
    })

    const elements = document.querySelectorAll(
      '[data-tech-title]'
    )
    elements.forEach(el => observer.observe(el))

    return () => observer.disconnect()
  }, [technologyGroups])

  return (
    <div className='mt-24 grid grid-cols-1 gap-16 lg:grid-cols-2'>
      {/* MOBIL VISUAL (Floating HUD) - Vises kun på mobil */}
      <div className='lg:hidden'>
        <MobileProductLayersVisual activeTech={activeTech} />
      </div>

      {/* DESKTOP VISUAL (Sticky Stack) - Vises kun på desktop */}
      <div className='hidden lg:block'>
        <div className='sticky top-32'>
          <ProductLayersVisual activeTech={activeTech} />
        </div>
      </div>

      {/* Scrollable List */}
      <div className='space-y-24 pb-24'>
        {technologyGroups.map(group => (
          <article key={group.groupTitle}>
            <h2 className='mb-8 border-b border-sidebar-foreground/10 dark:border-dark-sidebar-foreground/10 pb-4 text-sm font-bold tracking-widest text-sidebar-foreground/90 dark:text-dark-sidebar-foreground/90'>
              {group.groupTitle}
            </h2>
            <div className='space-y-8'>
              {group.technologies.map(tech => (
                <div
                  key={tech.title}
                  data-tech-title={tech.title} // Brukes av observeren
                >
                  <TechnologyBlock
                    tech={tech}
                    isActive={activeTech === tech.title}
                  />
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

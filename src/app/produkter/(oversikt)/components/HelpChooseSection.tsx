// Path: src/app/produkter/(oversikt)/components/HelpChooseSection.tsx

import { HelpChooseCard } from '@/app/produkter/(oversikt)/components/HelpChooseCard'
import { getHelpChooseProducts } from '@/app/produkter/(oversikt)/utils/getHelpChooseProducts'

const PRODUCT_CONFIG = [
  {
    handle: 'utekos-techdown',
    glowColor: '#0ea5e9',
    fallbackTitle: 'Utekos TechDown™',
    fallbackPrice: '1 790 kr'
  },
  {
    handle: 'utekos-dun',
    glowColor: '#3b82f6',
    fallbackTitle: 'Utekos Dun™',
    fallbackPrice: '2 490 kr'
  },
  {
    handle: 'utekos-mikrofiber',
    glowColor: '#a3a3a3',
    fallbackTitle: 'Utekos Mikrofiber™',
    fallbackPrice: '1 590 kr'
  },
  {
    handle: 'comfyrobe',
    glowColor: '#f59e0b',
    fallbackTitle: 'Comfyrobe™',
    fallbackPrice: '999 kr'
  }
]

export async function HelpChooseSection() {
  const products = await getHelpChooseProducts()

  return (
    <article className='w-full border-y border-border py-12 md:py-16 lg:py-24'>
      <div className='mx-auto max-w-7xl'>
        <div className='grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-6'>
          {PRODUCT_CONFIG.map((config, index) => {
            const product = products.find(
              p => p.handle === config.handle
            )

            if (!product) return null

            return (
              <HelpChooseCard
                key={config.handle}
                product={product}
                index={index}
                glowColor={config.glowColor}
              />
            )
          })}
        </div>
      </div>
    </article>
  )
}

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
    <article className='relative mb-24 w-full px-4 md:px-6'>
      <div className='absolute inset-0 -z-10 overflow-hidden opacity-30'>
        <div
          className='absolute top-0 left-1/4 h-[300px] w-[300px] blur-[100px]'
          style={{
            background:
              'radial-gradient(circle, #0ea5e9 0%, transparent 70%)'
          }}
        />
        <div
          className='absolute right-1/4 bottom-0 h-[300px] w-[300px] blur-[100px]'
          style={{
            background:
              'radial-gradient(circle, #06b6d4 0%, transparent 70%)'
          }}
        />
      </div>

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

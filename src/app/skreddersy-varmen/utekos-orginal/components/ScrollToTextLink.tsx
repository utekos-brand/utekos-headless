'use client'

import { ArrowRight } from 'lucide-react'
import { scrollToElement } from '@/lib/motion/scrollToElement'

export function ScrollToTextLink() {
  const scrollToModel = () => {
    void scrollToElement('section-solution', { offsetY: 80 })
  }

  return (
    <button
      onClick={scrollToModel}
      className='group inline-flex items-center gap-4 text-[#2C2420] font-bold uppercase tracking-widest text-sm border-b border-[#2C2420] pb-2 hover:text-[#E07A5F] hover:border-[#E07A5F] transition-all duration-300'
    >
      Utforsk kolleksjonen
      <ArrowRight className='w-4 h-4 group-hover:translate-x-2 transition-transform' />
    </button>
  )
}

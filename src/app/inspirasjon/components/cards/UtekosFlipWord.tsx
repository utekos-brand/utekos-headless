import React from 'react'
import { FlipWords } from '@/components/ui/flip-words'
import flipWordData from './UtekosFlipWords.json'

export function UtekosFlipWord() {
  return (
    <div className='flex w-full flex-col items-start sm:flex-row sm:items-center md:gap-4'>
      <p className='font-utekos-text-medium text-2xl md:text-3xl'>Juster, form og nyt...</p> 
      <br />
      <div className='relative flex min-h-12 w-full flex-1 items-center overflow-hidden sm:min-h-14'>
        <FlipWords
          words={flipWordData.words}
          duration={2600}
          animateLetters={false}
          random
          className='font-utekos-text-medium px-0 text-2xl md:text-3xl whitespace-nowrap text-foreground'
        />
      </div>
    </div>
  )
}

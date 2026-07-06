// Path: src/app/skreddersy-varmen/components/DeferredLandingSections.tsx

'use client'

import dynamic from 'next/dynamic'

function ThreeInOneFallback() {
  return (
    <div
      aria-hidden
      className=' min-h-[900px] w-full bg-card text-foreground'
    />
  )
}

function TechDownFallback() {
  return (
    <div
      aria-hidden
      className='border-background bg-muted min-h-[760px] w-full border-t border-background'
    />
  )
}

function SocialProofFallback() {
  return (
    <div
      aria-hidden
      className='bg-background min-h-[560px] w-full bg-background'
    />
  )
}

const SectionThreeInOne = dynamic(
  () =>
    import('./SectionThreeInOne').then(module => {
      if (!module.SectionThreeInOne) {
        throw new Error(
          'SectionThreeInOne export was not found in ./SectionThreeInOne'
        )
      }

      return module.SectionThreeInOne
    }),
  { ssr: false, loading: ThreeInOneFallback }
)

const TechDownSlider = dynamic(
  () =>
    import('./TechDownSlider').then(module => {
      if (!module.TechDownSlider) {
        throw new Error(
          'TechDownSlider export was not found in ./TechDownSlider'
        )
      }

      return module.TechDownSlider
    }),
  { ssr: false, loading: TechDownFallback }
)

const SectionSocialProof = dynamic(
  () =>
    import('./SectionSocialProof').then(module => {
      if (!module.SectionSocialProof) {
        throw new Error(
          'SectionSocialProof export was not found in ./SectionSocialProof'
        )
      }

      return module.SectionSocialProof
    }),
  { ssr: false, loading: SocialProofFallback }
)

export function DeferredLandingSections() {
  return (
    <>
      <SectionThreeInOne />
      <TechDownSlider />
      <SectionSocialProof />
    </>
  )
}

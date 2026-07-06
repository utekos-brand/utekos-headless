// Path: src/app/skreddersy-varmen/components/LandingPurchaseFallback.tsx

export function LandingPurchaseFallback() {
  return (
    <div className='w-full bg-foreground-muted px-6 py-16 text-background dark:text-dark-background'>
      <div className='mx-auto max-w-3xl rounded-sm border border-background/12 dark:border-dark-background/12 bg-foreground dark:bg-dark-foreground p-6 text-center shadow-sm'>
        <p className='font-sans text-xl font-bold'>
          Henter produktvalg
        </p>
        <p className='mt-2 text-sm leading-relaxed text-background/75 dark:text-dark-background/75'>
          Siden er klar, og kjøpsvalgene lastes inn.
        </p>
      </div>
    </div>
  )
}

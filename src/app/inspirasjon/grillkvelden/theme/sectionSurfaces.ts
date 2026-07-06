/**
 * Grillkvelden — seksjonsbakgrunn og typografi.
 *
 * Seksjonene veksler background/card i rekkefølgen de står i `page.tsx`:
 * 1. GrillHeroSection — background
 * 2. UseCasesGrid — card
 * 3. BenefitsGrid — background
 * 4. GrillSeasonsSection — card
 * 5. HostTipsGrid — background
 * 6. GrillMasterSection — card
 * 7. CTASection — background
 */
export const grillSectionSurfaces = {
  card: {
    section:
      'overflow-x-clip bg-card py-16 text-card-foreground sm:py-20 lg:py-24',
    heading: 'text-card-foreground',
    lead: 'text-card-foreground',
    body: 'text-card-foreground',
    muted: 'text-card-foreground/80'
  },
  background: {
    section:
      'overflow-x-clip bg-background py-16 text-foreground sm:py-20 lg:py-24',
    heading: 'text-foreground',
    lead: 'text-foreground',
    body: 'text-foreground',
    muted: 'text-foreground/80'
  }
} as const

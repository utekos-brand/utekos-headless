import type { InspirationSeasonDefinition } from '../theme/seasons'

export const iceBathingSeasons: InspirationSeasonDefinition[] = [
  {
    value: 'winter',
    label: 'Vinter',
    iconName: 'Snowflake',
    iconColor: 'text-ancient-water',
    glowColor: 'var(--ancient-water)',
    title: 'Høysesong for endorfiner',
    description:
      'Når isen legger seg og vannet er på sitt kaldeste. Dette er tiden for de mest intense opplevelsene, hvor Utekos er skillet mellom smertefull kulde og komfortabel mestring.'
  },
  {
    value: 'spring',
    label: 'Vår',
    iconName: 'Sun',
    iconColor: 'text-primary dark:text-dark-primary',
    glowColor: 'var(--primary)',
    title: 'Vårløsning og smeltevann',
    description:
      'Dagene blir lengre, men vannet er fortsatt iskaldt. Nyt kontrasten mellom den varmende vårsolen i ansiktet og det kjølige vannet, trygt pakket inn i din Utekos.'
  },
  {
    value: 'summer',
    label: 'Sommer',
    iconName: 'CloudRain',
    iconColor: 'text-ancient-water',
    glowColor: 'var(--ancient-water)',
    title: 'Morgenbad og sommerregn',
    description:
      'For de dagene hvor norsk sommer viser seg fra sin kjølige side. Perfekt etter et morgenbad før solen har stått opp, eller som varme etter en svømmetur i regnet.'
  },
  {
    value: 'autumn',
    label: 'Høst',
    iconName: 'Wind',
    iconColor: 'text-ancient-water',
    glowColor: 'var(--overcast)',
    title: 'Tilvenningsfasen',
    description:
      'Luften blir skarpere og vannet kjøles ned. Høsten er den perfekte tiden å bygge toleranse på. Utekos gjør det enkelt å forlenge sesongen inn i mørketiden.'
  }
]

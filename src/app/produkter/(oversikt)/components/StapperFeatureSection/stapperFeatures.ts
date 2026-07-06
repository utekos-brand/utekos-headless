import { iconMap, type IconName } from './iconMap'
import { IconRenderer } from './IconRenderer'

export const stapperFeatures: {
  icon: IconName
  title: string
  description: string
  colorClasses: string
}[] = [
  {
    icon: 'minimize-2',
    title: 'Maksimal plassbesparelse',
    description:
      'Reduserer volumet på klær og soveposer med over 50 %, og frigjør verdifull plass i bagasjen.',
    colorClasses: 'text-secondary border-secondary/24 bg-secondary/12'
  },
  {
    icon: 'feather',
    title: 'Ultralett design',
    description:
      'Veier kun ca. 100 gram. Du reduserer volum uten å legge til merkbart med vekt i oppakningen.',
    colorClasses: 'text-muted border-muted/24 bg-muted/10'
  },
  {
    icon: 'shield-check',
    title: 'Slitesterkt materiale',
    description: 'Laget for å tåle røff behandling på tur. Stram hardt og pakk tett, år etter år.',
    colorClasses: 'text-ring border-ring/24 bg-ring/12'
  },
  {
    icon: 'settings-2',
    title: 'Enkel og jevn kompresjon',
    description: 'Fire justerbare strammestropper lar deg enkelt komprimere innholdet jevnt og effektivt.',
    colorClasses: 'text-accent border-accent/24 bg-accent/12'
  }
]

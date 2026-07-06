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
    colorClasses: 'text-ancient-water border-ancient-water/24 bg-ancient-water/12'
  },
  {
    icon: 'feather',
    title: 'Ultralett design',
    description:
      'Veier kun ca. 100 gram. Du reduserer volum uten å legge til merkbart med vekt i oppakningen.',
    colorClasses: 'text-overcast border-overcast/24 bg-overcast/10'
  },
  {
    icon: 'shield-check',
    title: 'Slitesterkt materiale',
    description: 'Laget for å tåle røff behandling på tur. Stram hardt og pakk tett, år etter år.',
    colorClasses: 'text-very-peri border-very-peri/24 bg-very-peri/12'
  },
  {
    icon: 'settings-2',
    title: 'Enkel og jevn kompresjon',
    description: 'Fire justerbare strammestropper lar deg enkelt komprimere innholdet jevnt og effektivt.',
    colorClasses: 'text-soft-warm border-soft-warm/24 bg-soft-warm/12'
  }
]

'use client'

import { InspirationSeasonsTabs } from '../../components/InspirationSeasonsTabs'
import { iceBathingSeasons } from '../iceBathingSeasons'

export function SeasonsSection() {
  return <InspirationSeasonsTabs seasons={iceBathingSeasons} defaultValue='winter' variant='pill' />
}

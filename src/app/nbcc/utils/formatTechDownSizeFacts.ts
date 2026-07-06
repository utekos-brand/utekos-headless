import { techDownData } from '@/app/handlehjelp/storrelsesguide/utils/data'

export function formatTechDownSizeFacts(): string {
  return techDownData
    .map(
      row =>
        `- ${row.measurement}: Liten ${row.liten}, Middels ${row.middels}, Stor ${row.stor}`
    )
    .join('\n')
}

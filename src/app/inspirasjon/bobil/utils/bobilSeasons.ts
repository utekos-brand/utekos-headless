import type { InspirationSeasonDefinition } from '../../theme/seasons'

export const bobilSeasons: InspirationSeasonDefinition[] = [
  {
    value: 'spring',
    label: 'Vår',
    iconName: 'Sunrise',
    iconColor: 'text-secondary',
    glowColor: 'var(--secondary)',
    title: 'Vårcamping',
    intro: 'Våren byr på fantastiske muligheter for bobilisten, men temperaturene kan være uforutsigbare.',
    tips: [
      'Start dagen tidlig med Utekos og kaffe for å se naturen våkne',
      'Perfekt for påskecamping i fjellet når kveldene fortsatt er kjølige',
      'Nyt de første varme solstrålene uten å fryse i skyggen'
    ]
  },
  {
    value: 'summer',
    label: 'Sommer',
    iconName: 'Sun',
    iconColor: 'text-primary',
    glowColor: 'var(--primary)',
    title: 'Sommerkvelder',
    intro: 'Selv om sommeren er varm, blir kveldene ofte overraskende kjølige, spesielt ved kysten.',
    tips: [
      'Forleng de lyse kveldene utendørs uten å pakke inn i tepper',
      'Ideell ved kysten hvor vinden kan gjøre kveldene kjølige',
      'Perfekt for sosiale samlinger på campingplassen'
    ]
  },
  {
    value: 'autumn',
    label: 'Høst',
    iconName: 'Mountain',
    iconColor: 'text-ceramic',
    glowColor: 'var(--ceramic)',
    title: 'Høstens fargeprakt',
    intro: 'Høsten er mange bobilisters favoritt-sesong, og med Utekos kan du nyte den fullt ut.',
    tips: [
      'Opplev de spektakulære høstfargene fra tidlig morgen til sen kveld',
      'Hold varmen under nordlys-jakt på kjølige høstkvelder',
      'Nyt bålkosen uten å måtte sitte for nær flammene'
    ]
  },
  {
    value: 'winter',
    label: 'Vinter',
    iconName: 'Wind',
    iconColor: 'text-secondary',
    glowColor: 'var(--secondary)',
    title: 'Vintercamping',
    intro: 'For de som bruker bobilen året rundt, er Utekos den ultimate følgesvennen.',
    tips: [
      'Essensielt tilbehør for skiferier med bobil',
      'Hold varmen mens du venter på at bobilen varmes opp',
      'Perfekt for julecamping og nyttårsfeiring på fjellet'
    ]
  }
]

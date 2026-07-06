import UtekosWordmark from '@/components/BrandComponents/utils/UtekosWordmark'

type MagazineInlineTitleProps = {
  text: string
}

export function MagazineInlineTitle({ text }: MagazineInlineTitleProps) {
  const segments = text.split(/(Utekos)/g)

  return (
    <>
      {segments.map((segment, index) =>
        segment === 'Utekos' ?
          <span key={`${segment}-${index}`} className='inline-block'>
            <span className='sr-only'>Utekos</span>
            <UtekosWordmark
              aria-hidden='true'
              className='mx-[0.03em] inline-block h-[0.72em] w-auto translate-y-[0.06em]'
            />
          </span>
        : segment
      )}
    </>
  )
}

// Path: src/components/header/HeaderLogo.tsx
import UtekosLogo from '@public/icon.png'
import Image from 'next/image'
import Link from 'next/link'

export function HeaderLogo() {
  return (
    <div className='flex items-center'>
      <Link
        href='/'
        aria-label='Utekos - Til forsiden'
        data-track='HeaderLogoClick'
      >
        <Image
          src={UtekosLogo}
          alt='Utekos logo'
          width={58}
          height={58}
          loading='eager'
          className='size-12 rounded-full ring ring-cloud-dancer/80 md:size-14 lg:size-[58px]'
        />
      </Link>
    </div>
  )
}

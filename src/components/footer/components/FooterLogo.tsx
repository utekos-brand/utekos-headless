import Image from 'next/image'
import Link from 'next/link'
import UtekosLogo from '@public/icon.png' // Bruker samme logo-fil

export function FooterLogo() {
  return (
    // Div for å sentrere logoen
    <div className='mb-8 flex justify-center'>
      <Link href='/' aria-label='Utekos - Til forsiden'>
        <Image
          src={UtekosLogo}
          alt='Utekos logo'
          width={60} // Litt større for bedre synlighet i footeren
          height={60}
          className='rounded-full ring ring-white/30'
        />
      </Link>
    </div>
  )
}

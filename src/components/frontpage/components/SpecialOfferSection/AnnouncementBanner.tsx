import { ArrowRightIcon, Bird } from 'lucide-react'
import Link from 'next/link'
import type { Route } from 'next'
import { cookies } from 'next/headers'
import { AnnouncementBannerClient } from './AnnouncementBannerClient'
import {
  BANNER_COOKIE_NAME,
  isBannerDismissed
} from './announcementBannerConfig'

export async function AnnouncementBanner() {
  const cookieStore = await cookies()
  const dismissedAt = cookieStore.get(BANNER_COOKIE_NAME)?.value

  if (isBannerDismissed(dismissedAt)) {
    return null
  }

  return (
    <AnnouncementBannerClient>
	      <Link
	        href={'/skreddersy-varmen' as Route}
	        data-track='AnnouncementBannerClick'
	        aria-label='Se tilbudet på Utekos TechDown til kr 1790'
        className='group font-utekos-text-medium block w-full py-1 bg-background dark:bg-dark-background  pr-14 pl-3 tracking-wide transition-colors outline-none sm:px-12 sm:py-2'
      >
        <div className='mx-auto flex max-w-5xl min-w-0 items-center bg-background dark:bg-dark-background justify-center gap-2 max-[360px]:gap-1.5 sm:gap-2.5'>
          <Bird
            aria-hidden='true'
            className='size-4 shrink-0 min-[360px]:size-5 sm:size-6 md:size-7 lg:size-8 xl:size-9'
            strokeWidth={1.5}
          />

          <span className='font-utekos-text-medium whitespace-nowrap text-[clamp(0.75rem,3.7vw,0.875rem)] leading-none md:text-base'>
            Utekos TechDown™ til kr 1790,-
          </span>

          <span className='hidden items-center gap-1 transition-colors sm:flex'>
            <ArrowRightIcon className='size-4 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none' />
          </span>
          <ArrowRightIcon
            aria-hidden='true'
            className='size-4 shrink-0 max-[360px]:hidden sm:hidden'
          />
        </div>
      </Link>
    </AnnouncementBannerClient>
  )
}

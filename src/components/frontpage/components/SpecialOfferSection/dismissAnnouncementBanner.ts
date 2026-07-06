'use server'

import { cookies } from 'next/headers'
import {
  BANNER_COOKIE_NAME,
  BANNER_EXPIRATION_MS
} from './announcementBannerConfig'

export async function dismissAnnouncementBanner() {
  const cookieStore = await cookies()

  cookieStore.set(BANNER_COOKIE_NAME, Date.now().toString(), {
    maxAge: Math.floor(BANNER_EXPIRATION_MS / 1000),
    path: '/',
    sameSite: 'lax'
  })
}

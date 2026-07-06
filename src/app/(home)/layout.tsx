import { FrontPageJsonLd } from '@/components/frontpage/components/FrontPageJsonLd/FrontPageJsonLd'

export default function HomeLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <FrontPageJsonLd />
      {children}
    </>
  )
}

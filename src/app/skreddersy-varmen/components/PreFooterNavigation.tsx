// Path: src/components/frontpage/PreFooterNavigation.tsx
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils/className'
import { NavLinks } from './NavLinks'

export function PreFooterNavigation() {
  return (
    // Gradient-bakgrunnen blender sømløst over fra trekkspillet over, og ned i footeren under
    <article className='dark:from-dark-background dark:to-dark-card w-full max-w-full bg-linear-to-b from-background to-card py-16 text-foreground md:py-24'>
      <div className='mx-auto max-w-5xl px-6'>
        <div className='mb-12 text-center'>
          <h2 className='leading-heading-level-two mb-4 font-sans text-5xl font-semibold text-foreground md:text-6xl'>
            Utforsk mer av Utekos
          </h2>
        </div>

        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {NavLinks.map((link, index) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'group flex items-center justify-between p-6',
                'dark:border-dark-foreground/10 dark:bg-dark-background/30 rounded-2xl border border-foreground/10 bg-background/30 backdrop-blur-sm',
                'dark:hover:border-dark-primary/50 dark:hover:bg-dark-background/60 dark:hover:shadow-dark-primary/5 transition-all duration-400 hover:border-primary/50 hover:bg-background/60 hover:shadow-lg hover:shadow-primary/5',
                index === 0 && 'md:col-span-2 lg:col-span-3',
                link.mdOnly && 'hidden md:flex'
              )}
            >
              <div className='flex items-center gap-4'>
                <div
                  className={cn(
                    'dark:border-dark-foreground/5 dark:bg-dark-background/80 dark:text-dark-primary dark:group-hover:border-dark-primary dark:group-hover:bg-dark-primary dark:group-hover:text-dark-foreground rounded-full border border-foreground/5 bg-background/80 p-3 text-primary shadow-sm transition-colors duration-400 group-hover:border-primary group-hover:bg-primary group-hover:text-foreground'
                  )}
                >
                  {link.icon}
                </div>

                <div className='flex flex-col'>
                  <span className='/50 dark:group-hover:text-dark-foreground/90 mb-0.5 font-sans text-xs font-medium tracking-widest text-foreground/50 uppercase transition-colors group-hover:text-foreground/90'>
                    {link.description}
                  </span>
                  <span className='font-sans text-lg font-medium text-foreground transition-transform duration-300 group-hover:translate-x-1'>
                    {link.label}
                  </span>
                </div>
              </div>

              {/* Pilen: Får den varme "Iced Apricot"-fargen på hover for å trigge et klikk */}
              <ArrowRight className='/30 dark:group-hover:text-dark-accent size-5 text-foreground/30 transition-all duration-400 group-hover:translate-x-2 group-hover:text-accent' />
            </Link>
          ))}
        </div>
      </div>
    </article>
  )
}

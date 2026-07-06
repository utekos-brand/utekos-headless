'use client'

import { cn } from '@/lib/utils/className'
import {
  Droplet,
  Thermometer,
  Sparkles,
  ShieldCheck,
  Zap,
  type LucideIcon
} from 'lucide-react'

// Definerer lagene
type LayerType = 'outer' | 'insulation' | 'inner' | 'function'

// Felles logikk for farger og tema
const LAYER_THEMES = {
  ancient: {
    border: 'border-ancient-water/30',
    bg: 'bg-havdyp/80',
    text: 'text-ancient-water',
    glow: 'shadow-ancient-water/20',
    gradient: 'from-ancient-water/10'
  },
  cloud: {
    border: 'border-cloud-dancer/30',
    bg: 'bg-havdyp/80',
    text: 'text-foreground/90 /90',
    glow: 'shadow-cloud-dancer/20',
    gradient: 'from-cloud-dancer/10'
  },
  peri: {
    border: 'border-very-peri/30',
    bg: 'bg-havdyp/80',
    text: 'text-very-peri',
    glow: 'shadow-very-peri/20',
    gradient: 'from-very-peri/10'
  }
}

const getLayerType = (title: string): LayerType => {
  const t = title.toLowerCase()
  if (
    t.includes('3-i-1') ||
    t.includes('zip') ||
    t.includes('konstruksjon')
  )
    return 'function'
  if (
    t.includes('innerfôr') ||
    t.includes('taffeta') ||
    t.includes('sherpa') ||
    t.includes('lining')
  )
    return 'inner'
  if (
    t.includes('insulation') ||
    t.includes('dun') ||
    t.includes('fiber') ||
    t.includes('fillpower') ||
    t.includes('cloudweave')
  )
    return 'insulation'
  return 'outer'
}

// --- DESKTOP KOMPONENT (STACK) ---
export function ProductLayersVisual({
  activeTech
}: {
  activeTech: string
}) {
  const activeLayer = getLayerType(activeTech)

  return (
    <div className='relative flex h-[60vh] w-full items-center justify-center p-8'>
      <div className='absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_90%,transparent_100%)] bg-[size:24px_24px]' />

      <div className='relative flex w-full max-w-sm flex-col gap-4 perspective-[1000px]'>
        <MaterialCard
          isActive={activeLayer === 'outer'}
          title='Protective Shell'
          subtitle='Værbarriere og slitestyrke'
          icon={ShieldCheck}
          color='ancient'
        >
          <div className="absolute inset-0 bg-[url('/textures/carbon-fibre.png')] opacity-20" />
          <div className='text-ancient-water absolute top-4 right-4 animate-pulse opacity-50'>
            <Droplet className='h-5 w-5' />
          </div>
        </MaterialCard>

        <MaterialCard
          isActive={activeLayer === 'insulation'}
          title='Thermal Core'
          subtitle='Varme og loft'
          icon={Thermometer}
          color='cloud'
        >
          <div className='from-cloud-dancer/10 absolute inset-0 bg-linear-to-br via-transparent to-transparent' />
        </MaterialCard>

        <MaterialCard
          isActive={activeLayer === 'inner'}
          title='Comfort Lining'
          subtitle='Pustende og myk'
          icon={Sparkles}
          color='peri'
        >
          <div className='via-very-peri/10 absolute inset-0 skew-x-12 bg-linear-to-r from-transparent to-transparent' />
        </MaterialCard>

        <div
          className={cn(
            'absolute top-1/2 -right-12 -translate-y-1/2 transition-all duration-900',
            activeLayer === 'function' ?
              'translate-x-0 opacity-100'
            : 'pointer-events-none translate-x-8 opacity-0'
          )}
        >
          <div className='border-ancient-water/30 bg-havdyp/90 flex flex-col items-center gap-2 rounded-xl border p-4 shadow-2xl backdrop-blur-md'>
            <div className='bg-ancient-water/20 text-ancient-water rounded-full p-2'>
              <Zap className='h-6 w-6' />
            </div>
            <div className='text-ancient-water text-sm font-bold tracking-wider'>
              System
            </div>
            <div className='from-ancient-water/50 h-16 w-0.5 bg-linear-to-b to-transparent' />
          </div>
        </div>
      </div>
    </div>
  )
}

// --- MOBIL KOMPONENT (FLOATING HUD) ---
export function MobileProductLayersVisual({
  activeTech
}: {
  activeTech: string
}) {
  const activeLayer = getLayerType(activeTech)

  // Data mapping for mobilvisningen
  const layerData = {
    outer: {
      title: 'Outer Shell',
      icon: ShieldCheck,
      color: 'ancient' as const,
      index: 0
    },
    insulation: {
      title: 'Thermal Core',
      icon: Thermometer,
      color: 'cloud' as const,
      index: 1
    },
    inner: {
      title: 'Comfort Lining',
      icon: Sparkles,
      color: 'peri' as const,
      index: 2
    },
    function: {
      title: 'System Tech',
      icon: Zap,
      color: 'ancient' as const,
      index: 3
    }
  }

  const current = layerData[activeLayer]
  const theme = LAYER_THEMES[current.color]

  return (
    <div className='animate-slide-in-up fixed right-4 bottom-6 left-4 z-50'>
      <div
        className={cn(
          'relative flex items-center gap-4 overflow-hidden rounded-2xl border p-4 shadow-2xl backdrop-blur-xl transition-all duration-500',
          theme.border,
          theme.bg,
          theme.glow
        )}
      >
        {/* Bakgrunns-gradient som pulserer */}
        <div
          className={cn(
            'absolute inset-0 bg-linear-to-r opacity-20',
            theme.gradient,
            'to-transparent'
          )}
        />

        {/* Ikon Boks */}
        <div
          className={cn(
            'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border bg-black/40 backdrop-blur-md transition-colors',
            theme.border,
            theme.text
          )}
        >
          <current.icon className='h-6 w-6' />
        </div>

        {/* Tekst */}
        <div className='min-w-0 flex-1'>
          <div
            className={cn(
              'text-sm font-bold tracking-widest',
              theme.text
            )}
          >
            Active Layer
          </div>
          <div className='truncate text-lg font-bold text-white'>
            {current.title}
          </div>
        </div>

        {/* Mini Stack Indicator (Viser posisjon i lagene) */}
        <div className='flex flex-col gap-1 opacity-50'>
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className={cn(
                'h-1.5 w-1.5 rounded-full transition-all duration-300',
                current.index === i ?
                  'scale-125 bg-white'
                : 'bg-white/20'
              )}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// --- HJELPEKOMPONENT (DESKTOP CARD) ---
function MaterialCard({
  isActive,
  title,
  subtitle,
  icon: Icon,
  color,
  children
}: {
  isActive: boolean
  title: string
  subtitle: string
  icon: LucideIcon
  color: 'ancient' | 'cloud' | 'peri'
  children?: React.ReactNode
}) {
  const theme = LAYER_THEMES[color]

  return (
    <div
      className={cn(
        'relative flex items-center gap-6 overflow-hidden rounded-2xl border p-6 transition-all duration-500 ease-out',
        'bg-havdyp/80 border-white/5 backdrop-blur-sm',
        isActive ?
          `scale-105 ${theme.border} bg-havdyp shadow-2xl ${theme.glow} z-10 translate-y-0 opacity-100`
        : 'z-0 scale-95 opacity-40 grayscale-[0.5] hover:opacity-60'
      )}
    >
      <div
        className={cn(
          'absolute top-0 bottom-0 left-0 w-1 transition-all duration-500',
          isActive ?
            theme.text.replace('text', 'bg')
          : 'bg-transparent'
        )}
      />

      <div
        className={cn(
          'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border transition-colors duration-300',
          isActive ?
            `${theme.border} bg-white/5 ${theme.text}`
          : 'bg-havdyp /90 border-white/10 text-foreground/90'
        )}
      >
        <Icon className='h-6 w-6' />
      </div>

      <div className='flex flex-col'>
        <span
          className={cn(
            'text-xs font-bold tracking-widest uppercase transition-colors',
            isActive ? theme.text : '/90 text-foreground/90'
          )}
        >
          {title}
        </span>
        <span
          className={cn(
            'text-lg font-semibold transition-colors',
            isActive ? 'text-white' : '/90 text-foreground/90'
          )}
        >
          {subtitle}
        </span>
      </div>
      {children}
    </div>
  )
}

'use client'

import { useAddToCartAction } from '@/hooks/useAddToCartAction'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowUpRight, Loader2, MousePointer2, ShoppingBag, X } from 'lucide-react'
import type { Route } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import type { ShopifyProduct, ShopifyProductVariant } from 'types/product'

interface HelpChooseCardProps {
  product: ShopifyProduct
  index: number
  glowColor: string
}

type ProductVariantsShape =
  | ShopifyProductVariant[]
  | {
      nodes?: ShopifyProductVariant[]
      edges?: Array<{ node: ShopifyProductVariant }>
    }

function mapColorToHex(colorName: string): string {
  const c = colorName.toLowerCase().trim()
  if (c === 'fjellnatt') return '#232B38'
  if (c === 'havdyp') return '#0F2B40'
  if (c === 'fjellblå') return 'oklch(0.0408 0.0191 291.1)'
  if (c === 'vargnatt') return '#000001'
  if (c.includes('svart') || c.includes('black')) return '#000001'
  if (c.includes('blå') || c.includes('blue')) return '#0F2B40'
  if (c.includes('grønn') || c.includes('green')) return '#14532d'
  if (c.includes('hvit') || c.includes('white')) return '#ffffff'
  return '#232B38'
}

function normalizeVariants(product: ShopifyProduct): ShopifyProductVariant[] {
  const v = product.variants as ProductVariantsShape
  if (Array.isArray(v)) return v
  if (v?.nodes) return v.nodes
  if (v?.edges) return v.edges.map(edge => edge.node)
  return []
}

export function HelpChooseCard({ product, index, glowColor }: HelpChooseCardProps) {
  const variants = normalizeVariants(product)

  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [isSelectingSize, setIsSelectingSize] = useState(false)
  const [selectedVariant, setSelectedVariant] = useState<ShopifyProductVariant | null>(null)

  const [toast, setToast] = useState<string | null>(null)
  const toastTimerRef = useRef<number | null>(null)

  const [colorGateFlash, setColorGateFlash] = useState(false)
  const [showColorHint, setShowColorHint] = useState(false)
  const hintTimerRef = useRef<number | null>(null)

  const [pendingAdd, setPendingAdd] = useState(false)

  const colorMap = new Map<string, string>()
  variants.forEach(variant => {
    const color = variant.selectedOptions.find(o => o.name === 'Color' || o.name === 'Farge')?.value
    if (color && !colorMap.has(color)) {
      colorMap.set(color, variant.image?.url || product.featuredImage?.url || '')
    }
  })
  const colorOptions = Array.from(colorMap.entries())

  const availableSizes =
    selectedColor ?
      variants
        .filter(v => {
          const vColor = v.selectedOptions.find(o => o.name === 'Color' || o.name === 'Farge')?.value
          return vColor === selectedColor && v.availableForSale
        })
        .map(v => ({
          id: v.id,
          title: v.selectedOptions.find(o => o.name === 'Size' || o.name === 'Størrelse')?.value || 'One Size',
          variant: v
        }))
    : []

  const { performAddToCart, isPending } = useAddToCartAction({
    product,
    selectedVariant: selectedVariant
  })

  useEffect(() => {
    if (!pendingAdd) return
    if (!selectedVariant) return

    const pendingTimer = window.setTimeout(() => {
      performAddToCart(1)
      setPendingAdd(false)
    }, 0)

    return () => window.clearTimeout(pendingTimer)
  }, [pendingAdd, selectedVariant, performAddToCart])

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current)
      if (hintTimerRef.current) window.clearTimeout(hintTimerRef.current)
    }
  }, [])

  const showToast = (msg: string) => {
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current)
    setToast(msg)
    toastTimerRef.current = window.setTimeout(() => setToast(null), 1800)
  }

  const triggerColorGuidance = () => {
    setColorGateFlash(true)
    setShowColorHint(true)
    window.setTimeout(() => setColorGateFlash(false), 550)

    if (hintTimerRef.current) window.clearTimeout(hintTimerRef.current)
    hintTimerRef.current = window.setTimeout(() => setShowColorHint(false), 2200)
  }

  const handleBuyClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!product.availableForSale) return

    if (!selectedColor) {
      showToast('Velg farge for å fortsette')
      triggerColorGuidance()
      return
    }

    setIsSelectingSize(true)
  }

  const handleSizeSelect = (e: React.MouseEvent, variant: ShopifyProductVariant) => {
    e.preventDefault()
    e.stopPropagation()
    setSelectedVariant(variant)
    setPendingAdd(true)
  }

  const handleColorSelect = (e: React.MouseEvent, color: string) => {
    e.preventDefault()
    e.stopPropagation()
    setSelectedColor(color)
    setSelectedVariant(null)
    setIsSelectingSize(true)
    setColorGateFlash(false)
    setShowColorHint(false)
    setToast(null)
  }

  const activeImage =
    (selectedColor ? colorOptions.find(([c]) => c === selectedColor)?.[1] : '')
    || product.featuredImage?.url
    || ''

  const price = product.priceRange.minVariantPrice.amount
  const formattedPrice = `${parseInt(price).toLocaleString('no-NO')} kr`
  const isOutOfStock = !product.availableForSale

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: 'easeOut' }}
      className='group relative size-full'
      onMouseLeave={() => setIsSelectingSize(false)}
    >
      <Link href={`/produkter/${product.handle}` as Route} className='block size-full'>
        <div className='relative flex aspect-2/3 h-full flex-col overflow-hidden rounded-3xl border border-white/5 bg-neutral-900 shadow-2xl transition-transform duration-300 md:hover:-translate-y-1'>
          <div className='absolute inset-0 z-0 bg-neutral-800'>
            <AnimatePresence mode='wait'>
              <motion.div
                key={activeImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className='absolute inset-0'
              >
                <Image
                  src={activeImage}
                  alt={product.title}
                  fill
                  quality={95}
                  sizes='(max-width: 640px) 50vw, 25vw'
                  loading='lazy'
                  fetchPriority='low'
                  className={`object-cover transition-transform duration-700 will-change-transform ${
                    isSelectingSize ? 'scale-105 blur-[2px]' : 'group-hover:scale-105'
                  }`}
                />
              </motion.div>
            </AnimatePresence>
            <div className='absolute inset-0 bg-linear-to-t from-black/90 via-transparent to-transparent opacity-80' />
          </div>

          <div className='absolute left-0 top-0 z-30 flex w-full justify-between p-3'>
            <div className='flex items-center justify-center rounded-full border border-white/10 bg-black/20 px-2 py-0.5 backdrop-blur-md md:px-2.5 md:py-1'>
              <span className='text-[9px] font-semibold uppercase tracking-wider text-white/90 md:text-[10px]'>
                Unisex
              </span>
            </div>

            {colorOptions.length > 0 && (
              <div className='relative'>
                <div
                  className={`flex items-center gap-1.5 rounded-full border border-white/10 bg-black/20 p-1.5 backdrop-blur-md transition-transform ${
                    colorGateFlash ? 'scale-[1.04]' : ''
                  }`}
                >
                  {colorOptions.map(([color]) => (
                    <button
                      key={color}
                      onClick={e => handleColorSelect(e, color)}
                      className={`relative h-4 w-4 rounded-full border-2 border-white transition-transform ${
                        selectedColor === color ? 'scale-125 ring-2 ring-white' : 'opacity-85 hover:scale-110'
                      } ${colorGateFlash && !selectedColor ? 'ring-2 ring-white/80' : ''}`}
                      style={{ backgroundColor: mapColorToHex(color) }}
                      aria-label={`Velg farge ${color}`}
                    />
                  ))}
                </div>

                <AnimatePresence>
                  {showColorHint && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.98 }}
                      transition={{ duration: 0.18 }}
                      className='pointer-events-none absolute -left-10 top-1/2 -translate-y-1/2'
                    >
                      <motion.div
                        animate={{ x: [0, 6, 0] }}
                        transition={{
                          duration: 0.8,
                          repeat: Infinity,
                          ease: 'easeInOut'
                        }}
                        className='flex items-center gap-2'
                      >
                        <div className='rounded-full bg-white/90 px-2 py-1 text-[10px] font-bold text-black shadow-lg'>
                          Velg farge
                        </div>
                        <MousePointer2 className='h-4 w-4 text-white drop-shadow' />
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          <AnimatePresence>
            {toast && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.18 }}
                className='absolute left-1/2 top-14 z-40 -translate-x-1/2'
              >
                <div className='rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold text-black shadow-xl'>
                  {toast}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className='relative z-10 mt-auto flex flex-col p-3 pb-3 md:p-4 md:pb-4'>
            <div className='mb-3'>
              <h3 className='font-heading text-base font-bold leading-tight   text-white md:text-xl'>
                {product.title}
              </h3>
              <div className='mt-0.5 flex items-baseline gap-2'>
                <span className='text-sm font-bold text-white/90 md:text-base'>{formattedPrice}</span>
              </div>
            </div>

            <div className='relative h-10 w-full'>
              <AnimatePresence mode='wait' initial={false}>
                {!isSelectingSize ?
                  <motion.div
                    key='default-actions'
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className='grid grid-cols-[1fr_auto] gap-2'
                  >
                    <div className='flex h-10 items-center justify-center gap-2 rounded-full bg-white/10 backdrop-blur-md transition-colors duration-300 md:group-hover:bg-white/20'>
                      <span className='text-xs font-semibold text-white'>Les mer</span>
                      <ArrowUpRight className='h-3.5 w-3.5 text-white/80' />
                    </div>

                    <button
                      onClick={handleBuyClick}
                      disabled={isOutOfStock}
                      className={`flex h-10 w-12 items-center justify-center rounded-full bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-transform active:scale-90 md:w-auto md:px-5 ${
                        isOutOfStock ? 'opacity-50' : ''
                      }`}
                    >
                      {isOutOfStock ?
                        <span className='text-[10px] font-bold'>TOMT</span>
                      : <>
                          <ShoppingBag className='h-4 w-4 md:mr-2' />
                          <span className='hidden text-xs font-bold md:block'>Kjøp nå</span>
                        </>
                      }
                    </button>
                  </motion.div>
                : <motion.div
                    key='size-selector'
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.18 }}
                    className='flex h-10 w-full items-center gap-1 overflow-hidden rounded-full bg-white p-1 pr-1 shadow-xl'
                  >
                    <button
                      onClick={e => {
                        e.preventDefault()
                        e.stopPropagation()
                        setIsSelectingSize(false)
                      }}
                      className='flex h-8 w-8 min-w-8 items-center justify-center rounded-full bg-neutral-100 hover:bg-neutral-200'
                      aria-label='Lukk'
                    >
                      <X className='h-4 w-4 text-black' />
                    </button>

                    <div className='flex flex-1 items-center gap-1 overflow-x-auto px-1 no-scrollbar'>
                      {availableSizes.map(size => (
                        <button
                          key={size.id}
                          onClick={e => handleSizeSelect(e, size.variant)}
                          disabled={isPending}
                          className='flex h-8 min-w-9 flex-1 max-w-17 items-center justify-center overflow-hidden rounded-full bg-black px-2 text-xs font-bold text-white transition-transform active:scale-95'
                          aria-label={`Velg størrelse ${size.title}`}
                          title={size.title}
                        >
                          {isPending && selectedVariant?.id === size.id ?
                            <Loader2 className='h-3 w-3 animate-spin' />
                          : <span className='min-w-0 truncate whitespace-nowrap'>{size.title}</span>}
                        </button>
                      ))}

                      {selectedColor && availableSizes.length === 0 && (
                        <div className='flex h-8 items-center justify-center rounded-full bg-neutral-200 px-3 text-[11px] font-semibold text-black whitespace-nowrap'>
                          Ingen størrelser
                        </div>
                      )}
                    </div>
                  </motion.div>
                }
              </AnimatePresence>
            </div>
          </div>

          <div
            className='pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-500 md:group-hover:opacity-100'
            style={{
              boxShadow: `inset 0 0 20px ${glowColor}20`,
              borderColor: `${glowColor}40`
            }}
          />
        </div>
      </Link>
    </motion.div>
  )
}

'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import { productHandle } from '@/api/constants'
import { useLaunchSectionTracking } from './useLaunchSectionTracking'
import { NewProductLaunchSectionView } from './NewProductLaunchSectionView'

const QuickViewModal = dynamic(
  () =>
    import('@/components/products/QuickViewModal').then(
      module => module.QuickViewModal
    ),
  { ssr: false }
)

interface NewProductLaunchSectionProps {
  variantId: string
}

export function NewProductLaunchSection({
  variantId
}: NewProductLaunchSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { trackEvent } = useLaunchSectionTracking(variantId)

  const handleDiscoverClick = () => {
    trackEvent('Discover', 'HeroInteract')
  }

  const handleQuickViewClick = () => {
    setIsModalOpen(true)
    trackEvent('QuickView', 'OpenQuickView')
  }

  return (
    <>
      <NewProductLaunchSectionView
        onDiscoverClick={handleDiscoverClick}
        onQuickViewClick={handleQuickViewClick}
      />

      {isModalOpen && (
        <QuickViewModal
          productHandle={productHandle}
          isOpen={isModalOpen}
          onOpenChange={setIsModalOpen}
        />
      )}
    </>
  )
}

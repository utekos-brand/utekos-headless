'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import { productHandle } from '@/api/constants'
import { NewProductLaunchSectionView } from './NewProductLaunchSectionView'

const QuickViewModal = dynamic(
  () =>
    import('@/components/products/QuickViewModal').then(
      module => module.QuickViewModal
    ),
  { ssr: false }
)

export function NewProductLaunchSection() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleDiscoverClick = () => {}

  const handleQuickViewClick = () => {
    setIsModalOpen(true)
  }

  return (
    <>
      <NewProductLaunchSectionView
        onDiscoverClick={handleDiscoverClick}
        onQuickViewClick={handleQuickViewClick}
      />

      {isModalOpen ?
        <QuickViewModal
          productHandle={productHandle}
          isOpen={isModalOpen}
          onOpenChange={setIsModalOpen}
        />
      : null}
    </>
  )
}

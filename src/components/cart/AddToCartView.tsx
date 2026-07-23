import { Form } from '@/components/ui/form'
import { ModalSubmitButton } from './ModalSubmitButton'
import { QuantitySelector } from './QuantitySelector'
import type { AddToCartViewProps } from 'types/cart'

export function AddToCartView({
  form,
  product,
  selectedVariant,
  onSubmit,
  onCheckout,
  isPending,
  isCheckoutPending,
  isAvailable
}: AddToCartViewProps) {
  const quantity = form.watch('quantity')

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='flex flex-col gap-4'
      >
        <div className='space-y-2'>
          <label className='block text-sm font-semibold tracking-wide text-foreground uppercase'>
            Antall
          </label>
          <QuantitySelector />
        </div>
        <ModalSubmitButton
          product={product}
          selectedVariant={selectedVariant}
          quantity={quantity}
          isCheckoutPending={isCheckoutPending}
          isDisabled={!isAvailable || isPending}
          availableForSale={isAvailable}
          onCheckout={form.handleSubmit(onCheckout)}
        />
      </form>
    </Form>
  )
}

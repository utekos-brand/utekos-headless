import { Form } from '@/components/ui/form'
import { ModalSubmitButton } from './ModalSubmitButton'
import { QuantitySelector } from './QuantitySelector'
import type { AddToCartViewProps } from 'types/cart'

export function AddToCartView({
  form,
  onSubmit,
  onCheckout,
  isPending,
  isAddToCartPending,
  isCheckoutPending,
  isAvailable
}: AddToCartViewProps) {
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
          isAddToCartPending={isAddToCartPending}
          isCheckoutPending={isCheckoutPending}
          isDisabled={!isAvailable || isPending}
          availableForSale={isAvailable}
          onCheckout={form.handleSubmit(onCheckout)}
        />
      </form>
    </Form>
  )
}

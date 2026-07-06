import * as React from 'react'
import { Button as ButtonPrimitive } from '@base-ui/react/button'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils/className'

const buttonVariants = cva(
  'group/button inline-flex shrink-0 cursor-pointer items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:cursor-not-allowed [&_[&>svg]:pointer-events-none [&_[&>svg]:shrink-0 [&_svg:not([class*="size-"])]:size-4',
  {
    variants: {
      variant: {
        alternate:
          'bg-alternate-button text-foreground hover:scale-104 hover:bg-secondary',
        checkout: 'bg-primary text-primary-foreground hover:text-primary-foreground/90',
        'commerce-primary':
          'bg-primary text-primary-foreground hover:bg-primary-hover hover:text-primary-foreground',
        'commerce-secondary':
          'border-secondary bg-secondary text-secondary-foreground hover:bg-secondary/90 hover:text-secondary-foreground',
        default:
          'bg-primary text-primary-foreground hover:bg-primary-hover',
        outline:
          'border-input bg-background hover:bg-accent hover:text-accent-foreground',
        seeProduct:
          'border-border bg-sidebar-primary text-foreground shadow-xs aria-expanded:bg-accent aria-expanded:text-accent-foreground',
        secondary:
          'bg-secondary text-secondary-foreground aria-expanded:bg-secondary aria-expanded:text-secondary-foreground',
        ghost:
          'text-foreground hover:bg-accent hover:text-accent-foreground aria-expanded:bg-accent aria-expanded:text-accent-foreground',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:border-destructive focus-visible:ring-destructive/30',
        link: 'text-primary underline-offset-4 hover:underline'
      },
      size: {
        'default':
          'h-9 gap-1.5 px-3 in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2',
        'xs': 'h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*="size-"])]:size-3',
        'sm': 'h-8 gap-1 rounded-[min(var(--radius-md),10px)] px-2.5 in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5',
        'lg': 'h-10 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2',
        'icon': 'size-9',
        'icon-xs':
          'size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*="size-"])]:size-3',
        'icon-sm':
          'size-8 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg',
        'icon-lg': 'size-10'
      }
    },
    defaultVariants: { variant: 'default', size: 'default' }
  }
)

type ButtonProps = ButtonPrimitive.Props &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }

function Button({
  asChild = false,
  className,
  children,
  nativeButton,
  variant = 'default',
  size = 'default',
  ...props
}: ButtonProps) {
  const buttonClassName = cn(
    buttonVariants({ variant, size, className })
  )

  if (asChild && React.isValidElement(children)) {
    const child = React.Children.only(
      children
    ) as React.ReactElement<{ className?: string }>

    return React.cloneElement(child, {
      ...(props as Record<string, unknown>),
      'data-slot': 'button',
      'className': cn(buttonClassName, child.props.className)
    } as React.Attributes & {
      'className'?: string
      'data-slot': string
    })
  }

  return (
    <ButtonPrimitive
      data-slot='button'
      className={buttonClassName}
      nativeButton={nativeButton}
      {...props}
    >
      {children}
    </ButtonPrimitive>
  )
}

function AddToCartButton() {
  return (
    <button
      className={cn(
        'font-utekos-text transform rounded-full px-12 py-4 font-bold tracking-normal transition-colors duration-200 hover:scale-105'
      )}
    >
      Legg i handlekurv
    </button>
  )
}

function CheckoutButton() {
  return (
    <button
      className={cn(
        'transform rounded-full px-12 py-4 font-sans tracking-normal transition-colors duration-200 hover:scale-105'
      )}
    >
      Gå til kassen
    </button>
  )
}

export {
  Button,
  buttonVariants,
  AddToCartButton,
  CheckoutButton
}

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-button text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 shadow-button',
  {
    variants: {
      variant: {
        // Primary action — solid accent fill, high visual weight
        default:
          'bg-accent text-accent-foreground shadow-sm hover:bg-accent/90 active:bg-accent/80',
        // Secondary action — muted fill
        secondary:
          'bg-muted text-foreground shadow-sm hover:bg-muted/80 active:bg-muted/60',
        // Outlined — border only, transparent fill
        outline:
          'border-2 border-border text-foreground bg-transparent hover:bg-muted hover:border-accent active:bg-muted/60',
        // Ghost — no border, minimal presence
        ghost:
          'text-foreground hover:bg-muted active:bg-muted/60',
        // Link — underline only
        link: 'text-accent underline-offset-4 hover:underline',
        // Accent — alias of default kept for back-compat with existing call sites
        accent:
          'bg-accent text-accent-foreground shadow-sm hover:bg-accent/90 active:bg-accent/80',
      },
      size: {
        default: 'h-11 px-6 py-2',
        sm: 'h-9 px-4 text-xs',
        lg: 'h-12 px-8 text-base',
        xl: 'h-14 px-10 text-lg',
        icon: 'h-11 w-11',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

// eslint-disable-next-line react-refresh/only-export-components
export { Button, buttonVariants }

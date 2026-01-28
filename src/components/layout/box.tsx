import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { clsx } from 'clsx'

const boxVariants = cva('block', {
  variants: {
    padding: {
      none: '',
      sm: 'p-2',
      md: 'p-4',
      lg: 'p-6',
    },
    rounded: {
      none: '',
      sm: 'rounded-md',
      md: 'rounded-xl',
      lg: 'rounded-2xl',
    },
    border: {
      none: '',
      default: 'border border-border',
    },
    tone: {
      default: '',
      muted: 'bg-muted',
      elevated: 'bg-background shadow-sm',
    },
  },
  defaultVariants: {
    padding: 'none',
    rounded: 'none',
    border: 'none',
    tone: 'default',
  },
})

export interface BoxProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof boxVariants> {}

export function Box({
  className,
  padding,
  rounded,
  border,
  tone,
  ...props
}: BoxProps) {
  return (
    <div
      className={clsx(
        boxVariants({ padding, rounded, border, tone }),
        className
      )}
      {...props}
    />
  )
}

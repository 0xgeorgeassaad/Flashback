import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
  children: ReactNode
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'border border-marquee bg-marquee text-booth shadow-[0_12px_30px_rgb(255_176_0_/_12%)] hover:bg-screen hover:border-screen',
  secondary:
    'border border-line bg-reel text-screen hover:border-haze hover:bg-reel-raised',
  ghost: 'border border-transparent bg-transparent text-haze hover:border-line hover:bg-reel/80 hover:text-screen',
  danger:
    'border border-ticket/60 bg-ticket/10 text-screen hover:border-ticket hover:bg-ticket/20',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'min-h-9 px-3 text-xs',
  md: 'min-h-11 px-5 text-sm',
  lg: 'min-h-12 px-6 text-base',
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-tight transition-[background-color,border-color,color,transform,box-shadow] duration-200 ease-[var(--ease-archive)] hover:-translate-y-0.5 active:translate-y-0 disabled:translate-y-0 disabled:opacity-45 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

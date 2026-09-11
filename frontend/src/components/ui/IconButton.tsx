import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
}

const sizes = {
  sm: 'size-9',
  md: 'size-11',
  lg: 'size-12',
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { label, size = 'md', className = '', type = 'button', children, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      title={label}
      className={`inline-flex shrink-0 items-center justify-center rounded-full border border-line bg-reel text-screen transition-colors duration-200 hover:border-haze hover:bg-reel-raised disabled:opacity-45 ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
})

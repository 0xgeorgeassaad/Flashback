import type { ReactNode } from 'react'
import { IconButton } from './IconButton'

type ChipProps = {
  children: ReactNode
  active?: boolean
  removable?: boolean
  onRemove?: () => void
  className?: string
}

export function Chip({ children, active = false, removable = false, onRemove, className = '' }: ChipProps) {
  return (
    <span
      className={`inline-flex min-h-9 items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
        active ? 'border-marquee/70 bg-marquee/10 text-marquee-soft' : 'border-line bg-reel/70 text-haze-strong'
      } ${className}`}
    >
      <span>{children}</span>
      {removable && (
        <IconButton
          label={`Remove ${String(children)}`}
          size="sm"
          onClick={onRemove}
          className="-mr-1 size-6 border-transparent bg-transparent text-haze hover:border-line hover:bg-reel"
        >
          <svg viewBox="0 0 20 20" className="size-3.5" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
          </svg>
        </IconButton>
      )}
    </span>
  )
}

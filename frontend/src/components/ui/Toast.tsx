import type { ReactNode } from 'react'

type ToastProps = {
  open: boolean
  tone?: 'default' | 'success' | 'error'
  title: string
  description?: string
  action?: ReactNode
}

const tones = {
  default: 'border-line bg-reel text-screen',
  success: 'border-marquee/40 bg-reel text-screen',
  error: 'border-ticket/50 bg-reel text-screen',
}

export function Toast({ open, tone = 'default', title, description, action }: ToastProps) {
  if (!open) return null

  return (
    <div
      className={`pointer-events-auto w-full max-w-sm rounded-2xl border p-4 shadow-panel ${tones[tone]}`}
      role={tone === 'error' ? 'alert' : 'status'}
      aria-live={tone === 'error' ? 'assertive' : 'polite'}
    >
      <div className="flex items-start gap-3">
        <span className="mt-1 size-2 shrink-0 rounded-full bg-marquee" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-screen">{title}</p>
          {description ? <p className="mt-1 text-sm leading-6 text-haze">{description}</p> : null}
          {action ? <div className="mt-3">{action}</div> : null}
        </div>
      </div>
    </div>
  )
}

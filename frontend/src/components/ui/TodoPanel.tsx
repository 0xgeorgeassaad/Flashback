type TodoPanelProps = {
  owner: string
  title: string
  children: React.ReactNode
  className?: string
}

export function TodoPanel({ owner, title, children, className = '' }: TodoPanelProps) {
  return (
    <section
      className={`rounded-2xl border border-dashed border-line bg-reel/55 p-5 sm:p-6 ${className}`}
    >
      <p className="font-utility text-xs uppercase tracking-[0.18em] text-marquee">{owner}</p>
      <h2 className="mt-2 font-display text-xl leading-tight text-screen">{title}</h2>
      <div className="mt-3 text-sm leading-6 text-haze">{children}</div>
    </section>
  )
}

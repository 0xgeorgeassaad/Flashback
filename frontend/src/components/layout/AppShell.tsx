import { useEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Footer } from './Footer'
import { Navbar } from './Navbar'

export function AppShell() {
  const location = useLocation()
  const mainRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    mainRef.current?.focus()
  }, [location.pathname])

  return (
    <div className="flex min-h-svh flex-col bg-booth/65 text-screen">
      <a
        href="#main-content"
        className="fixed left-4 top-4 z-[90] -translate-y-24 rounded-full bg-marquee px-4 py-2 text-sm font-semibold text-booth shadow-glow transition-transform focus:translate-y-0"
      >
        Skip to main content
      </a>
      <Navbar />
      <main
        id="main-content"
        ref={mainRef}
        tabIndex={-1}
        className="mx-auto w-full max-w-7xl flex-1 px-5 py-8 outline-none sm:px-8 sm:py-12"
      >
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

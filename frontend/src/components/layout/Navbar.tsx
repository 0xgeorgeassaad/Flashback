import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useTaste } from '../../state/TasteContext'
import { useAuth } from '../../state/AuthContext'
import { Button } from '../ui/Button'
import { IconButton } from '../ui/IconButton'

const links = [
  { to: '/discover', label: 'Discover' },
  { to: '/taste', label: 'My picks' },
  { to: '/my-list', label: 'My list' },
]

function MenuIcon({ open }: { open: boolean }) {
  return open ? (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
    </svg>
  )
}

export function Navbar() {
  const { selectedMovies } = useTaste()
  const auth = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <header className="sticky top-0 z-50 border-b border-line/80 bg-booth/92 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-5 py-4 sm:px-8" aria-label="Primary navigation">
        <NavLink
          to="/home"
          onClick={() => setMobileOpen(false)}
          className="group inline-flex items-center gap-2 rounded-lg font-display text-xl tracking-tight text-marquee transition-colors hover:text-screen sm:text-2xl"
        >
          <span aria-hidden="true" className="inline-block h-5 w-1 rounded-full bg-ticket transition-transform group-hover:rotate-6" />
          Flashback
        </NavLink>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `rounded-full px-3.5 py-2 text-sm font-semibold transition-colors ${
                  isActive ? 'bg-screen text-booth' : 'text-haze hover:bg-reel/70 hover:text-screen'
                }`
              }
            >
              {link.label}
              {link.to === '/taste' ? ` (${selectedMovies.length})` : ''}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <NavLink
            to="/discover"
            className="hidden rounded-full border border-marquee/50 px-4 py-2 text-sm font-semibold text-marquee-soft transition-colors hover:border-marquee hover:bg-marquee/10 md:inline-flex"
          >
            Start discovering
          </NavLink>
          <span className="hidden max-w-44 truncate text-xs text-haze lg:inline" title={auth.user?.email ?? undefined}>
            {auth.user?.email}
          </span>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="hidden md:inline-flex"
            onClick={() => void auth.signOut()}
          >
            Sign out
          </Button>
          <IconButton
            label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            onClick={() => setMobileOpen((value) => !value)}
            className="md:hidden"
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
          >
            <MenuIcon open={mobileOpen} />
          </IconButton>
        </div>
      </nav>

      <div
        id="mobile-navigation"
        className={`${mobileOpen ? 'grid' : 'hidden'} border-t border-line/70 bg-booth px-5 pb-5 pt-3 md:hidden`}
      >
        <div className="grid gap-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                  isActive ? 'bg-screen text-booth' : 'text-haze hover:bg-reel hover:text-screen'
                }`
              }
            >
              <span>{link.label}</span>
              {link.to === '/taste' ? (
                <span className="font-utility text-xs">{selectedMovies.length}</span>
              ) : null}
            </NavLink>
          ))}
          <NavLink
            to="/discover"
            onClick={() => setMobileOpen(false)}
            className="mt-2 inline-flex items-center justify-center rounded-xl bg-marquee px-4 py-3 text-sm font-semibold text-booth"
          >
            Start discovering
          </NavLink>
          <Button type="button" variant="ghost" className="mt-1 w-full" onClick={() => void auth.signOut()}>
            Sign out
          </Button>
        </div>
      </div>
    </header>
  )
}

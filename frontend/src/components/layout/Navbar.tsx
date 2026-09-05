import { NavLink } from 'react-router-dom'
import { useTaste } from '../../state/TasteContext'

const links = [
  { to: '/discover', label: 'Discover' },
  { to: '/taste', label: 'My picks' },
  { to: '/my-list', label: 'My list' },
]

export function Navbar() {
  const { selectedMovies } = useTaste()

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-booth/90 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-5 py-4 sm:px-8">
        <NavLink to="/" className="font-display text-xl tracking-tight text-marquee sm:text-2xl">
          Flashback
        </NavLink>

        {/* TODO [Contributor 1]: replace this compact nav with a responsive, accessible mobile menu. */}
        <div className="flex items-center gap-1 sm:gap-3" aria-label="Primary navigation">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `rounded-full px-3 py-2 text-xs font-semibold sm:text-sm ${
                  isActive ? 'bg-screen text-booth' : 'text-haze hover:text-screen'
                }`
              }
            >
              {link.label}
              {link.to === '/taste' ? ` (${selectedMovies.length})` : ''}
            </NavLink>
          ))}
        </div>
      </nav>
    </header>
  )
}

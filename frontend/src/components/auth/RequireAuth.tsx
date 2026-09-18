import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../state/AuthContext'

export function RequireAuth() {
  const auth = useAuth()
  const location = useLocation()

  if (auth.status === 'loading') {
    return (
      <main className="grid min-h-svh place-items-center px-5 text-center">
        <div role="status">
          <span className="mx-auto block size-8 animate-spin rounded-full border-2 border-line border-t-marquee" />
          <p className="mt-4 font-utility text-xs uppercase tracking-[0.16em] text-haze">
            Restoring your session
          </p>
        </div>
      </main>
    )
  }

  if (auth.status !== 'authenticated') {
    return <Navigate to="/auth" replace state={{ from: location.pathname + location.search }} />
  }

  return <Outlet />
}

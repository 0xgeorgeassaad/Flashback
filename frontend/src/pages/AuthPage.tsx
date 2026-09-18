import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useSearchParams } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { useAuth } from '../state/AuthContext'

type AuthMode = 'sign-in' | 'sign-up'

export function AuthPage() {
  const auth = useAuth()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const [mode, setMode] = useState<AuthMode>(() =>
    searchParams.get('mode') === 'sign-up' ? 'sign-up' : 'sign-in',
  )
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const destination =
    typeof location.state === 'object' &&
    location.state !== null &&
    'from' in location.state &&
    typeof location.state.from === 'string'
      ? location.state.from
      : '/discover'

  if (auth.status === 'authenticated') return <Navigate to={destination} replace />

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setMessage(null)
    setFormError(null)

    try {
      const result =
        mode === 'sign-in'
          ? await auth.signIn(email, password)
          : await auth.signUp(email, password)
      if (result.error) {
        setFormError(result.error)
      } else if (result.confirmationRequired) {
        setMessage('Check your email to confirm the account, then return here to sign in.')
        setMode('sign-in')
      }
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Authentication failed. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  function changeMode(nextMode: AuthMode) {
    setMode(nextMode)
    setMessage(null)
    setFormError(null)
  }

  return (
    <main className="archive-grid grid min-h-svh place-items-center px-5 py-10">
      <section className="w-full max-w-md rounded-panel border border-line bg-booth/95 p-6 shadow-panel sm:p-8">
        <Link to="/" className="font-display text-2xl tracking-tight text-marquee">
          Flashback
        </Link>
        <p className="mt-2 text-sm leading-6 text-haze">
          Sign in to keep your taste reel, saved movies, and recommendation history available on every device.
        </p>

        <div className="mt-7 grid grid-cols-2 rounded-full border border-line bg-reel p-1" role="tablist" aria-label="Account action">
          {(['sign-in', 'sign-up'] as const).map((item) => (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={mode === item}
              onClick={() => changeMode(item)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                mode === item ? 'bg-marquee text-booth' : 'text-haze hover:text-screen'
              }`}
            >
              {item === 'sign-in' ? 'Sign in' : 'Create account'}
            </button>
          ))}
        </div>

        {auth.status === 'configuration-error' ? (
          <p role="alert" className="mt-5 rounded-xl border border-ticket/50 bg-ticket/10 p-4 text-sm leading-6 text-haze-strong">
            {auth.error}
          </p>
        ) : (
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="text-sm font-semibold text-screen">Email</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2 min-h-11 w-full rounded-control border border-line bg-reel px-4 text-sm text-screen placeholder:text-haze focus:border-marquee focus:outline-none"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="text-sm font-semibold text-screen">Password</label>
              <input
                id="password"
                type="password"
                autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'}
                required
                minLength={6}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-2 min-h-11 w-full rounded-control border border-line bg-reel px-4 text-sm text-screen placeholder:text-haze focus:border-marquee focus:outline-none"
                placeholder="At least 6 characters"
              />
            </div>

            {formError ? <p role="alert" className="text-sm text-ticket">{formError}</p> : null}
            {message ? <p role="status" className="text-sm leading-6 text-marquee-soft">{message}</p> : null}

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting
                ? 'Please wait...'
                : mode === 'sign-in'
                  ? 'Sign in'
                  : 'Create account'}
            </Button>
          </form>
        )}
      </section>
    </main>
  )
}

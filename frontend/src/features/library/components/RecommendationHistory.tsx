import { useEffect, useMemo, useState } from 'react'
import { Button } from '../../../components/ui/Button'
import type { RecommendationSession } from '../../../types'

type RecommendationHistoryProps = {
  sessions: RecommendationSession[]
  onReopen: (session: RecommendationSession) => void
  onRemove: (sessionId: string) => void
  onRestore: (session: RecommendationSession) => void
  availableMovieIds: ReadonlySet<number>
  catalogReady: boolean
}

type SessionGroup = {
  label: string
  sessions: RecommendationSession[]
}

export function RecommendationHistory({
  sessions,
  onReopen,
  onRemove,
  onRestore,
  availableMovieIds,
  catalogReady,
}: RecommendationHistoryProps) {
  const [pendingUndo, setPendingUndo] = useState<RecommendationSession | null>(null)
  const groups = useMemo(() => groupSessions(sessions), [sessions])

  useEffect(() => {
    if (!pendingUndo) return
    const timer = window.setTimeout(() => setPendingUndo(null), 6000)
    return () => window.clearTimeout(timer)
  }, [pendingUndo])

  function handleRemove(session: RecommendationSession) {
    onRemove(session.id)
    setPendingUndo(session)
  }

  function handleUndo() {
    if (!pendingUndo) return
    onRestore(pendingUndo)
    setPendingUndo(null)
  }

  return (
    <div className="space-y-5">
      {pendingUndo ? (
        <div
          role="status"
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-marquee/35 bg-marquee/10 px-4 py-3 text-sm text-screen"
        >
          <span>Removed one recommendation reel.</span>
          <Button type="button" size="sm" variant="secondary" onClick={handleUndo}>
            Undo removal
          </Button>
        </div>
      ) : null}

      {sessions.length === 0 ? (
        <div className="archive-grid rounded-panel border border-dashed border-line bg-reel/35 p-8 text-center sm:p-12">
          <h2 className="font-display text-2xl text-screen">No recommendation reels yet.</h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-haze">
            Completed recommendation sets are stored here automatically so you can reopen them whenever you sign in.
          </p>
        </div>
      ) : (
        <div className="space-y-7">
          {groups.map((group) => (
            <section key={group.label} aria-labelledby={`history-${slugify(group.label)}`}>
              <h2
                id={`history-${slugify(group.label)}`}
                className="font-utility text-xs uppercase tracking-[0.16em] text-haze"
              >
                {group.label}
              </h2>
              <ul className="mt-3 space-y-3">
                {group.sessions.map((session) => {
                  const unavailableCount = catalogReady
                    ? countUnavailableEntries(session, availableMovieIds)
                    : 0
                  return (
                    <li key={session.id} className="rounded-panel border border-line bg-reel/60 p-5">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold text-screen">
                              {session.recommendations[0]?.title ?? 'Saved recommendation reel'}
                            </p>
                            <span className="rounded-full border border-line bg-booth px-2 py-0.5 font-utility text-[0.65rem] uppercase tracking-wide text-haze">
                              {session.recommendations.length} results
                            </span>
                          </div>
                          <p className="mt-2 text-xs leading-5 text-haze">
                            Based on {session.selectedMovieIds.length} selected movies, saved at{' '}
                            {new Date(session.createdAt).toLocaleTimeString([], {
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                          </p>
                          {unavailableCount > 0 ? (
                            <p className="mt-2 text-xs text-ticket">
                              {unavailableCount} {unavailableCount === 1 ? 'catalog entry is' : 'catalog entries are'} no longer available. The saved result can still be reopened.
                            </p>
                          ) : null}
                        </div>

                        <div className="flex shrink-0 gap-2">
                          <Button type="button" size="sm" onClick={() => onReopen(session)}>
                            Reopen reel
                          </Button>
                          <Button type="button" size="sm" variant="danger" onClick={() => handleRemove(session)}>
                            Remove
                          </Button>
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}

function groupSessions(sessions: RecommendationSession[]): SessionGroup[] {
  const sorted = [...sessions].sort((first, second) => Date.parse(second.createdAt) - Date.parse(first.createdAt))
  const groups = new Map<string, RecommendationSession[]>()

  for (const session of sorted) {
    const label = dateLabel(session.createdAt)
    groups.set(label, [...(groups.get(label) ?? []), session])
  }

  return [...groups].map(([label, groupedSessions]) => ({ label, sessions: groupedSessions }))
}

function dateLabel(dateValue: string) {
  const date = new Date(dateValue)
  const today = new Date()
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const dayDifference = Math.round((startOfToday.getTime() - startOfDate.getTime()) / 86_400_000)

  if (dayDifference === 0) return 'Today'
  if (dayDifference === 1) return 'Yesterday'
  return date.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })
}

function countUnavailableEntries(
  session: RecommendationSession,
  availableMovieIds: ReadonlySet<number>,
) {
  const sessionIds = new Set([
    ...session.selectedMovieIds,
    ...session.recommendations.map((movie) => movie.movieId),
  ])
  return [...sessionIds].filter((movieId) => !availableMovieIds.has(movieId)).length
}

function slugify(value: string) {
  return value.toLocaleLowerCase().replaceAll(/[^a-z0-9]+/g, '-')
}

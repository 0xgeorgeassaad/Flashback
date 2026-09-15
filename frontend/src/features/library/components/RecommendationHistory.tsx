import { useState } from 'react'
import type { RecommendationSession } from '../../../types'

interface RecommendationHistoryProps {
  sessions: RecommendationSession[]
  onReopen: (
    session: RecommendationSession,
  ) => void
  onRemove: (sessionId: string) => void
  onRestore: (
    session: RecommendationSession,
  ) => void
}

const THIRTY_DAYS_MS =
  1000 * 60 * 60 * 24 * 30

export function RecommendationHistory({
  sessions,
  onReopen,
  onRemove,
  onRestore,
}: RecommendationHistoryProps) {
  const [currentTime] = useState(() => Date.now())
  const [pendingUndo, setPendingUndo] =
    useState<RecommendationSession | null>(
      null,
    )

  function handleRemove(
    session: RecommendationSession,
  ) {
    onRemove(session.id)
    setPendingUndo(session)

    window.setTimeout(() => {
      setPendingUndo((current) =>
        current?.id === session.id
          ? null
          : current,
      )
    }, 6000)
  }

  function handleUndo() {
    if (!pendingUndo) return

    onRestore(pendingUndo)
    setPendingUndo(null)
  }

  function isStale(
  session: RecommendationSession,
) {
  return (
    currentTime -
      new Date(session.createdAt).getTime() >
    THIRTY_DAYS_MS
  )
}

  if (sessions.length === 0) {
    return (
      <p className="rounded-lg bg-reel p-6 text-center text-haze">
        No recommendation sessions saved yet.
        Completed reels will show up here.
      </p>
    )
  }

  return (
    <div>
      {pendingUndo && (
        <div
          role="status"
          className="mb-4 flex items-center justify-between rounded-md bg-ticket/20 px-4 py-2 text-sm text-screen"
        >
          <span>
            Removed a saved session.
          </span>

          <button
            type="button"
            onClick={handleUndo}
            className="font-semibold text-marquee underline focus:outline-none focus:ring-2 focus:ring-marquee"
          >
            Undo
          </button>
        </div>
      )}

      <ul className="flex flex-col gap-3">
        {sessions.map((session) => (
          <li
            key={session.id}
            className="rounded-lg bg-reel p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-medium text-screen">
                  {new Date(
                    session.createdAt,
                  ).toLocaleDateString()}{' '}
                  ·{' '}
                  {
                    session.recommendations
                      .length
                  }{' '}
                  results
                </p>

                <p className="text-xs text-haze">
                  Based on{' '}
                  {
                    session
                      .selectedMovieIds
                      .length
                  }{' '}
                  selected movies
                  {isStale(session)
                    ? ' · older session'
                    : ''}
                </p>
              </div>

              <div className="flex gap-3 text-sm">
                <button
                  type="button"
                  onClick={() =>
                    onReopen(session)
                  }
                  className="font-semibold text-marquee underline focus:outline-none focus:ring-2 focus:ring-marquee"
                >
                  Reopen
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleRemove(session)
                  }
                  className="text-ticket underline focus:outline-none focus:ring-2 focus:ring-marquee"
                >
                  Remove
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
} 
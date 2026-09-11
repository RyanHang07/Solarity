import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getGoalRecord } from "@/lib/supabase/goal-record"
import { CheckinPhoto } from "@/components/checkin-photo"

/**
 * Step 16. One goal's record.
 *
 * **A row per day you checked it off**, newest first, with that day's note and
 * photo. This is the thing the archived list existed to point at: what a goal
 * actually was, rather than that it happened.
 *
 * **Not a calendar of hits and misses.** Only check-ins are stored, so misses
 * would have to be derived from the goal's lifetime — possible, and a different
 * feature. A wall of gaps on a goal somebody abandoned is not a record anyone
 * asked for.
 *
 * **Photos older than 90 days are gone**, by retention. An old goal shows dates
 * and notes with no images, which the page says once rather than leaving as a
 * row of broken frames.
 */

function on(value: string) {
  return new Date(value).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  })
}

export default async function GoalRecordPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ page?: string }>
}) {
  const { id } = await params
  const { page } = await searchParams

  // `Number()` on a missing value is 0, and on nonsense it is NaN — which would
  // become a negative `range` and an empty page that looks like a goal with no
  // history. Clamped rather than trusted.
  const pageNumber = Math.max(0, Number.parseInt(page ?? "0", 10) || 0)

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/sign-in")

  const record = await getGoalRecord(supabase, user.id, id, pageNumber)
  // Somebody else's goal is filtered out by RLS and arrives here as an absence,
  // which is the same answer as a goal that does not exist. Both are a 404.
  if (!record) notFound()

  const { goal, days, total, hasMore } = record
  const ended = goal.achievedAt ?? goal.archivedAt

  return (
    <div className="flex flex-col gap-5">
      <Link
        href={ended ? "/dashboard/goals/archived" : "/dashboard/goals"}
        className="ds-link self-start"
      >
        ← {ended ? "Archived and achieved" : "Goals"}
      </Link>

      <section aria-label={`${goal.title} record`} className="flex flex-col gap-1">
        {/*
          `items-center` on the heading row so the category dot sits on the
          title's optical centre rather than its top — the dot is 12px against
          a 20px cap height, so a stretched or baseline default puts it visibly
          high.
        */}
        <h1 className="ds-type-title ds-text-primary flex items-center gap-2">
          <span
            aria-hidden
            className="inline-block size-3 shrink-0 rounded-full"
            style={{ background: goal.color ?? undefined }}
          />
          {goal.title}
        </h1>
        <p className="ds-type-note ds-text-muted">
          {goal.category ? `${goal.category} · ` : null}
          Started {on(goal.createdAt)}
          {ended ? ` · ${goal.achievedAt ? "achieved" : "archived"} ${on(ended)}` : null}
          {goal.deadline ? ` · deadline ${on(goal.deadline)}` : null}
        </p>
        <p className="ds-text-muted">
          {total === 1 ? "1 day checked off" : `${total} days checked off`}
        </p>
      </section>

      {days.length === 0 ? (
        <p className="ds-text-muted">
          {total === 0
            ? "This goal was never checked off."
            : "No days on this page."}
        </p>
      ) : (
        <>
          <ul aria-label="Check-ins" className="flex flex-col gap-2">
            {days.map((d) => (
              <li key={d.date} className="ds-panel flex flex-col gap-2 px-3 py-2">
                <span className="ds-type-label ds-text-primary">{on(d.date)}</span>

                {d.note ? (
                  // `whitespace-pre-wrap`: a note is something you typed, and
                  // the line breaks are part of what you said.
                  <span className="ds-text-primary whitespace-pre-wrap">
                    {d.note}
                  </span>
                ) : null}

                {d.photoUrl ? (
                  <CheckinPhoto
                    url={d.photoUrl}
                    alt={`Check-in photo for ${goal.title} on ${on(d.date)}`}
                  />
                ) : null}
              </li>
            ))}
          </ul>

          <p className="ds-type-note ds-text-muted">
            {/*
              Said once, at the bottom, rather than on every dateless row.
              Somebody scrolling a two-year-old goal should understand why the
              early days have no pictures without having to work it out.
            */}
            Photos are kept for 90 days. Older check-ins keep their date and
            note, and the picture is gone.
          </p>

          {(hasMore || pageNumber > 0) && (
            /*
              The empty `<span />` on either side is load-bearing:
              `justify-between` needs two children to push one link to each
              edge, so a single "Older →" would otherwise sit on the left where
              "← Newer" belongs. `items-center` keeps the pair level when one
              wraps.
            */
            <nav className="flex items-center justify-between gap-3">
              {pageNumber > 0 ? (
                <Link
                  href={`/dashboard/goals/${goal.id}?page=${pageNumber - 1}`}
                  className="ds-link"
                >
                  ← Newer
                </Link>
              ) : (
                <span />
              )}
              {hasMore ? (
                <Link
                  href={`/dashboard/goals/${goal.id}?page=${pageNumber + 1}`}
                  className="ds-link"
                >
                  Older →
                </Link>
              ) : (
                <span />
              )}
            </nav>
          )}
        </>
      )}
    </div>
  )
}

import Link from "next/link"
import { redirect } from "next/navigation"
import { Panel } from "@/components/ui/panel"
import { createClient } from "@/lib/supabase/server"
import { getRetiredGoals } from "@/lib/supabase/goal-record"

export const metadata = { title: "Archived and achieved — Solarity" }

/**
 * Step 16. Goals that have finished, one way or the other.
 *
 * **A page rather than the `<details>` it replaced.** Two goals get one line
 * each in an expander; twenty get a scroll inside a screen about today. This is
 * where a goal you kept for six months is worth looking at.
 *
 * **Achieved and archived are shown together and labelled apart.** They are the
 * two ways a goal ends and both are history worth keeping — but they are not
 * the same thing, and `schema.md` is explicit that `archived_at` is not a
 * synonym for `achieved_at`.
 */

/** UTC-pinned, like every other date in this app. See `lib/goal-deadline.ts`. */
function on(value: string) {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  })
}

export default async function ArchivedGoalsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/sign-in")

  const goals = await getRetiredGoals(supabase, user.id)

  return (
    <Panel
      title="Archived and achieved"
      aria-label="Archived and achieved"
      action={
        <Link href="/dashboard/goals" className="ds-link">
          ← Active goals
        </Link>
      }
    >
      {goals.length === 0 ? (
        <p className="ds-text-muted">
          Nothing here yet. Goals you achieve or archive are kept, with every
          day you checked them off.
        </p>
      ) : (
        <ul className="flex flex-col">
          {goals.map((g) => (
            <li
              key={g.id}
              className="ds-border-oatmeal border-b last:border-b-0"
            >
              <Link
                href={`/dashboard/goals/${g.id}`}
                className="flex flex-col gap-1 py-3"
              >
                <span className="flex items-center gap-2">
                  <span
                    aria-hidden
                    className="inline-block size-3 shrink-0 rounded-full"
                    style={{ background: g.color ?? undefined }}
                  />
                  {/*
                    `ds-type-label`, not `font-medium`. The token is 0.875rem
                    at weight 500 — identical values, and one of them stays in
                    step with the scale.
                  */}
                  <span className="ds-type-label ds-text-primary">{g.title}</span>
                  {/*
                    The distinction, in a word. Achieving is finishing;
                    archiving is stopping. A record that conflated them would be
                    telling somebody they completed something they abandoned.
                  */}
                  <span className="ds-type-note ds-text-muted">
                    {g.achievedAt ? "achieved" : "archived"}
                  </span>
                </span>

                <span className="ds-type-note ds-text-muted">
                  {on(g.createdAt)} –{" "}
                  {on(g.achievedAt ?? g.archivedAt ?? g.createdAt)}
                  {g.category ? ` · ${g.category}` : null}
                </span>

                <span className="ds-type-note ds-text-muted">
                  {/* The number that makes this a record rather than a list. */}
                  {g.checkins === 1 ? "1 day checked off" : `${g.checkins} days checked off`}
                  {g.deadline ? ` · deadline was ${on(g.deadline)}` : null}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  )
}

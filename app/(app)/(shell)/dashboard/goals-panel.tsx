"use client"

import { useActionState, useEffect, useRef } from "react"
import { useFormStatus } from "react-dom"
import {
  createGoal,
  achieveGoal,
  archiveGoal,
  setCircleVisibility,
  setGoalDeadline,
  setHiddenEverywhere,
} from "@/app/actions/goals"
import { PrimaryButton } from "@/components/ui/button"
import { FormError } from "@/components/ui/field"
import { Panel } from "@/components/ui/panel"
import { deadlineLabel, isOverdue } from "@/lib/goal-deadline"
import type { ActionResult } from "@/lib/errors"

type Category = { slug: string; name: string; color_hex: string }
type Circle = { id: string; name: string }
type Goal = {
  id: string
  title: string
  archived_at: string | null
  achieved_at: string | null
  /** A calendar date, `YYYY-MM-DD`. A `date` column since migration 84. */
  deadline: string | null
  hidden_everywhere: boolean
  goal_categories: { name: string; color_hex: string } | null
}

/**
 * Step 14d. One goal's deadline: set, changed and removed by the same control.
 *
 * **An explicit Save rather than submitting on change**, which is what every
 * other control in this panel does. A date input fires `change` while you are
 * still picking on some platforms, so an auto-submitting field would write
 * intermediate dates and revalidate the page under the picker.
 *
 * **Clearing the field removes the deadline.** That is why there is no separate
 * remove button, and why the field carries no `min` and no default: the column
 * is nullable on purpose, most daily goals have no end date, and defaulting to
 * today would turn an opt-in field into an opt-out one and make every new goal
 * look overdue tomorrow.
 */
function Deadline({
  goal,
  today,
  action,
}: {
  goal: Goal
  /** The check-in date, from Postgres. Never `Date.now()`; see `lib/goal-deadline`. */
  today: string | null
  action: (formData: FormData) => void
}) {
  const label = deadlineLabel(goal.deadline, today)
  const overdue = isOverdue(goal.deadline, today)
  const inputId = `deadline-${goal.id}`

  return (
    <form
      action={action}
      className="ds-type-note mt-1 flex flex-wrap items-center gap-2"
    >
      <input type="hidden" name="goalId" value={goal.id} />
      <label htmlFor={inputId} className="ds-text-muted">
        Deadline
      </label>
      {/*
        `defaultValue`, not `value`. The server prop is the truth after a save
        and React reuses this node across the revalidate, so an uncontrolled
        input keeps what was typed and the next server render agrees with it.
      */}
      <input
        id={inputId}
        type="date"
        name="deadline"
        defaultValue={goal.deadline ?? ""}
        /*
          `ds-field` carries the `filter: invert(1)` fix for the native date
          glyph — `globals.css` applies it unconditionally now the app is
          dark-only, because leaving it in a `prefers-color-scheme` query hid
          the picker icon for anyone whose OS is set to light.
        */
        className="ds-field px-2 py-1"
      />
      <button type="submit" className="ds-link">
        Save
      </button>
      {label ? (
        // Colour is not the only signal: the word "Overdue" is in the text, so
        // this reads the same to anyone who cannot see the red.
        <span className={overdue ? "ds-text-danger" : "ds-text-muted"}>
          {label}
        </span>
      ) : null}
    </form>
  )
}

/**
 * **`inline`, because this sits at the end of the add-goal row.** Its bottom
 * lands on the title field's bottom rather than four pixels below it. The row
 * below says `items-end` so the two agree rather than one overriding the other.
 */
function Submit({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus()
  return (
    <PrimaryButton type="submit" disabled={pending} inline>
      {pending ? pendingLabel : label}
    </PrimaryButton>
  )
}

/**
 * One goal's visibility, collapsed until asked for.
 *
 * **Collapsed matters.** Ten goals across six Circles is sixty controls, and on
 * almost every day you want none of them. `<details>` rather than React state
 * so it survives the re-render `revalidatePath` triggers after each toggle:
 * component state would snap shut the moment you used it.
 *
 * The switches submit a form each rather than firing on change, so this works
 * before hydration and reports its own failures. `hidden` is sent only when
 * asking to hide, matching the `noteShared` convention in `checkIn`: the safer
 * outcome is what a missing field produces.
 */
function Visibility({
  goal,
  circles,
  hiddenGroupIds,
  circleAction,
  everywhereAction,
}: {
  goal: Goal
  circles: Circle[]
  hiddenGroupIds: string[]
  circleAction: (formData: FormData) => void
  everywhereAction: (formData: FormData) => void
}) {
  const hiddenSet = new Set(hiddenGroupIds)
  const everywhere = goal.hidden_everywhere

  // Counted against the Circles actually listed, not against every row in the
  // table.
  //
  // `hiddenGroupIds` includes Circles that have since been archived or locked,
  // and `circles` holds only the active ones, so `hiddenSet.size` over
  // `circles.length` could read "Hidden from 3 of 2". Rows for inactive Circles
  // are deliberately kept — archiving is not a decision to un-hide, and the
  // Circle may reopen — which is exactly why the denominator and the numerator
  // have to be drawn from the same list.
  const hiddenHere = circles.filter((c) => hiddenSet.has(c.id)).length

  // What the summary has to say without being opened, because a goal hidden
  // from people is not a state anyone should have to go looking for.
  const summary = everywhere
    ? "Hidden from every Circle"
    : hiddenHere
      ? `Hidden from ${hiddenHere} of ${circles.length}`
      : "Visible to all your Circles"

  return (
    <details className="mt-1">
      <summary className="ds-link ds-type-note cursor-pointer">{summary}</summary>

      {/*
        `border-l` becomes `ds-border-oatmeal`: an untokenised border here fell
        through to the browser's default `currentColor`, so the rule took on
        whatever ink the nearest text set and changed shade between the two
        branches of the master switch.
      */}
      <div className="ds-border-oatmeal mt-2 flex flex-col gap-2 border-l pl-3">
        <form action={everywhereAction} className="flex items-center gap-2">
          <input type="hidden" name="goalId" value={goal.id} />
          {!everywhere ? <input type="hidden" name="hidden" value="on" /> : null}
          {/*
            The two labels are `roster.spec.ts` locators — "Hide from every
            Circle" and "Show in my Circles again" are matched by exact name —
            so the strings are fixed and only the styling moves.
          */}
          <button type="submit" className="ds-link ds-type-note">
            {everywhere ? "Show in my Circles again" : "Hide from every Circle"}
          </button>
          <span className="ds-type-note ds-text-muted">
            {everywhere
              ? "Including any Circle you join later."
              : "Covers Circles you join later, which per-Circle switches cannot."}
          </span>
        </form>

        {circles.length === 0 ? (
          <p className="ds-type-note ds-text-muted">
            You&apos;re not in any active Circles, so there is nothing to hide it
            from yet.
          </p>
        ) : (
          <ul className="ds-type-note flex flex-col gap-1">
            {circles.map((c) => {
              const hidden = hiddenSet.has(c.id)
              return (
                <li key={c.id} className="flex items-center gap-2">
                  <span className="ds-text-primary min-w-32">{c.name}</span>
                  {/* Disabled, not hidden, and it says why. A switch that reads
                      "visible" while the goal is hidden everywhere would be a
                      lie about what other people can see. The underlying row is
                      left alone, so turning the master switch off restores
                      whatever was chosen here before. */}
                  {everywhere ? (
                    <span className="ds-text-muted">hidden everywhere</span>
                  ) : (
                    <form action={circleAction}>
                      <input type="hidden" name="goalId" value={goal.id} />
                      <input type="hidden" name="groupId" value={c.id} />
                      {!hidden ? (
                        <input type="hidden" name="hidden" value="on" />
                      ) : null}
                      {/*
                        "show it" / "hide it" are matched as regexes by
                        `roster.spec.ts`. The middot form carries the current
                        state *and* the action in one control, which is why it
                        reads oddly out of context and must not be tidied.
                      */}
                      <button type="submit" className="ds-link">
                        {hidden ? "hidden · show it" : "visible · hide it"}
                      </button>
                    </form>
                  )}
                </li>
              )
            })}
          </ul>
        )}

        <p className="ds-type-note ds-text-muted">
          Hiding covers the title only. The goal still counts toward your day and
          toward what your Circle sees you complete.
        </p>
      </div>
    </details>
  )
}

export function GoalsPanel({
  goals,
  categories,
  circles,
  hiddenIn,
  today,
}: {
  goals: Goal[]
  categories: Category[]
  circles: Circle[]
  hiddenIn: Record<string, string[]>
  /**
   * The caller's check-in date, or null if the RPC failed.
   *
   * **Passed down rather than computed here.** "Is this overdue" and "does
   * today count" have to be the same day, and a client component asking the
   * browser would disagree with the database for two hours either side of the
   * boundary. See `lib/goal-deadline.ts`.
   */
  today: string | null
}) {
  const [createState, createAction] = useActionState<ActionResult | null, FormData>(
    createGoal,
    null,
  )
  const [archiveState, archiveAction] = useActionState<ActionResult | null, FormData>(
    archiveGoal,
    null,
  )
  const [achieveState, achieveAction] = useActionState<ActionResult | null, FormData>(
    achieveGoal,
    null,
  )
  const [deadlineState, deadlineAction] = useActionState<ActionResult | null, FormData>(
    setGoalDeadline,
    null,
  )
  // One state per action rather than one per goal. The switches render from the
  // server props above, never from these, so a result left over from an earlier
  // submission cannot masquerade as the current state; they carry the error
  // message and nothing else. See the `useActionState` note in build-plan.md.
  const [circleVisState, circleVisAction] = useActionState<
    ActionResult | null,
    FormData
  >(setCircleVisibility, null)
  const [everywhereState, everywhereAction] = useActionState<
    ActionResult | null,
    FormData
  >(setHiddenEverywhere, null)

  const formRef = useRef<HTMLFormElement>(null)
  useEffect(() => {
    if (createState?.ok) formRef.current?.reset()
  }, [createState])

  const active = goals.filter((g) => !g.archived_at && !g.achieved_at)

  return (
    // Named, so it is a landmark rather than an anonymous `section`. The
    // dashboard renders each goal title twice, here and in Today, and without a
    // handle on this one every locator that mentions a title is ambiguous.
    <Panel title="Your goals" aria-label="Your goals">
      <form ref={formRef} action={createAction} className="flex flex-col gap-2">
        {/*
          `items-end`, so the wrapped row lands the select and the button on the
          title field's baseline instead of stretching all three to the tallest.
          Both controls say `inline`, which resolves to `self-end` and agrees
          with this rather than fighting it.
        */}
        <div className="flex flex-wrap items-end gap-2">
          <input
            name="title"
            required
            maxLength={100}
            autoComplete="off"
            placeholder="Run 5k"
            /*
              `aria-label`, not a visible label, and it is a locator:
              `gates.spec.ts` and `goals.spec.ts` both use
              `getByLabel("Goal title")`. The placeholder is not a label and
              never was — it disappears the moment anyone types.
            */
            aria-label="Goal title"
            className="ds-field min-w-48 flex-1"
          />

          {/*
            **Not the `Select` component.** That renders its own `<label>`;
            this field is named by `aria-label` because the row has no room for
            two visible labels and the placeholder option carries the meaning.
            The iOS reasoning below is why the option list stays inline.
          */}
          {/* Categories are seeded and referenced by slug. The UUIDs differ per
              environment, so the value here is never an id. */}
          <select
            name="category"
            required
            defaultValue=""
            aria-label="Category"
            className="ds-field"
          >
            {/*
              **Not `disabled`, and that is the whole fix for iOS.**

              iOS renders a `<select>` as a wheel and skips disabled options
              entirely. With the placeholder disabled the wheel opened showing
              the first real category *highlighted* while the element's value
              was still `""`, so tapping Done moved nothing, fired no `change`,
              and submitted an empty category. The picker said "Career &
              Professional" and the form disagreed — which reads as the
              selection simply not working.

              Selectable, the displayed row is always the real value: the wheel
              opens on "Choose a category", and picking anything commits it.
              `required` still stops an empty submit, and now the browser's
              complaint matches what the person can see.
            */}
            <option value="">Choose a category</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
          <Submit label="Add goal" pendingLabel="Adding…" />
        </div>
        <p className="ds-type-note ds-text-muted">
          Up to 10 active goals. A day counts only when every active goal is
          checked off, so keep the list honest.
        </p>

        {createState && !createState.ok ? (
          <FormError>{createState.error}</FormError>
        ) : null}
      </form>

      {[
        achieveState,
        archiveState,
        deadlineState,
        circleVisState,
        everywhereState,
      ].map((st, i) =>
        st && !st.ok ? <FormError key={i}>{st.error}</FormError> : null,
      )}

      {!active.length ? (
        <p className="ds-text-muted mt-3">No active goals yet.</p>
      ) : (
        /*
          Hairlines between siblings rather than a box each, the same as
          `TodayPanel`. Ten bordered rows inside one card drew eleven rectangles
          for one list.
        */
        <ul className="mt-3 flex flex-col">
          {active.map((g) => (
            <li
              key={g.id}
              className="ds-border-oatmeal border-b py-3 last:border-b-0 last:pb-0"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2">
                  {/*
                    The category's own colour, straight from the row. Not a
                    token: these are data, seeded per category, and the galaxy
                    draws the same six hues — tokenising them would put the
                    palette in two places.
                  */}
                  <span
                    aria-hidden
                    className="inline-block size-3 shrink-0 rounded-full"
                    style={{ background: g.goal_categories?.color_hex }}
                  />
                  <span className="ds-text-primary">{g.title}</span>
                  <span className="ds-type-note ds-text-muted">
                    {g.goal_categories?.name}
                  </span>
                </span>

                <span className="flex shrink-0 items-center gap-3">
                  {/*
                    Step 14c. **Achieve sits before Archive because it is the
                    better outcome**, and because the two are easy to confuse:
                    both retire the goal and both move today's denominator, but
                    only this one counts toward `total_goals_achieved`.

                    **The confirmation is here and not on Archive.** Archiving
                    is reversible — nothing stops `archived_at` going back to
                    null — while migration 83 refuses to clear `achieved_at`
                    once set, because the lifetime counter has already moved.
                    The same rule `RowButton` follows on Undo: a dialog appears
                    only when something cannot be got back. A confirmation
                    people meet on every button is one they stop reading.
                  */}
                  <form action={achieveAction}>
                    <input type="hidden" name="goalId" value={g.id} />
                    <button
                      type="submit"
                      className="ds-link ds-type-note"
                      title="Mark this goal finished. It stops counting toward your day."
                      onClick={(e) => {
                        if (
                          !window.confirm(
                            `Mark "${g.title}" as achieved?\n\nIt stops counting toward your daily check-in, and this can't be undone.`,
                          )
                        ) {
                          e.preventDefault()
                        }
                      }}
                    >
                      Achieve
                    </button>
                  </form>

                  <form action={archiveAction}>
                    <input type="hidden" name="goalId" value={g.id} />
                    <button
                      type="submit"
                      className="ds-link ds-type-note"
                      // Archiving changes the denominator for today, so it can
                      // re-complete a day that was incomplete a moment ago.
                      title="Archive this goal"
                    >
                      Archive
                    </button>
                  </form>
                </span>
              </div>

              <Deadline goal={g} today={today} action={deadlineAction} />

              <Visibility
                goal={g}
                circles={circles}
                hiddenGroupIds={hiddenIn[g.id] ?? []}
                circleAction={circleVisAction}
                everywhereAction={everywhereAction}
              />
            </li>
          ))}
        </ul>
      )}

      {/*
        **Retired goals are a page, not an expander.** This used to be a
        `<details>` listing "title · archived", which is a line about a goal
        rather than a record of one. `/dashboard/goals/archived` shows when each
        started and ended and how many days it was checked off, and links to the
        full record. The page that renders this panel owns the link, so the two
        cannot both claim the same text.
      */}
    </Panel>
  )
}

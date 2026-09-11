"use client"

import { useActionState, useState } from "react"
import { useFormStatus } from "react-dom"
import { checkIn, undoCheckIn } from "@/app/actions/check-ins"
import { PhotoButton } from "./photo-button"
import { CheckinPhoto } from "@/components/checkin-photo"
import { PhaseMark } from "@/components/marks/marks"
import { Panel } from "@/components/ui/panel"
import { FormError } from "@/components/ui/field"

/** Mirrors the NOTE_MAX in `app/actions/check-ins.ts`. */
const NOTE_MAX = 500
import type { ActionResult } from "@/lib/errors"
// One declaration, shared with the server reader. It used to be re-declared
// here, so every field added to one had to be remembered into the other.
import type { TodayGoal } from "@/lib/today-shape"

function RowButton({
  label,
  done,
  confirm,
}: {
  label: string
  done: boolean
  /**
   * Shown before the submit goes through, or absent for no dialog at all.
   *
   * **Conditional on purpose.** A confirmation people meet every time is one
   * they stop reading, and a check-in with no photo is trivially redone. This
   * appears only when Undo is about to destroy something that cannot be got
   * back.
   */
  confirm?: string
}) {
  const { pending } = useFormStatus()
  return (
    /*
      **The label went `sr-only` and the disc became the control.** The phase
      mark is the system's one signature element and this is the row it was
      built for: a sun that fills as the day is finished says the state without
      a word, and a screen of ten text buttons said it ten times.

      **The accessible name is unchanged, and that is deliberate.** Four specs
      and nine call sites locate this by `name: "Check in"` and `name: "Undo"`.
      The catalog's version said "Undo check-in", which would still have matched
      `"Undo"` by substring and *not* matched `"Check in"` only because of a
      hyphen — precisely the kind of accident that made "Settings" match
      "Account settings". Keeping the exact strings means the design moved and
      no locator did.

      `title` gives a pointer user the same word on hover. It does not touch the
      accessible name, because the `sr-only` span already provides one.
    */
    <button
      type="submit"
      disabled={pending}
      title={label}
      aria-pressed={done}
      onClick={(e) => {
        if (confirm && !window.confirm(confirm)) e.preventDefault()
      }}
      className="ds-phase ds-text-flame"
    >
      <PhaseMark done={done} size={30} />
      <span className="sr-only">{pending ? "Saving…" : label}</span>
    </button>
  )
}

export function TodayPanel({
  goals,
  userId,
  completedToday,
  streak,
  streakIncludesToday,
  hideStreak = false,
}: {
  goals: TodayGoal[]
  /**
   * The signed-in user, passed down rather than fetched here.
   *
   * `photoKey` needs it, and a client component asking Supabase who it is would
   * be a round trip to learn something the server already knew when it rendered
   * this.
   */
  userId: string
  completedToday: boolean
  /** Settled days plus today, computed at display time. Never stored. */
  streak: number
  streakIncludesToday: boolean
  /**
   * `/today` renders its own streak header above this, with the extra states a
   * broken run needs. Two streak lines on one screen would be one too many.
   */
  hideStreak?: boolean
}) {
  const [checkState, checkAction] = useActionState<ActionResult | null, FormData>(
    checkIn,
    null,
  )
  const [undoState, undoAction] = useActionState<ActionResult | null, FormData>(
    undoCheckIn,
    null,
  )

  const done = goals.filter((g) => g.checkedIn).length

  /**
   * Two actions share one error line, so which state is current has to be
   * tracked. Reading both and taking the first failure looks equivalent and is
   * not: a failed check-in keeps its result forever, so undoing successfully
   * afterwards left the old error on screen under a row that had just worked.
   *
   * Recorded on submit rather than derived. Neither form unmounts when it
   * submits, so this is safe here, unlike the confirm-and-replace flow in
   * `invite-panel.tsx` where the same trick would abort the action.
   */
  const [last, setLast] = useState<"check" | "undo" | null>(null)

  // Which goal has its note field open. One at a time: ten permanently visible
  // textareas would be ten mostly-empty boxes, and the fast path is a single
  // tap on `Check in` with no note at all.
  const [noteFor, setNoteFor] = useState<string | null>(null)
  const current = last === "undo" ? undoState : last === "check" ? checkState : null
  const error = current && !current.ok ? current.error : null

  return (
    <Panel
      title="Today"
      accent
      action={
        <span className="ds-type-note ds-text-muted">
          {done} of {goals.length}
        </span>
      }
    >
      {/*
        **`accent` here and nowhere else on the dashboard.** The flame corners
        are the one-per-screen mark, and this is the card the screen exists for
        — everything below it is context for whether these rows are ticked.
      */}
      {hideStreak ? null : (
        <p className="mb-3">
          <strong className="ds-type-metric ds-text-flame">
            {streak} day{streak === 1 ? "" : "s"}
          </strong>{" "}
          <span className="ds-text-muted">
            {streak === 0
              ? "Check off every goal to start a streak."
              : streakIncludesToday
                ? "including today, which counts once the day ends."
                : "so far. Today is not counted yet."}
          </span>
        </p>
      )}

      {!goals.length ? (
        <p className="ds-text-muted">
          No active goals. A day with no goals counts as incomplete, not as a
          free pass, so add one below.
        </p>
      ) : (
        /*
          **Hairline-separated rows inside one card, not ten bordered boxes.**
          Ten `rounded border` rows drew eleven rectangles for one list and made
          each goal look like its own panel. The rule between them is enough to
          say "these are siblings", and `last:border-b-0` stops the list closing
          with a line that has nothing under it.
        */
        <ul className="flex flex-col">
          {goals.map((g) => (
            <li
              key={g.id}
              className="ds-border-oatmeal border-b py-3 last:border-b-0 last:pb-0"
            >
              {/*
                The form wraps the whole row so the note and its sharing tick
                are submitted with the check-in. `checkIn` writes all three in
                the single insert it already performed; attaching a note after
                the fact would need a second action and a second round trip.
              */}
              <form
                action={g.checkedIn ? undoAction : checkAction}
                onSubmit={() => setLast(g.checkedIn ? "undo" : "check")}
                className="flex flex-col gap-2"
              >
                <input type="hidden" name="goalId" value={g.id} />

                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2">
                    <span
                      aria-hidden
                      className="inline-block size-3 shrink-0 rounded-full"
                      style={{ background: g.color ?? undefined }}
                    />
                    <span
                      className={
                        g.checkedIn
                          ? "ds-text-muted line-through"
                          : "ds-text-primary"
                      }
                    >
                      {g.title}
                    </span>
                  </span>

                  <span className="flex shrink-0 items-center gap-2">
                    {/* Behind a link, not always visible: ten goals would mean
                        ten mostly-empty textareas, and the common case is one
                        tap with nothing to say. */}
                    {!g.checkedIn ? (
                      <button
                        type="button"
                        onClick={() => setNoteFor(noteFor === g.id ? null : g.id)}
                        aria-expanded={noteFor === g.id}
                        className="ds-link ds-type-note"
                      >
                        {noteFor === g.id ? "Cancel note" : "+ note"}
                      </button>
                    ) : null}

                    {/*
                      Only once checked in: the object key is
                      `{user_id}/{goal_id}/{entry_id}`, so there is nothing to
                      address until the entry exists. Checking in and then
                      tapping this is the same two taps as picking a file inside
                      the form would have been, because picking a file is itself
                      a tap and a sheet.
                    */}
                    {g.checkedIn && g.entryId ? (
                      <PhotoButton
                        entryId={g.entryId}
                        goalId={g.id}
                        userId={userId}
                        title={g.title}
                        hasPhoto={Boolean(g.photoUrl)}
                      />
                    ) : null}

                    <RowButton
                      label={g.checkedIn ? "Undo" : "Check in"}
                      done={g.checkedIn}
                      confirm={
                        g.checkedIn && g.photoUrl
                          ? "Undoing also deletes your photo for this goal. Continue?"
                          : undefined
                      }
                    />
                  </span>
                </div>

                {g.photoUrl ? (
                  <CheckinPhoto url={g.photoUrl} alt={`Your check-in photo for ${g.title}`} />
                ) : null}

                {noteFor === g.id && !g.checkedIn ? (
                  <div className="flex flex-col gap-1">
                    <textarea
                      name="note"
                      rows={2}
                      maxLength={NOTE_MAX}
                      aria-label={`Note for ${g.title}`}
                      placeholder="How did it go?"
                      className="ds-field"
                    />
                    <label className="ds-text-muted flex items-center gap-2.5">
                      {/*
                        Unticked sends no field at all, and `checkIn` reads that
                        as private. Both defaults point the same way on purpose.

                        "your Circles", not "this Circle": sharing is per note,
                        so it reaches every Circle where this goal is visible.
                        The dashboard has no single Circle to name anyway.
                      */}
                      {/*
                        `ds-check` is `accent-color` and `color-scheme: dark`
                        and almost nothing else. Hiding the input to draw a div
                        would buy a shape and cost the whole native contract —
                        keyboard behaviour, form participation, the OS focus
                        ring, the announcement, the tick animation people
                        already know.
                      */}
                      <input type="checkbox" name="noteShared" className="ds-check" />
                      Share this note with your Circles
                    </label>
                  </div>
                ) : null}
              </form>
            </li>
          ))}
        </ul>
      )}

      {error ? <FormError>{error}</FormError> : null}

      {/* daily_completion is written by a trigger the moment the last goal is
          checked off, so this reflects the stored value rather than the count
          above. If the two ever disagree, the trigger is the one to trust. */}
      {goals.length && completedToday ? (
        <p className="ds-type-note ds-text-muted mt-3">
          Day complete. The stored counter catches up at the next rollover; a
          day is not final until it is over, since adding a goal or undoing a
          check-in can still reopen it.
        </p>
      ) : null}
    </Panel>
  )
}

"use client"

import { useActionState, useState } from "react"
import { useFormStatus } from "react-dom"
import { resolveStreakDecision } from "@/app/actions/streak-decision"
import { PrimaryButton, SecondaryButton } from "@/components/ui/button"
import { FormError } from "@/components/ui/field"
import { Panel } from "@/components/ui/panel"
import type { ActionResult } from "@/lib/errors"

/**
 * **`name` and `value` are the whole mechanism, so they survive the restyle.**
 * Which button was pressed *is* the answer — one form, two submits, and the
 * server reads `choice` from the FormData. A button that lost its `value` would
 * submit a decision with no content, which is why this is not two forms.
 *
 * `danger` colours the destructive answer without making it the primary: the
 * flame button is reserved for keeping the streak, because that is the
 * reversible choice and the one the copy recommends.
 */
function Submit({
  label,
  choice,
  danger,
}: {
  label: string
  choice: "keep" | "reset"
  danger?: boolean
}) {
  const { pending } = useFormStatus()

  /*
    **`align="center"` is not decoration — without it the button fights its
    own row.** `placement()` falls back to `self-start`, so a bare
    `PrimaryButton` sets `align-self: flex-start` and overrides whatever
    `items-*` the parent asked for. That is the exact Phase-1 bug the `align`
    prop was added to fix, and the fix only works if callers in a row use it.

    The default stays `self-start` because it is right in a *column*, where the
    alternative is a button stretched to the full width of the card. So the
    rule is: **a button in a flex row states its alignment; a button in a column
    does not need to.**
  */
  if (danger) {
    return (
      <SecondaryButton
        type="submit"
        name="choice"
        value={choice}
        disabled={pending}
        align="center"
        className="ds-border-danger ds-text-danger"
      >
        {pending ? "Saving…" : label}
      </SecondaryButton>
    )
  }

  return (
    <PrimaryButton
      type="submit"
      name="choice"
      value={choice}
      disabled={pending}
      align="center"
    >
      {pending ? "Saving…" : label}
    </PrimaryButton>
  )
}

function list(names: string[]) {
  if (names.length === 1) return names[0]
  if (names.length === 2) return `${names[0]} and ${names[1]}`
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`
}

/**
 * Owner-only banner. Shown until the decision is made, and there is no timer
 * behind it: grace persisting is harmless, whereas something that silently
 * resets a streak on a schedule is a nasty surprise nobody agreed to.
 *
 * Deliberately states the consequence of each option rather than asking "keep
 * or reset?". The words "keep" and "reset" alone do not say *whose* streak, and
 * the answer is everyone's.
 */
export function StreakDecision({
  groupId,
  joiners,
  streak,
}: {
  groupId: string
  /** Display names of everyone currently in grace. */
  joiners: string[]
  /** The group streak at risk. */
  streak: number
}) {
  const [state, action] = useActionState<ActionResult | null, FormData>(
    resolveStreakDecision,
    null,
  )

  // Two-step on reset only. Keeping the streak is the reversible answer: the
  // newcomer simply starts counting today. Resetting destroys a number for
  // every member and cannot be undone, so it gets the same treatment as
  // archiving.
  const [confirmReset, setConfirmReset] = useState(false)

  // Singular "they" reads the same as the plural here, so the copy needs no
  // pluralisation branch and cannot gender anyone by accident.
  const who = joiners.length ? list(joiners) : "Someone"

  return (
    /*
      **`accent` — the one flame mark on the Circle page.** This banner only
      exists when something is genuinely waiting on the owner, and it is the
      only thing on the screen that is. Spending the accent here is exactly what
      "one per screen" is for; the roster below stays quiet under it.
    */
    <Panel title="A decision is waiting on you" accent>
      <p className="ds-text-primary mb-3">
        {who} joined while this Circle was on a {streak} day streak. They
        aren&apos;t being counted yet, so the streak is neither growing nor at
        risk.
      </p>

      <form action={action} className="flex flex-col gap-3">
        <input type="hidden" name="groupId" value={groupId} />

        {confirmReset ? (
          /*
            `ds-border-danger` wins over `ds-panel`'s own border because the
            panel's is `:where()`d — the fix that exists precisely so a
            companion colour token can override it. Before that, this box would
            have drawn an ordinary hairline and the confirm would have looked
            like the step before it.
          */
          <div className="ds-panel ds-border-danger flex flex-col gap-3 px-3 py-2">
            <p className="ds-text-primary">
              Reset to 0 days for <strong>everyone</strong>, including members
              who earned it? This can&apos;t be undone.
            </p>
            {/*
              `items-center` on every button row in this file. Without it the
              flex default is `stretch`, so a wrapped row makes the shorter
              control grow to the taller one's height and the labels stop
              sharing a baseline — the "spacing bug that is really a layout bug"
              this codebase has now met three times.
            */}
            <div className="flex flex-wrap items-center gap-2">
              <Submit label="Reset for everyone" choice="reset" danger />
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="ds-link"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <Submit label={`Keep the ${streak} day streak`} choice="keep" />
            <SecondaryButton onClick={() => setConfirmReset(true)} align="center">
              Start everyone over at 0
            </SecondaryButton>
          </div>
        )}

        <p className="ds-type-note ds-text-muted">
          Either way they start counting from today. The only question is
          whether the {streak} days already earned survive.
        </p>

        {state && !state.ok ? <FormError>{state.error}</FormError> : null}
      </form>
    </Panel>
  )
}

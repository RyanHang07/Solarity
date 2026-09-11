"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { resolveReport } from "@/app/actions/admin"
import { SecondaryButton } from "@/components/ui/button"
import { FormError } from "@/components/ui/field"
import type { ActionResult } from "@/lib/errors"

/**
 * **All three outcomes are secondary, and none is primary.** Triage has no
 * recommended answer — that is the whole point of offering three — so promoting
 * one with a flame button would be the screen taking a position it is not
 * entitled to.
 */
function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus()
  return (
    <SecondaryButton type="submit" disabled={pending} align="center">
      {pending ? "Saving…" : label}
    </SecondaryButton>
  )
}

/**
 * Step 17. Triage.
 *
 * **Three outcomes and no fourth.** Actioned means a human did something about
 * it outside this screen; the dashboard deliberately cannot remove content or
 * suspend an account, so it must not imply that pressing a button did.
 *
 * **Reopen exists** because a decision made in thirty seconds is one somebody
 * will want back. It clears `reviewed_at` and `reviewed_by`, which the table's
 * own CHECK requires of anything `pending`.
 */
export function ResolveForm({
  reportId,
  current,
}: {
  reportId: string
  current: string
}) {
  const [state, action] = useActionState<ActionResult | null, FormData>(
    resolveReport,
    null,
  )

  const choices =
    current === "pending"
      ? [
          { value: "reviewed", label: "Mark reviewed" },
          { value: "actioned", label: "Mark actioned" },
          { value: "dismissed", label: "Dismiss" },
        ]
      : [{ value: "pending", label: "Reopen" }]

  return (
    <section
      aria-label="Outcome"
      className="ds-border-oatmeal flex flex-col gap-2 border-t pt-4"
    >
      <div className="flex flex-wrap items-center gap-2">
        {choices.map((c) => (
          <form key={c.value} action={action}>
            <input type="hidden" name="reportId" value={reportId} />
            <input type="hidden" name="status" value={c.value} />
            <Submit label={c.label} />
          </form>
        ))}
      </div>

      <p className="ds-type-note ds-text-muted">
        {/*
          Says what the buttons do not do. Somebody marking a report "actioned"
          on a screen with no removal control could reasonably assume the
          content is gone.
        */}
        Marking a report does not remove anything or change the account. It
        records what you decided.
      </p>

      {state && !state.ok ? <FormError>{state.error}</FormError> : null}
    </section>
  )
}

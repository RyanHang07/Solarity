"use client"

import { useActionState, useState } from "react"
import { useFormStatus } from "react-dom"
import { archiveCircle } from "@/app/actions/circles"
import { SecondaryButton } from "@/components/ui/button"
import { FormError } from "@/components/ui/field"
import type { ActionResult } from "@/lib/errors"

function Submit() {
  const { pending } = useFormStatus()
  return (
    <SecondaryButton
      type="submit"
      disabled={pending}
      align="center"
      className="ds-border-danger ds-text-danger"
    >
      {pending ? "Archiving…" : "Archive this Circle"}
    </SecondaryButton>
  )
}

/**
 * Owner only, and the one control in the app with no undo, so it sits behind a
 * confirmation that names the Circle rather than saying "are you sure".
 *
 * Not typing the name to confirm: that ceremony suits deleting an account, and
 * this destroys no history. Members keep the Circle and its record, it just
 * stops running.
 */
export function ArchivePanel({
  groupId,
  circleName,
}: {
  groupId: string
  circleName: string
}) {
  const [state, action] = useActionState<ActionResult | null, FormData>(
    archiveCircle,
    null,
  )
  const [confirming, setConfirming] = useState(false)

  return (
    <section className="ds-border-oatmeal flex flex-col gap-3 border-t pt-6">
      <div className="flex flex-col gap-1">
        {/*
          `ds-text-danger` on the heading, the same as "Delete your account".
          Both were oatmeal until `ds-link` was `:where()`d — the cascade bug
          that made two destructive controls look ordinary while every check
          passed.
        */}
        <h2 className="ds-type-heading ds-text-danger">Archive</h2>
        <p className="ds-text-muted">
          Ends the Circle for everyone. It stops counting streaks, stops taking
          members, and moves to the Archived list, where everyone can still read
          its history. This can&apos;t be undone.
        </p>
      </div>

      {confirming ? (
        <div className="ds-panel ds-border-danger flex flex-col gap-2 px-3 py-2">
          <p className="ds-text-primary">
            Archive <strong>{circleName}</strong>? The current streak stops here
            and nobody can restart it.
          </p>
          {/* `items-center`: a button beside a text link, which the flex
              default would stretch to the button's height. */}
          <div className="flex flex-wrap items-center gap-2">
            <form action={action}>
              <input type="hidden" name="groupId" value={groupId} />
              <Submit />
            </form>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="ds-link"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <SecondaryButton
          onClick={() => setConfirming(true)}
          className="ds-border-danger ds-text-danger"
        >
          Archive this Circle
        </SecondaryButton>
      )}

      {/* On success the action redirects, so this only ever shows a failure. */}
      {state && !state.ok ? <FormError>{state.error}</FormError> : null}
    </section>
  )
}

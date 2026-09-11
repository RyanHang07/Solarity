"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { joinCircle } from "@/app/actions/join"
import { PrimaryButton } from "@/components/ui/button"
import { FormError } from "@/components/ui/field"
import type { ActionResult } from "@/lib/errors"

/**
 * **The one primary button on the page, and the only screen where that is
 * unambiguous.** Somebody arriving on an invite link came here to do exactly
 * one thing.
 *
 * The label carries the Circle's name — `Join Morning crew`, not `Join`. Four
 * specs locate it that way, and it is also the honest label: a bare "Join"
 * beside a preview of a Circle you have never heard of asks you to commit to a
 * noun you have to scroll up to find.
 */
function Submit({ circleName }: { circleName: string }) {
  const { pending } = useFormStatus()
  return (
    <PrimaryButton type="submit" disabled={pending} full>
      {pending ? "Joining…" : `Join ${circleName}`}
    </PrimaryButton>
  )
}

/**
 * There is no confirmation step. Joining is reversible by leaving, unlike
 * archiving or regenerating a link, and the preview above already states what
 * the Circle is and how many people are in it.
 *
 * Success never returns: the action redirects to the Circle. So any state here
 * is a failure, and only for the three refusals that leave you on this page. A
 * dead link redirects from inside the action instead.
 */
export function JoinButton({
  token,
  circleName,
}: {
  token: string
  circleName: string
}) {
  const [state, action] = useActionState<ActionResult | null, FormData>(
    joinCircle,
    null,
  )

  return (
    <form action={action} className="flex flex-col gap-2">
      <input type="hidden" name="token" value={token} />
      <Submit circleName={circleName} />

      {state && !state.ok ? <FormError>{state.error}</FormError> : null}
    </form>
  )
}

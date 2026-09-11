"use client"

import { useActionState, useState } from "react"
import { useFormStatus } from "react-dom"
import { updatePassword } from "@/app/actions/auth"
import { PasswordFields } from "@/components/password-fields"
import { PrimaryButton } from "@/components/ui/button"
import { FormError } from "@/components/ui/field"
import type { ActionResult } from "@/lib/errors"

function Submit({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus()
  return (
    <PrimaryButton type="submit" disabled={pending || disabled} full>
      {pending ? "Saving…" : "Set new password"}
    </PrimaryButton>
  )
}

/**
 * Step 20f. Choose a new password.
 *
 * **The same `PasswordFields` as signup**, which is why that component was
 * pulled out of the signup form rather than left in it: identical rules,
 * identical confirmation, identical reveal. A second copy here would be a
 * second place for the hint and the check to disagree.
 *
 * **`label="New password"`** is the only difference, and it earns its keep:
 * "Password" on this screen reads like a field asking for the current one,
 * which is the thing somebody resetting it does not have.
 */
export function ResetForm() {
  const [state, action] = useActionState<ActionResult | null, FormData>(
    updatePassword,
    null,
  )
  const [valid, setValid] = useState(false)

  return (
    <form action={action} className="flex w-full flex-col gap-3">
      <PasswordFields label="New password" onValidityChange={setValid} />

      <Submit disabled={!valid} />

      {state && !state.ok ? <FormError>{state.error}</FormError> : null}
    </form>
  )
}

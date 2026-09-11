"use client"

import { useActionState, useState } from "react"
import { useFormStatus } from "react-dom"
import { signInWithPassword } from "@/app/actions/auth"
import { Turnstile } from "@/components/turnstile"
import { PrimaryButton } from "@/components/ui/button"
import { Field, FormError } from "@/components/ui/field"
import type { ActionResult } from "@/lib/errors"

/**
 * **`full`, not the default `self-start`.** A sign-in button that is only as
 * wide as its label sits in a column of full-width fields looking like it was
 * left behind — and this is the one control on the screen everybody is aiming
 * for. The label still changes under `useFormStatus`, which is the whole reason
 * this is a separate component: `pending` is only readable *inside* the form.
 */
function Submit() {
  const { pending } = useFormStatus()
  return (
    <PrimaryButton type="submit" disabled={pending} full>
      {pending ? "Signing in…" : "Sign in"}
    </PrimaryButton>
  )
}

/**
 * Step 20e. Signing in with a password.
 *
 * **No client-side validation at all, unlike the signup form.** There is
 * nothing useful to say: the rules apply to passwords being *created*, and
 * telling somebody their existing password is too short would be both wrong and
 * alarming. The only thing this form can know is whether the fields are empty,
 * which `required` already handles.
 *
 * **One error message for every failure**, produced by the action rather than
 * here. "No account with that address" and "wrong password" are two facts, and
 * distinguishing them turns this into the address checker that enumeration
 * protection exists to prevent.
 */
export function PasswordForm({ next }: { next: string }) {
  /**
   * Step 20h. **A Turnstile token is single-use**, and Supabase spends it on
   * every attempt — including a failed one. Without a reset, a second submit
   * after a wrong password or a weak one is refused for the *captcha* rather
   * than for the thing that was actually wrong, which is the most confusing
   * outcome available.
   *
   * Counted rather than a boolean, so two consecutive failures each produce a
   * fresh challenge.
   */
  const [attempts, setAttempts] = useState(0)

  const [state, action] = useActionState<ActionResult | null, FormData>(
    async (prev, formData) => {
      const result = await signInWithPassword(prev, formData)
      if (!result.ok) setAttempts((n) => n + 1)
      return result
    },
    null,
  )

  return (
    <form action={action} className="flex w-full flex-col gap-3">
      <input type="hidden" name="next" value={next} />

      <Field label="Email" type="email" name="email" required autoComplete="email" />

      <Field
        label="Password"
        type="password"
        name="password"
        required
        autoComplete="current-password"
      />

      <Turnstile resetKey={attempts} />

      <Submit />

      {state && !state.ok ? <FormError>{state.error}</FormError> : null}
    </form>
  )
}

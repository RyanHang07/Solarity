"use client"

import { useActionState, useSyncExternalStore } from "react"
import { useFormStatus } from "react-dom"
import { completeOnboarding } from "@/app/actions/onboarding"
import { PrimaryButton } from "@/components/ui/button"
import { Field, FormError } from "@/components/ui/field"
import type { ActionResult } from "@/lib/errors"

function Submit() {
  const { pending } = useFormStatus()
  return (
    <PrimaryButton type="submit" disabled={pending} full>
      {pending ? "Saving…" : "Continue"}
    </PrimaryButton>
  )
}

/** Never changes, so there is nothing to subscribe to. */
const noSubscribe = () => () => {}
const readTimezone = () =>
  Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"
const serverTimezone = () => ""

export function OnboardingForm() {
  const [state, action] = useActionState<ActionResult | null, FormData>(
    completeOnboarding,
    null,
  )

  /**
   * Only the browser knows the timezone, and the daily rollover keys off it
   * (architecture/time-and-streaks.md section 5), so it is read rather than inferred from an IP.
   *
   * `useSyncExternalStore` with a distinct server snapshot reads a client-only
   * value without a hydration mismatch. `useEffect` + `setState` gives the same
   * result, an extra render, and a lint error.
   *
   * The RPC validates it against `pg_timezone_names` regardless.
   */
  const timezone = useSyncExternalStore(noSubscribe, readTimezone, serverTimezone)

  return (
    /*
      **The width came off.** This was `max-w-xs` while the terms screen was
      `max-w-sm`, which is the disagreement `OnboardingShell` exists to end —
      the shell owns the measure now and the form fills it.
    */
    <form action={action} className="flex w-full flex-col gap-3">
      {/*
        The rules travel as `hint`, so they are described rather than named.
        They were already a sibling `<p>` here rather than inside the label,
        which is the shape `Field` enforces — this screen had it right first.
      */}
      <Field
        label="Pick a username"
        id="username"
        name="username"
        required
        minLength={3}
        maxLength={30}
        pattern="[A-Za-z0-9_]+"
        autoComplete="off"
        autoCapitalize="none"
        spellCheck={false}
        hint="3–30 characters. Letters, numbers and underscores. This is what your Circles see."
      />

      <input type="hidden" name="timezone" value={timezone} />
      {/*
        Not a second `hint` on the field above. It is a fact about the account
        rather than a rule about the input, and folding it into the field's
        description would have a screen reader read the timezone every time the
        username is focused.
      */}
      {timezone ? (
        <p className="ds-type-note ds-text-muted">
          Your day resets at midnight in {timezone}.
        </p>
      ) : null}

      {state && !state.ok ? <FormError>{state.error}</FormError> : null}

      <Submit />
    </form>
  )
}

"use client"

import { useActionState, useEffect, useRef } from "react"
import { useFormStatus } from "react-dom"
import { createCircle } from "@/app/actions/circles"
import { PrimaryButton } from "@/components/ui/button"
import { FormError } from "@/components/ui/field"
import type { ActionResult } from "@/lib/errors"

/**
 * **`inline`, and this is the case the prop was written for.** It matches
 * `--ds-control-height` so the button's bottom lands on the input's bottom
 * rather than four pixels below it — a row that is *slightly* wrong, which
 * reads as sloppiness rather than as a measurement.
 *
 * `inline` also implies `self-end`, which is why the row below says
 * `items-end`: the two agree instead of one silently overriding the other.
 */
function Submit() {
  const { pending } = useFormStatus()
  return (
    <PrimaryButton type="submit" disabled={pending} inline>
      {pending ? "Creating…" : "Create Circle"}
    </PrimaryButton>
  )
}

export function CreateCircleForm() {
  const [state, action] = useActionState<
    ActionResult<{ groupId: string }> | null,
    FormData
  >(createCircle, null)

  // Clear the field after a successful create. The server action revalidates
  // the page so the list updates on its own, but an uncontrolled input keeps
  // whatever was typed, which reads as if nothing happened.
  const formRef = useRef<HTMLFormElement>(null)
  useEffect(() => {
    if (state?.ok) formRef.current?.reset()
  }, [state])

  return (
    <form ref={formRef} action={action} className="flex flex-col gap-2">
      {/*
        The label is above the row rather than inside it, and it names the input
        alone — `htmlFor`, holding nothing but its own text. A `<label>` wrapped
        around this whole row would fold "Create Circle" into the field's
        accessible name.
      */}
      <label htmlFor="circle-name" className="ds-type-label ds-text-muted">
        Start a Circle
      </label>
      <div className="flex items-end gap-2">
        <input
          id="circle-name"
          name="name"
          required
          maxLength={50}
          autoComplete="off"
          placeholder="Morning crew"
          className="ds-field flex-1"
        />
        <Submit />
      </div>
      <p className="ds-type-note ds-text-muted">
        Up to 50 characters. You can invite up to nine other people.
      </p>

      {state && !state.ok ? <FormError>{state.error}</FormError> : null}
    </form>
  )
}

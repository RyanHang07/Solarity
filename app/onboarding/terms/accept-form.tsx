"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { acceptTerms } from "@/app/actions/onboarding"
import { PrimaryButton } from "@/components/ui/button"
import { FormError } from "@/components/ui/field"
import type { ActionResult } from "@/lib/errors"

function Submit() {
  const { pending } = useFormStatus()
  return (
    <PrimaryButton type="submit" disabled={pending} full>
      {pending ? "Saving…" : "I agree"}
    </PrimaryButton>
  )
}

/**
 * Step 20c. The one control on the interstitial.
 *
 * **A submit, not a checkbox and a Continue.** There is exactly one decision
 * here and one way to express it; a checkbox adds a state that can be wrong and
 * a second control to explain it.
 *
 * **The destination travels as a hidden field and the action redirects.** The
 * first version routed on the client with `useRouter` after awaiting the
 * action, which worked and was worse in two ways: it needed JavaScript to
 * complete a form that otherwise would not, and it left both of
 * `useActionState`'s arguments unread — which ESLint reports, because
 * `no-unused-vars` only forgives an unused argument when a later one *is* used.
 * Reading `formData` fixed the design and the warning at once.
 *
 * Nothing renders on success: `redirect` throws inside the action, so the only
 * state this component ever shows is a failure.
 */
export function AcceptForm({ next }: { next: string }) {
  const [state, action] = useActionState<ActionResult | null, FormData>(
    acceptTerms,
    null,
  )

  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="next" value={next} />
      <Submit />
      {state && !state.ok ? <FormError>{state.error}</FormError> : null}
    </form>
  )
}

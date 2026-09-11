"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { unblockUser } from "@/app/actions/moderation"
import { FormError } from "@/components/ui/field"
import type { ActionResult } from "@/lib/errors"

/**
 * **A link, not a danger button.** Unblocking is the *reversal* of the
 * destructive act, so dressing it in red would colour undoing a mistake the
 * same as making one. It also sits at the end of a row rather than under a
 * heading, where a full control would outweigh the name it belongs to.
 */
function Unblock() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending} className="ds-link ds-type-note">
      {pending ? "…" : "Unblock"}
    </button>
  )
}

/**
 * Step 15d. The accounts you have blocked.
 *
 * **This list exists because blocking hides the thing it is undone from.**
 * Mutual invisibility means a blocked person's profile returns a 404 to you, so
 * the Unblock control cannot live where the Block control did. Migration 87 is
 * a `SECURITY DEFINER` function for the same reason: `users_select_self_or_groupmate`
 * would not return their username once you no longer share a Circle, and a list
 * of uuids is not a list anyone can act on.
 *
 * **No confirmation on Unblock.** It is the reversible direction — the Block
 * button is one click away again — and a confirmation on every safe action is
 * how people learn to click through the unsafe ones.
 */
export function BlockedList({
  blocked,
}: {
  blocked: { user_id: string; username: string | null; display_name: string | null }[]
}) {
  const [state, action] = useActionState<ActionResult | null, FormData>(
    unblockUser,
    null,
  )

  return (
    <section aria-label="Blocked accounts" className="flex flex-col gap-2">
      <h2 className="ds-type-heading ds-text-primary">Blocked</h2>

      {blocked.length === 0 ? (
        // Rendered rather than hidden. An empty section says the feature exists
        // and that you have not used it; a missing one says nothing at all, and
        // someone looking for where to undo a block would not find this page.
        <p className="ds-text-muted">
          You haven&apos;t blocked anyone. Blocking is on someone&apos;s profile.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {blocked.map((b) => (
            <li
              key={b.user_id}
              className="ds-panel flex items-center justify-between gap-3 px-3 py-2"
            >
              {/* Username leads, as everywhere one person is named to another:
                  `display_name` is not unique. */}
              <span className="ds-text-primary">
                {b.username ?? "an account"}
                {b.display_name ? (
                  <span className="ds-text-muted"> · {b.display_name}</span>
                ) : null}
              </span>
              <form action={action}>
                <input type="hidden" name="userId" value={b.user_id} />
                <Unblock />
              </form>
            </li>
          ))}
        </ul>
      )}

      <p className="ds-type-note ds-text-muted">
        Blocking hides each of you from the other&apos;s profile. You still share
        any Circles you were both in, and nobody is told either way.
      </p>

      {state && !state.ok ? <FormError>{state.error}</FormError> : null}
    </section>
  )
}

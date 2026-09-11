"use client"

import { useActionState, useState } from "react"
import { useFormStatus } from "react-dom"
import { setRole } from "@/app/actions/admin"
import { SecondaryButton } from "@/components/ui/button"
import { FormError } from "@/components/ui/field"
import type { ActionResult } from "@/lib/errors"

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus()
  return (
    <SecondaryButton type="submit" disabled={pending} align="center">
      {pending ? "Saving…" : label}
    </SecondaryButton>
  )
}

/**
 * Step 17. Grant or revoke admin, by username.
 *
 * **By username, not by id**, because an id is not something anybody has to
 * hand. It resolves through `profile_by_username` — the same lookup the profile
 * page uses — so a person who has blocked you resolves to nothing here. That is
 * a real edge, accepted: the alternative is a second lookup that ignores
 * blocking, and a promotion path is the wrong place to introduce one.
 *
 * **Granting is confirmed; revoking is not.** Granting hands somebody the
 * ability to read other people's reported content, and it is the direction that
 * cannot be quietly undone once they have looked. Revoking takes that away, and
 * a confirmation on the safe direction is how people learn to click through the
 * unsafe one.
 */
export function RoleForm() {
  const [state, action] = useActionState<ActionResult | null, FormData>(
    setRole,
    null,
  )
  const [username, setUsername] = useState("")
  const [confirming, setConfirming] = useState(false)

  return (
    <section
      aria-label="Change a role"
      className="ds-border-oatmeal flex flex-col gap-3 border-t pt-5"
    >
      <h2 className="ds-type-heading ds-text-primary">Change a role</h2>

      <label htmlFor="role-username" className="ds-type-label ds-text-muted">
        Username
      </label>
      <input
        id="role-username"
        value={username}
        onChange={(e) => {
          setUsername(e.target.value)
          // Any edit cancels a pending confirmation, so the name on screen is
          // always the name the button would act on.
          setConfirming(false)
        }}
        autoComplete="off"
        className="ds-field max-w-64"
      />

      {confirming ? (
        /*
          Danger-bordered, because granting admin hands somebody the content of
          every report — private notes and photos included. It is the one action
          in this file that widens who can read what.
        */
        <div className="ds-panel ds-border-danger flex flex-col gap-2 px-3 py-2">
          <p className="ds-text-primary">
            Make <strong>{username}</strong> an administrator? They will be able
            to read the content of every report, including private notes and
            photos.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <form action={action}>
              <input type="hidden" name="username" value={username} />
              <input type="hidden" name="role" value="admin" />
              <Submit label="Grant admin" />
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
        <div className="flex flex-wrap items-center gap-2">
          <SecondaryButton
            disabled={!username.trim()}
            onClick={() => setConfirming(true)}
            align="center"
          >
            Grant admin
          </SecondaryButton>

          <form action={action}>
            <input type="hidden" name="username" value={username} />
            <input type="hidden" name="role" value="standard" />
            <Submit label="Revoke admin" />
          </form>
        </div>
      )}

      {state?.ok ? (
        <p role="status" className="ds-text-primary">
          Saved.
        </p>
      ) : null}
      {state && !state.ok ? <FormError>{state.error}</FormError> : null}
    </section>
  )
}

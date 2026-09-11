"use client"

import { useActionState, useState } from "react"
import { useFormStatus } from "react-dom"
import Link from "next/link"
import { deleteAccount } from "@/app/actions/settings"
import { SecondaryButton } from "@/components/ui/button"
import { FormError } from "@/components/ui/field"
import type { ActionResult } from "@/lib/errors"

/**
 * **Disabled until the username matches**, which is the whole ceremony — so the
 * disabled styling matters more here than anywhere else in the app.
 * `.ds-cta:disabled` handles it: 0.45 opacity plus a grayscale knock-back, no
 * hand-written `opacity-50` fighting it at a different value.
 */
function Submit({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus()
  return (
    <SecondaryButton
      type="submit"
      disabled={pending || disabled}
      align="center"
      className="ds-border-danger ds-text-danger"
    >
      {pending ? "Deleting…" : "Delete my account"}
    </SecondaryButton>
  )
}

/**
 * Step 14e. The one control in the app that ends everything.
 *
 * **Typing the username, not a second click.** `ArchivePanel` deliberately does
 * not ask for this and says why: that ceremony suits deleting an account, and
 * archiving destroys no history. This does. The friction is the point — it
 * makes the action impossible to take by muscle memory, and the word being
 * typed is the thing being lost.
 *
 * **The comparison is repeated on the server**, where it is a control rather
 * than a courtesy. This is a POST endpoint like any other and a mis-wired
 * submit reaches it directly; the action reads the username from the database
 * instead of trusting a hidden field, or the form would be confirming itself.
 *
 * **Export is offered inside the confirmation, not beside it.** A "download
 * your data" link on the settings page is easy to miss; here it is in front of
 * someone who has just said they are leaving, which is the only moment it
 * matters.
 *
 * On success the action redirects to `/` with a notice, so there is no success
 * state here to render — by then the account it belonged to is gone.
 */
export function DeleteAccountPanel({
  username,
  /**
   * Active Circles where this account is the owner.
   *
   * **Named, not counted.** "You own 2 Circles" makes someone go and look;
   * naming them answers the question in place. Succession is automatic — the
   * longest-standing member is promoted by `handle_membership_removal` — but
   * "it will be handled" is not the same as knowing which Circles change hands.
   */
  ownedCircles,
}: {
  username: string
  ownedCircles: string[]
}) {
  const [state, action] = useActionState<ActionResult | null, FormData>(
    deleteAccount,
    null,
  )
  const [confirming, setConfirming] = useState(false)
  const [typed, setTyped] = useState("")

  const matches = typed.trim().toLowerCase() === username.toLowerCase()

  return (
    <section
      aria-labelledby="delete-account"
      className="ds-border-oatmeal flex flex-col gap-3 border-t pt-6"
    >
      <div className="flex flex-col gap-1">
        {/*
          **`ds-text-danger` on the heading, and it took a cascade fix to
          work.** `ds-link` used to beat it by declaration order at equal
          specificity, so "Delete your account" rendered oatmeal rather than red
          for weeks — styled correctly in the markup and wrong on the screen,
          with every automated check passing. Both link colours are `:where()`d
          now so any `ds-text-*` beside them wins by construction.
        */}
        <h2 id="delete-account" className="ds-type-heading ds-text-danger">
          Delete your account
        </h2>
        {/*
          **States what survives.** The check-ins are kept, anonymised, because
          other members' group stats were computed against them and removing
          them would retroactively change history those people shared. Promising
          a total erasure the product does not perform would be a lie told at
          the exact moment someone is deciding whether to trust it.
        */}
        <p className="ds-text-muted">
          Removes your goals, notes, photos and Circle memberships. Your past
          check-ins stay, with your name removed, so the shared history in your
          Circles still adds up. This can&apos;t be undone.
        </p>
      </div>

      {confirming ? (
        <div className="ds-panel ds-border-danger flex flex-col gap-3 px-3 py-3">
          {ownedCircles.length ? (
            <p className="ds-text-primary">
              You own{" "}
              <strong>
                {ownedCircles.length === 1
                  ? ownedCircles[0]
                  : `${ownedCircles.length} Circles: ${ownedCircles.join(", ")}`}
              </strong>
              . {ownedCircles.length === 1 ? "It passes" : "They pass"} to the
              longest-standing member. A Circle with nobody left is archived.
            </p>
          ) : null}

          <p className="ds-text-primary">
            Want a copy first?{" "}
            <Link href="/settings/export" className="ds-link">
              Download your data
            </Link>
            . You can&apos;t after this.
          </p>

          <form action={action} className="flex flex-col gap-2">
            {/*
              The label wraps only its own words — the `<strong>` is part of the
              instruction, not a second element — so the accessible name is
              exactly "Type ryahn1 to confirm", which is what somebody navigating
              by field hears.
            */}
            <label
              htmlFor="confirm-username"
              className="ds-type-label ds-text-muted"
            >
              Type <strong className="ds-text-primary">{username}</strong> to
              confirm
            </label>
            {/*
              `autoComplete="off"`, and a name that is not `username`. A field
              called `username` invites the browser's password manager to fill
              it, which would defeat the entire point of asking someone to type
              it themselves.
            */}
            <input
              id="confirm-username"
              name="confirm"
              autoComplete="off"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              className="ds-field max-w-64"
            />
            <div className="flex flex-wrap items-center gap-2">
              <Submit disabled={!matches} />
              <button
                type="button"
                onClick={() => {
                  setConfirming(false)
                  setTyped("")
                }}
                className="ds-link"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        /*
          **Danger-outlined, not flame.** The primary is reserved for the thing
          a screen wants you to do, and settings does not want you to do this.
          It is also the only control on the page that cannot be undone, so it
          should look unlike every Save above it.
        */
        <SecondaryButton
          onClick={() => setConfirming(true)}
          className="ds-border-danger ds-text-danger"
        >
          Delete your account
        </SecondaryButton>
      )}

      {/* Success redirects, so this can only ever be a failure. */}
      {state && !state.ok ? <FormError>{state.error}</FormError> : null}
    </section>
  )
}

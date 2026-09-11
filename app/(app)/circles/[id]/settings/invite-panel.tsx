"use client"

import { SecondaryButton } from "@/components/ui/button"
import { FormError } from "@/components/ui/field"
import { useActionState, useState, useSyncExternalStore } from "react"
import { useFormStatus } from "react-dom"
import { generateInviteLink, revokeInviteLink } from "@/app/actions/invites"
import type { ActionResult } from "@/lib/errors"

function Submit({
  label,
  pendingLabel,
  danger,
}: {
  label: string
  pendingLabel: string
  danger?: boolean
}) {
  const { pending } = useFormStatus()
  return (
    /*
      Secondary either way. Generating a link and revoking one are both
      administrative rather than the thing the screen wants you to do, and a
      flame button on a settings page competes with Save.
    */
    <SecondaryButton
      type="submit"
      disabled={pending}
      align="center"
      className={danger ? "ds-border-danger ds-text-danger" : ""}
    >
      {pending ? pendingLabel : label}
    </SecondaryButton>
  )
}

/** The origin is a browser-only value, and never changes. */
const noSubscribe = () => () => {}
const readOrigin = () => window.location.origin
const serverOrigin = () => ""

function formatExpiry(expiresAt: string | null) {
  if (!expiresAt) return "This link doesn't expire."
  const when = new Date(expiresAt)
  const days = Math.ceil((when.getTime() - Date.now()) / 86_400_000)
  if (days <= 0) return `Expired ${when.toLocaleDateString()}.`
  return `Expires in ${days} day${days === 1 ? "" : "s"}, on ${when.toLocaleDateString()}.`
}

export function InvitePanel({
  groupId,
  token,
  expiresAt,
  expired,
}: {
  groupId: string
  token: string | null
  expiresAt: string | null
  expired: boolean
}) {
  const [genState, genAction] = useActionState<
    ActionResult<{ token: string }> | null,
    FormData
  >(generateInviteLink, null)
  const [revokeState, revokeAction] = useActionState<ActionResult | null, FormData>(
    revokeInviteLink,
    null,
  )

  // Two-step, because `create_invite_link` disables every existing link before
  // inserting. A bare "Generate new link" would silently kill whatever people
  // are already holding, which is a footgun rather than a feature.
  const [confirmRegen, setConfirmRegen] = useState(false)
  const [copied, setCopied] = useState(false)

  // Closed when a result arrives, and deliberately not in the submit handler:
  // clearing it there unmounts the form that is mid-submission, which can abort
  // the action. Adjusted during render rather than in an effect, which is the
  // documented way to reset state in response to a changed value and avoids the
  // cascading render an effect would cause.
  const [seenResult, setSeenResult] = useState(genState)
  if (genState !== seenResult) {
    setSeenResult(genState)
    setConfirmRegen(false)
  }

  // Server renders the path; the browser swaps in the full URL on hydration.
  // `useSyncExternalStore` with a distinct server snapshot is how a client-only
  // value gets read without a hydration mismatch.
  const origin = useSyncExternalStore(noSubscribe, readOrigin, serverOrigin)

  // The server prop is the only source of truth, never the action's returned
  // token. Both actions call `revalidatePath`, so this page re-renders with the
  // new state in the same pass the result arrives. Preferring the returned
  // token instead looks like a shortcut and is a bug: generate, then revoke,
  // and the stale success result would go on displaying a link that is dead.
  const url = token ? `${origin}/join/${token}` : null

  const error =
    (genState && !genState.ok && genState.error) ||
    (revokeState && !revokeState.ok && revokeState.error) ||
    null

  async function copy() {
    if (!token) return
    await navigator.clipboard.writeText(`${window.location.origin}/join/${token}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h2 className="ds-type-heading ds-text-primary">Invite link</h2>
        <p className="ds-text-muted">
          Anyone with this link can join, so treat it like a password. One link
          is live at a time.
        </p>
      </div>

      {url ? (
        <div className="ds-panel flex flex-col gap-2 px-3 py-2">
          {/*
            `ds-font-mono` on the token itself. It is a string somebody reads
            character by character when something has gone wrong, and a
            proportional face makes that harder for no gain.
          */}
          <code className="ds-font-mono ds-text-primary overflow-x-auto text-[0.8125rem]">
            {url}
          </code>
          <div className="flex flex-wrap items-center gap-2">
            <SecondaryButton onClick={copy} align="center">
              {copied ? "Copied" : "Copy link"}
            </SecondaryButton>

            <form action={revokeAction}>
              <input type="hidden" name="groupId" value={groupId} />
              <Submit label="Revoke" pendingLabel="Revoking…" danger />
            </form>
          </div>
          {/*
            Colour is not the only signal — "Expired" is in the text — but an
            expired link is the one state on this panel worth catching from
            across the page.
          */}
          <p
            className={`ds-type-note ${
              expired ? "ds-text-danger" : "ds-text-muted"
            }`}
          >
            {formatExpiry(expiresAt)}
          </p>
        </div>
      ) : (
        <p className="ds-text-muted">
          No live link. Generate one to invite people.
        </p>
      )}

      {/* Revoking leaves no link, so the button below becomes a plain create
          again. The warning only applies when there is something to destroy. */}
      {token && !confirmRegen ? (
        <SecondaryButton onClick={() => setConfirmRegen(true)}>
          Generate a new link
        </SecondaryButton>
      ) : null}

      {token && confirmRegen ? (
        <div className="ds-panel ds-border-danger flex flex-col gap-2 px-3 py-2">
          <p className="ds-text-primary">
            This turns off the link above. Anyone still holding it, in a group
            chat or an old message, won&apos;t be able to join.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <form action={genAction}>
              <input type="hidden" name="groupId" value={groupId} />
              <Submit label="Replace it" pendingLabel="Generating…" danger />
            </form>
            <button
              type="button"
              onClick={() => setConfirmRegen(false)}
              className="ds-link"
            >
              Keep the current link
            </button>
          </div>
        </div>
      ) : null}

      {!token ? (
        <form action={genAction} className="self-start">
          <input type="hidden" name="groupId" value={groupId} />
          <Submit label="Generate link" pendingLabel="Generating…" />
        </form>
      ) : null}

      {error ? <FormError>{error}</FormError> : null}
    </section>
  )
}

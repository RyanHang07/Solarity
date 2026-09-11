"use client"

import { useActionState, useState } from "react"
import { useFormStatus } from "react-dom"
import { blockUser, reportContent } from "@/app/actions/moderation"
import { SecondaryButton } from "@/components/ui/button"
import { FormError } from "@/components/ui/field"
import type { ActionResult } from "@/lib/errors"

/**
 * **Danger-outlined rather than flame-filled, for both Block and Send report.**
 * Neither is the thing the screen wants you to do — a profile exists to be
 * read — so neither gets the primary. `ds-border-danger` wins over `ds-panel`'s
 * own border because the panel's is `:where()`d, which is the whole reason that
 * fix exists.
 *
 * The accessible name is untouched: `moderation.spec.ts` clicks
 * `{ name: "Block", exact: true }`, and `exact` is what keeps it from also
 * matching the "Block &lt;username&gt;" trigger that opens this confirm.
 */
function Submit({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus()
  return (
    <SecondaryButton
      type="submit"
      disabled={pending}
      align="center"
      className="ds-border-danger ds-text-danger"
    >
      {pending ? pendingLabel : label}
    </SecondaryButton>
  )
}

/**
 * Steps 15d and 15e. Block and Report, on somebody else's profile.
 *
 * **Never rendered on your own**, and the page decides that rather than this
 * component: `/profile/[username]` redirects to `/profile` when the subject is
 * you, so this only ever sees a stranger.
 *
 * **Report appears for Circle-mates only.** `content_reports_insert_own`
 * requires `private.shares_group_with(reported_user_id)`, so a report about
 * somebody you share nothing with is refused by the database. Hiding the
 * control is the courtesy; the policy is the control.
 *
 * **Block does not check that.** You can block anyone whose profile you can
 * open, which since step 15 is anyone signed in — and that is right: blocking
 * is how you stop seeing someone, and needing to share a Circle first would
 * make it useless for the case it is most needed in.
 */
export function ProfileActions({
  userId,
  username,
  sharesCircle,
}: {
  userId: string
  username: string
  /** Whether the report policy would accept a report about this person. */
  sharesCircle: boolean
}) {
  const [blockState, blockAction] = useActionState<ActionResult | null, FormData>(
    blockUser,
    null,
  )
  const [reportState, reportAction] = useActionState<ActionResult | null, FormData>(
    reportContent,
    null,
  )
  const [confirmingBlock, setConfirmingBlock] = useState(false)
  const [reporting, setReporting] = useState(false)

  return (
    <section
      aria-label="Moderation"
      className="ds-border-oatmeal flex flex-col gap-3 border-t pt-6"
    >
      {/* ------------------------------------------------------------ block */}
      {confirmingBlock ? (
        <div className="ds-panel ds-border-danger flex flex-col gap-2 px-3 py-2">
          <p className="ds-text-primary">
            Block <strong>{username}</strong>?
          </p>
          {/*
            **Says what blocking does not do.** Someone expecting to disappear
            from a shared Circle would find out otherwise by opening it, which
            is a worse way to learn than reading it here.
          */}
          <p className="ds-type-note ds-text-muted">
            Neither of you will see the other&apos;s profile. You&apos;ll still
            see each other in any Circle you share, and they won&apos;t be told.
            You can undo this in settings.
          </p>
          {/*
            `items-center`, because the confirm is a button beside a text link
            and the flex default would stretch the link to the button's height.
          */}
          <div className="flex items-center gap-2">
            <form action={blockAction}>
              <input type="hidden" name="userId" value={userId} />
              <Submit label="Block" pendingLabel="Blocking…" />
            </form>
            <button
              type="button"
              onClick={() => setConfirmingBlock(false)}
              className="ds-link"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        /*
          Both stay quiet links rather than buttons. A profile exists to be
          read; these are the two things you do when reading it has gone wrong,
          and drawing them as controls would make every profile look like a
          moderation queue.

          Plain `/* *​/`, not `{/* *​/}`: this is the `else` arm of a ternary,
          which is an expression position — the same slot as after `return (`.
          Braces there parse as a block. Second time this has bitten in the
          port, and the first sweep missed it because it only looked at
          `return (` and `=> (`.
        */
        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={() => setConfirmingBlock(true)}
            className="ds-link"
          >
            Block {username}
          </button>

          {sharesCircle && !reporting ? (
            <button
              type="button"
              onClick={() => setReporting(true)}
              className="ds-link"
            >
              Report this profile
            </button>
          ) : null}
        </div>
      )}

      {/* ----------------------------------------------------------- report */}
      {reporting && !confirmingBlock ? (
        <form action={reportAction} className="ds-panel flex flex-col gap-2 px-3 py-2">
          <input type="hidden" name="userId" value={userId} />
          <input type="hidden" name="contentType" value="user_profile" />
          {/*
            `content_reference` is `not null`, and a profile has no narrower
            handle than the account itself. Redundant with `userId` above and
            kept so a moderator can find any report from its reference alone,
            whatever its type.
          */}
          <input type="hidden" name="contentReference" value={userId} />

          <label htmlFor="report-reason" className="ds-type-label ds-text-muted">
            What&apos;s wrong with this profile?
          </label>
          <textarea
            id="report-reason"
            name="reason"
            rows={3}
            maxLength={500}
            className="ds-field"
          />
          <p className="ds-type-note ds-text-muted">
            Optional, up to 500 characters. Reports are read by a person, and{" "}
            {username} isn&apos;t told who reported them.
          </p>
          <div className="flex items-center gap-2">
            <Submit label="Send report" pendingLabel="Sending…" />
            <button
              type="button"
              onClick={() => setReporting(false)}
              className="ds-link"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      {reportState?.ok ? (
        // **Says it was received, not what will happen.** There is no
        // moderation console yet, so a promise about review would be one the
        // product cannot keep.
        <p role="status" className="ds-text-primary">
          Report sent. Thanks — someone will look at it.
        </p>
      ) : null}

      {[blockState, reportState].map((st, i) =>
        st && !st.ok ? <FormError key={i}>{st.error}</FormError> : null,
      )}
    </section>
  )
}

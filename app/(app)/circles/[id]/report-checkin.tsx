"use client"

import { useActionState, useState } from "react"
import { useFormStatus } from "react-dom"
import { reportContent, type ReportType } from "@/app/actions/moderation"
import { SecondaryButton } from "@/components/ui/button"
import { FormError } from "@/components/ui/field"
import { checkinReference } from "@/lib/report-reference"
import type { ActionResult } from "@/lib/errors"

/**
 * Step 15e. Reporting a photo or a note, where you are looking at it.
 *
 * **On the roster rather than on a profile, because that is what the enum has
 * always said.** `content_report_type` is about content, and a report a
 * moderator can act on names the thing complained about — not the person who
 * posted it.
 *
 * **Only rendered for Circle-mates**, which on this screen is everyone: you are
 * inside a Circle you belong to, so `shares_group_with` is satisfied by being
 * here at all. That is why this component has no equivalent of the profile
 * page's `sharesCircle` prop.
 *
 * **Collapsed until asked for.** A Circle of ten members with photos is twenty
 * report controls nobody wants to see, and a report button beside every piece
 * of a friend's day sets the wrong tone for a screen about encouragement.
 */
export function ReportCheckin({
  userId,
  goalId,
  checkinDate,
  contentType,
  label,
}: {
  userId: string
  goalId: string
  checkinDate: string
  contentType: Extract<ReportType, "checkin_photo" | "checkin_note">
  /** What is being reported, in the person's own words: "photo" or "note". */
  label: string
}) {
  const [state, action] = useActionState<ActionResult | null, FormData>(
    reportContent,
    null,
  )
  const [open, setOpen] = useState(false)

  if (state?.ok) {
    // No form to return to. Re-offering the control invites a second report
    // about the same thing, which costs the reporter one of ten a day and tells
    // a moderator nothing new.
    return (
      <span className="ds-type-note ds-text-muted">Reported. Thanks.</span>
    )
  }

  if (!open) {
    return (
      /*
        **Muted, not danger, and quieter than the note it sits beside.** This is
        the least likely control on the row to be wanted, and colouring it as an
        alarm would make every shared note look like a problem.
      */
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="ds-link ds-type-note ds-text-muted self-start"
      >
        Report this {label}
      </button>
    )
  }

  return (
    <form action={action} className="ds-panel flex flex-col gap-2 px-2 py-2">
      <input type="hidden" name="userId" value={userId} />
      <input type="hidden" name="contentType" value={contentType} />
      {/*
        Built from three things this viewer already holds. The roster returns
        `entry_id` for your own rows only, and a photo's signed URL expires in
        an hour, so neither is a reference a report can keep.
      */}
      <input
        type="hidden"
        name="contentReference"
        value={checkinReference(userId, goalId, checkinDate)}
      />

      {/*
        **The label still wraps the textarea here, and that is safe** — it
        contains nothing but the label text, so the accessible name is exactly
        "What's wrong with this note?". The rule the port keeps re-learning is
        that a `<label>` must hold *only* the label; wrapping is fine when it
        does. Not converted to `Field`, which renders an `<input>`.
      */}
      <label className="ds-type-note ds-text-muted">
        What&apos;s wrong with this {label}?
        <textarea
          name="reason"
          rows={2}
          maxLength={500}
          className="ds-field mt-1 w-full"
        />
      </label>

      <div className="flex items-center gap-2">
        <Submit />
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="ds-link ds-type-note"
        >
          Cancel
        </button>
      </div>

      {/*
        **`FormError`, because a `<p>` is legal here** — the parent is a
        `<form>`, not phrasing content, unlike `photo-button.tsx`.

        This was a hand-rolled `<span>` for one tranche, matching
        `photo-button.tsx` only so the two reported the same way while
        `e2e/ui.ts` could see neither. That reason expired when the audit of
        11 September widened the helper, and a special case kept alive to
        resemble another special case is worth deleting.
      */}
      {state && !state.ok ? <FormError>{state.error}</FormError> : null}
    </form>
  )
}

function Submit() {
  const { pending } = useFormStatus()
  return (
    /*
      **`align="center"`, and not `inline`.** `inline` resolves to `self-end`,
      which is right beside a labelled field — the button's bottom lines up with
      the input's. Here the neighbour is a "Cancel" link in a row that already
      says `items-center`, so `self-end` would drop this button below it and
      read as a spacing mistake. `inline` is for fields; this is a button row.
    */
    <SecondaryButton type="submit" disabled={pending} align="center">
      {pending ? "Sending…" : "Send report"}
    </SecondaryButton>
  )
}

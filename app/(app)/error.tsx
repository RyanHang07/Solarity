"use client"

import Link from "next/link"
import { useEffect } from "react"
import { CONTACT_EMAIL } from "@/lib/legal"
import { OrbitMark } from "@/components/marks/marks"
import { PrimaryButton } from "@/components/ui/button"

/**
 * The signed-in error boundary.
 *
 * **The app had none at all until the audit of 11 September**, which meant every
 * throw in a server component fell through to Next's built-in page: the root
 * 16px, no `ds-app`, no palette, no wordmark, and no link back. On a phone
 * installed to the home screen there is no browser chrome either, so that page
 * is a dead end with no gesture out of it.
 *
 * **Inside `(app)`, for the same reason `not-found.tsx` is.** A file here
 * renders *within* the group's layout, so the app bar and tab bar survive. The
 * screen that says "something broke" is exactly when the way out matters most.
 *
 * **`error.tsx` must be a client component** — React needs `reset` to be a
 * callable boundary handler, and Next enforces it. That is also why this cannot
 * simply reuse `not-found.tsx`'s markup: this one has a button that does
 * something.
 *
 * ## What it deliberately does not show
 *
 * **Not `error.message`.** A server-side throw here is a Supabase or PostgREST
 * failure, and those messages carry column names, constraint names and
 * occasionally a fragment of the query. That is a schema disclosure on a page
 * anyone can reach by breaking one request, and it is unreadable to the person
 * it is shown to. `digest` is the one safe identifier: Next replaces the message
 * with a hash in production and logs the real one server-side, so it is exactly
 * what a support email should quote.
 */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  /*
    Next logs the server-side cause already; this catches the client-side half,
    which otherwise leaves no trace once the boundary swallows it. Dev only by
    intent — in production this would be the one place a stack could reach a
    console an onlooker is reading over a shoulder.
  */
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") console.error(error)
  }, [error])

  return (
    <div className="ds-centre-short flex flex-col items-center gap-5 text-center">
      <span className="ds-text-flame opacity-60" aria-hidden>
        <OrbitMark size={64} />
      </span>

      <div className="flex flex-col gap-1.5">
        <h1 className="ds-type-title ds-text-primary">That did not load</h1>
        <p className="ds-type-note ds-text-muted max-w-[40ch]">
          Something went wrong at our end, not yours. Trying again is usually
          enough.
        </p>
      </div>

      {/*
        **`reset()` first, because it is usually the right answer.** It re-renders
        the segment without a full navigation, so a transient read failure — the
        common case here — clears without losing where the person was.

        `items-center` on the row: the controls have different heights, and the
        flex default would stretch the shorter one to match.
      */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <PrimaryButton onClick={reset} align="center">
          Try again
        </PrimaryButton>
        <Link
          href="/dashboard"
          className="ds-cta ds-panel ds-type-label ds-text-primary px-4 py-2.5"
          style={{ ["--ds-cta-min" as string]: "auto" }}
        >
          Back to Overview
        </Link>
      </div>

      {/*
        The digest, only when there is one. In development there is not, and an
        empty reference line reads as a bug in the error page itself.
      */}
      {error.digest ? (
        <p className="ds-type-note ds-text-muted">
          If it keeps happening,{" "}
          <a className="ds-link" href={`mailto:${CONTACT_EMAIL}`}>
            tell me
          </a>{" "}
          and quote <code className="ds-font-mono">{error.digest}</code>.
        </p>
      ) : null}
    </div>
  )
}

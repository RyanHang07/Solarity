"use client"

import Link from "next/link"
import { useEffect } from "react"
import { AuthShell } from "@/components/auth/auth-shell"
import { CONTACT_EMAIL } from "@/lib/legal"
import { OrbitMark } from "@/components/marks/marks"
import { PrimaryButton } from "@/components/ui/button"

/**
 * The signed-out error boundary: landing, auth, onboarding, join, legal.
 *
 * **`AuthShell` is what makes it Solarity's page rather than Next's.** These
 * routes sit outside `(app)`, so nothing else supplies `ds-app` — the 14px base,
 * the body family, the abyss. A page here without the shell renders at the root
 * 16px in a serif, which is the exact bug the port hit on `/privacy` and
 * `/terms`. It looks intentional enough that nobody reports it.
 *
 * **The offer is one destination, not two.** Signed out there is nowhere to
 * "go back" to — `/dashboard` would bounce off the gate and land on sign-in
 * having lost the error. Home is the honest link, the same reasoning
 * `not-found.tsx` uses one file over.
 *
 * **`/join/[token]` is the case that makes this worth having.** It is the first
 * page a new person ever sees, it does a token lookup before rendering, and it
 * is reached from a message on a phone. A stock error page there reads as "this
 * app is broken" to somebody with no reason yet to think otherwise.
 *
 * Not `global-error.tsx`, which is a different and rarer thing: that one
 * replaces the root layout, has to ship its own `<html>` and `<body>`, and only
 * catches throws in the layout itself. Worth adding the day the root layout
 * grows logic that can throw; it has none today.
 */
export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") console.error(error)
  }, [error])

  return (
    <AuthShell wordmark>
      <div className="flex flex-col items-center gap-5 py-2 text-center">
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

        <div className="flex flex-wrap items-center justify-center gap-3">
          <PrimaryButton onClick={reset} align="center">
            Try again
          </PrimaryButton>
          <Link
            href="/"
            className="ds-cta ds-panel ds-type-label ds-text-primary px-4 py-2.5"
            style={{ ["--ds-cta-min" as string]: "auto" }}
          >
            Go home
          </Link>
        </div>

        {/* Never `error.message`: a server throw here carries schema detail. */}
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
    </AuthShell>
  )
}

import Link from "next/link"
import { AuthShell } from "@/components/auth/auth-shell"
import { CONTACT_EMAIL } from "@/lib/legal"

export const metadata = { title: "Sign-in problem — Solarity" }

/**
 * Step 20e. The two reasons this route now receives, and why they are mapped.
 *
 * `reason` began as a passthrough for Supabase's own OAuth message, which is
 * attacker-supplied and rendered as JSX text, so React escapes it. That stays:
 * an undetailed failure makes an OAuth problem unreportable.
 *
 * **What changed is that `/auth/confirm` sends two codes of its own**, and
 * rendering `link` or `missing` as a bare word would be worse than saying
 * nothing. They are mapped to sentences that describe what somebody should do,
 * because both are recoverable and neither is their fault.
 *
 * An unrecognised value still falls through to the passthrough, which keeps the
 * OAuth behaviour intact rather than silently swallowing a message nobody
 * anticipated.
 */
const KNOWN: Record<string, { title: string; body: string; retry: string; retryHref: string }> = {
  link: {
    title: "That link has expired",
    body: "Confirmation links are single-use and don't last long. Ask for a new one and it'll arrive in a moment.",
    retry: "Get a new link",
    retryHref: "/auth/check-email",
  },
  missing: {
    title: "Something was missing from that link",
    body: "The link didn't carry what we needed to confirm you. Opening it from the email again usually fixes it — some mail apps trim long URLs.",
    retry: "Get a new link",
    retryHref: "/auth/check-email",
  },
}

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>
}) {
  const { reason } = await searchParams
  const known = reason ? KNOWN[reason] : undefined

  return (
    /*
      **Not `ds-text-danger`, on the one auth screen that could argue for it.**
      Every reason this page renders is recoverable and none is the visitor's
      fault — an expired link, a mail client that trimmed a URL. Colouring the
      title as an alarm would make a routine "ask for another one" read as a
      broken account, which is the opposite of what the copy says.

      The footer stays: somebody who cannot sign in is exactly who needs the
      Support link, and this is the screen they are stuck on.
    */
    <AuthShell>
      <h1 className="ds-type-title ds-text-primary">
        {known?.title ?? "Couldn't sign you in"}
      </h1>

      {known ? (
        <p className="ds-type-note ds-text-muted">{known.body}</p>
      ) : reason ? (
        <p className="ds-type-note ds-text-muted">{reason}</p>
      ) : null}

      {/*
        A link styled as the primary action. `ds-cta` is a class rather than a
        component for exactly this: the control is a navigation, so it has to be
        an `<a>`, and wrapping a `<button>` in a `<Link>` would be a button that
        is not one.
      */}
      <Link
        href={known?.retryHref ?? "/auth/sign-in"}
        className="ds-cta ds-bg-flame ds-text-on-light ds-type-label self-start px-4 py-2.5"
        style={{ ["--ds-cta-min" as string]: "auto" }}
      >
        {known?.retry ?? "Try again"}
      </Link>

      <p className="ds-type-note ds-text-muted">
        Still stuck? Write to{" "}
        <a href={`mailto:${CONTACT_EMAIL}`} className="ds-link">
          {CONTACT_EMAIL}
        </a>
        .
      </p>
    </AuthShell>
  )
}

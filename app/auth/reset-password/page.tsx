import Link from "next/link"
import { AuthShell } from "@/components/auth/auth-shell"
import { createClient } from "@/lib/supabase/server"
import { ResetForm } from "./reset-form"

export const metadata = {
  title: "Set a new password — Solarity",
  robots: { index: false, follow: false },
}

/**
 * Step 20f. Where a reset link lands.
 *
 * ## How somebody gets here, and why there is no token on this page
 *
 * The email points at `/auth/confirm?token_hash=…&type=recovery&next=/auth/
 * reset-password`. That route exchanges the token for a session and then
 * redirects here, so **by the time this page renders the credential has already
 * been spent** and the URL is clean. Nothing single-use sits in the address bar,
 * in history, or in a referrer.
 *
 * ## The session is the entire authorisation
 *
 * There is no "current password" field, and that is not an oversight: proving
 * control of the address *is* the authentication, and asking for the old
 * password would ask the one thing somebody resetting it does not have.
 *
 * Which makes the check below the whole guard. No session means the link was
 * never followed, has expired, or somebody typed the URL — and all three end the
 * same way, with an offer to ask for another link rather than a form that
 * cannot work.
 *
 * ## It deliberately does not use the `(app)` layout
 *
 * A recovery session is a real session, so this page would pass the gate — and
 * then the gate would send anybody without a username to `/onboarding` instead,
 * losing the reset. Living under `/auth` keeps the one thing they came to do in
 * front of them.
 */
export default async function ResetPasswordPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <AuthShell>
        <h1 className="ds-type-title ds-text-primary">That link has expired</h1>
        <p className="ds-type-note ds-text-muted">
          Reset links are single-use and don&apos;t last long. Ask for another
          and it&apos;ll arrive in a moment.
        </p>
        {/*
          The same navigation-styled-as-a-primary-action as `/auth/error`. Both
          screens are dead ends with exactly one way forward, and that way is a
          route rather than a form, so it has to be an `<a>`.
        */}
        <Link
          href="/auth/forgot-password"
          className="ds-cta ds-bg-flame ds-text-on-light ds-type-label self-start px-4 py-2.5"
          style={{ ["--ds-cta-min" as string]: "auto" }}
        >
          Send a new link
        </Link>
      </AuthShell>
    )
  }

  /**
   * **No check for "did they arrive via a recovery link".** A recovery session
   * is indistinguishable from an ordinary one by the time it reaches here, and
   * it does not matter: somebody signed in choosing a new password is a
   * legitimate thing to want, and refusing it would be a guard against nothing.
   */
  return (
    <AuthShell>
      <div className="flex flex-col gap-1.5">
        <h1 className="ds-type-title ds-text-primary">Set a new password</h1>
        <p className="ds-type-note ds-text-muted">
          For <strong className="ds-text-primary font-medium">{user.email}</strong>
          . You&apos;re already signed in, so this is the last step.
        </p>
      </div>

      <ResetForm />
    </AuthShell>
  )
}

import Link from "next/link"
import { redirect } from "next/navigation"
import { AuthShell } from "@/components/auth/auth-shell"
import { createClient } from "@/lib/supabase/server"
import { ForgotForm } from "./forgot-form"

export const metadata = {
  title: "Reset your password — Solarity",
  robots: { index: false, follow: false },
}

/**
 * Step 20f. The way back in.
 *
 * **Linked from `/auth/sign-in` since 20e**, before this page existed, because
 * the sign-in page is where somebody looks for it and a missing link is the
 * whole problem it solves.
 *
 * **Google accounts have nothing to reset**, and the note at the bottom says so.
 * Somebody who signed in with Google and never set a password will otherwise
 * request a link, receive nothing — enumeration protection forbids explaining —
 * and conclude the product is broken. That sentence is the only thing standing
 * between them and that conclusion.
 */
export default async function ForgotPasswordPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Already signed in, so there is nothing to recover. Changing a password from
  // here would be a different feature with a different guard.
  if (user) redirect("/dashboard")

  return (
    <AuthShell>
      <div className="flex flex-col gap-1.5">
        <h1 className="ds-type-title ds-text-primary">Reset your password</h1>
        <p className="ds-type-note ds-text-muted">
          Tell us your email address and we&apos;ll send you a link to set a new
          one.
        </p>
      </div>

      <ForgotForm />

      {/*
        The Google sentence keeps its hairline. It is not a footnote to the
        form — it is the only thing that reaches somebody who will otherwise
        request a link, receive nothing, and conclude the product is broken.
      */}
      <p className="ds-border-oatmeal ds-type-note ds-text-muted border-t pt-4">
        If you signed in with Google, there&apos;s no password to reset — use
        the Google button on the{" "}
        <Link href="/auth/sign-in" className="ds-link">
          sign-in page
        </Link>
        .
      </p>
    </AuthShell>
  )
}

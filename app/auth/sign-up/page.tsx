import Link from "next/link"
import { redirect } from "next/navigation"
import { AuthShell } from "@/components/auth/auth-shell"
import { GoogleButton } from "@/components/auth/google-button"
import { CardFoot, OrRule } from "@/components/ui/field"
import { createClient } from "@/lib/supabase/server"
import { signInWithGoogle } from "@/app/actions/auth"
import { MINIMUM_AGE } from "@/lib/legal"
import { SignUpForm } from "./sign-up-form"

export const metadata = { title: "Create an account — Solarity" }

/**
 * Step 20e. The second way in.
 *
 * **Google first, here as on `/auth/sign-in`.** It is one tap against three
 * fields and an email round trip, it is what almost everybody will use, and
 * putting it second would be arranging the page around the implementation
 * rather than around the person.
 *
 * **The age line is here rather than only in the terms**, because 18+ is a rule
 * somebody should meet before creating an account rather than discover inside
 * one. Nothing enforces it: Google asks nothing and this form asks nothing, and
 * that gap is deliberate and recorded in the legal review.
 */
export default async function SignUpPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Already signed in, so this page is a dead end. The gate decides where they
  // actually belong — onboarding, terms or the dashboard.
  if (user) redirect("/dashboard")

  return (
    /*
      **No wordmark, unlike sign-in, and the asymmetry is intentional.** This
      screen has a real `<h1>` of its own — "Create an account" — and a lede
      under it. Adding the mark above would give the page two titles and push
      the first field below the fold on a phone, on the one screen where getting
      to the fields is the entire job.
    */
    <AuthShell>
      <div className="flex flex-col gap-1.5">
        <h1 className="ds-type-title ds-text-primary">Create an account</h1>
        <p className="ds-type-note ds-text-muted">
          Solarity is goals you keep with a few friends watching.
        </p>
      </div>

      <form action={signInWithGoogle}>
        <input type="hidden" name="next" value="/dashboard" />
        <GoogleButton />
      </form>

      <OrRule />

      <SignUpForm />

      <p className="ds-type-note ds-text-muted">
        You need to be {MINIMUM_AGE} or older. You&apos;ll pick a username next.
      </p>

      <CardFoot>
        <p className="ds-type-note ds-text-muted">
          Already have an account?{" "}
          <Link href="/auth/sign-in" className="ds-link">
            Sign in
          </Link>
        </p>
      </CardFoot>
    </AuthShell>
  )
}

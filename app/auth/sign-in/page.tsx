import Link from "next/link"
import { redirect } from "next/navigation"
import { AuthShell } from "@/components/auth/auth-shell"
import { GoogleButton } from "@/components/auth/google-button"
import { CardFoot, OrRule } from "@/components/ui/field"
import { createClient } from "@/lib/supabase/server"
import { signInWithGoogle } from "@/app/actions/auth"
import { safeRedirect } from "@/lib/safe-redirect"
import { PasswordForm } from "./password-form"

export const metadata = { title: "Sign in — Solarity" }

/**
 * Step 20e. Two ways in, one page.
 *
 * **One route rather than `/auth/sign-in/password`**, and the reason is the
 * `next` parameter. It is the only thing carrying somebody back to the page
 * they were trying to reach, `sw.js` deep-links with it, and a second hop is
 * exactly where a value like that gets silently dropped — landing people on the
 * dashboard instead of the Circle they tapped a notification for.
 *
 * **Google stays on top** because it is one tap against two fields, and because
 * every existing account uses it.
 */
export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  const { next } = await searchParams
  const target = safeRedirect(next)

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (user) redirect(target)

  return (
    /*
      **The lede moved into the shell rather than being a second `<p>` here.**
      It was the only screen with one, and it read as page content sitting above
      a card; as the wordmark's own line it reads as what it is — the sentence
      that says what the product is to somebody who has never seen it.

      The `<h1>` is gone with it. A wordmark is not a heading: it named the site
      rather than the page, and it was the only `h1` on the screen, so a screen
      reader's outline for "sign in" said "Solarity" and nothing else.
    */
    <AuthShell
      wordmark
      lede="Friends who see each other's progress motivate each other to keep going."
    >
      {/*
        **The page's `h1`, and it is `sr-only` on purpose.** The old one was the
        word "Solarity", which named the *site* rather than the page — so a
        screen reader's outline for every auth screen read identically. There is
        no visible heading to promote here (the card is the whole screen and its
        first control is a button), and inventing one would be chrome nobody
        asked for. This names the page for anyone navigating by heading and
        costs the design nothing.
      */}
      <h1 className="sr-only">Sign in to Solarity</h1>

      <form action={signInWithGoogle}>
        <input type="hidden" name="next" value={target} />
        <GoogleButton />
      </form>

      <OrRule />

      <PasswordForm next={target} />

      <CardFoot>
        {/*
          Present before `/auth/forgot-password` exists, because the sign-in
          page is where somebody looks for it and a missing link is the whole
          problem it solves. 20f builds the page.
        */}
        <Link href="/auth/forgot-password" className="ds-link ds-type-note">
          Forgot your password?
        </Link>
        <p className="ds-type-note ds-text-muted">
          No account yet?{" "}
          <Link href="/auth/sign-up" className="ds-link">
            Create one
          </Link>
        </p>
      </CardFoot>
    </AuthShell>
  )
}

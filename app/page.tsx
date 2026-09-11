import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Notice } from "@/components/notice"
import { LandingContent } from "@/components/landing/landing-content"

export const metadata = {
  title: "Solarity — goals you keep with friends",
  description:
    "Set daily goals, check them off, and let a few friends see how you're doing. Invite-only Circles of up to ten people.",
}

/**
 * The landing page.
 *
 * ## It is now the catalog's design, cloned
 *
 * The previous version was written plain on purpose — "nothing here may depend
 * on styling to make sense" — so that the design pass would be a restyle rather
 * than a rewrite. In the end it was a rewrite: `components/landing/` is the
 * catalog's five-act page, copied verbatim by `scripts/port-landing.mjs`, with
 * the cropped sun running off the right edge and each act owning its full
 * width.
 *
 * **Three things were carried into it that the catalog never had**, because
 * they are load-bearing rather than decorative and `e2e/legal.spec.ts` asserts
 * every one:
 *
 * 1. **The streak rule.** One person missing one goal ends it for the group.
 *    That is the rule most likely to feel unfair the first time it bites, and
 *    the spec's own comment names it as the paragraph a rewrite would trim.
 * 2. **The example day**, rendered rather than screenshotted, so it cannot go
 *    stale in the one place somebody is deciding whether to trust the
 *    description.
 * 3. **Working controls.** Every button in the catalog was an `onClick` stub;
 *    they are `<Link>`s to `/auth/sign-up`, `/auth/sign-in` and the three legal
 *    pages now.
 *
 * ## What this file still owns
 *
 * **The signed-in redirect**, so a member never meets the marketing page, and
 * **`Notice`** — a signed-out visitor following a dead invite link lands here,
 * and sending them to `/dashboard` instead would bounce them to sign-in and
 * lose the explanation on the way.
 *
 * `LandingContent` is a client component (the hero canvas needs one), so the
 * auth read stays here in the server component that wraps it.
 */
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>
}) {
  const { notice } = await searchParams

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (user) redirect("/dashboard")

  return (
    <>
      {/*
        Above the hero rather than inside it. The notice is the reason this
        person is here at all — a dead invite link — and burying it under a
        full-viewport canvas would answer a question they did not ask before the
        one they did.
      */}
      {notice ? (
        <div className="ds-bg-abyss px-6 pt-6 lg:px-16">
          <Notice notice={notice} href="/" />
        </div>
      ) : null}

      <LandingContent />
    </>
  )
}

import { redirect } from "next/navigation"
import { OnboardingShell } from "@/components/onboarding/onboarding-shell"
import { createClient } from "@/lib/supabase/server"
import { OnboardingForm } from "./onboarding-form"

export const metadata = { title: "Set up — Solarity" }

export default async function OnboardingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/sign-in?next=/onboarding")

  const { data: profile } = await supabase
    .from("users")
    .select("username, display_name")
    .eq("id", user.id)
    .maybeSingle()

  // Renaming happens in settings, not here.
  if (profile?.username) redirect("/dashboard")

  return (
    /*
      **The heading keeps the word "Welcome" in both branches**, and that is not
      only copy: `gates.spec.ts` asserts `heading /welcome/i` as its proof that
      an account without a username lands here rather than looping through the
      `(app)` gate. Renaming this to "Set up your account" would turn a routing
      test red for a wording change.
    */
    <OnboardingShell
      title={
        profile?.display_name ? `Welcome, ${profile.display_name}` : "Welcome"
      }
      lede="Two things and you're in."
    >
      <OnboardingForm />
    </OnboardingShell>
  )
}

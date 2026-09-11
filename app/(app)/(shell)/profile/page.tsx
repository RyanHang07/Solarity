import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { profileByUsername } from "@/app/actions/profile"
import { signedAvatarUrl } from "@/app/actions/settings"
import { SettingsIcon } from "@/components/marks/marks"
import { ProfileView } from "../profile-view"

export const metadata = { title: "Profile — Solarity" }

/**
 * Step 15b. **Your own profile, and the fourth section of the shell.**
 *
 * `/profile` rather than `/profile/[my-username]`, so the tab has a fixed
 * destination. A tab whose href changed with the signed-in account would have
 * to be computed per request, which is exactly the thing `sections.ts` exists
 * to avoid — the list is static data and stays that way.
 *
 * **It reads the same RPC as anyone else's profile**, rather than reading the
 * tables directly because it happens to be yours. One code path means the
 * screen cannot show you something a visitor would not see, except where
 * `profile_by_username` deliberately says so: your own stats are returned
 * whatever `visible_on_profile` says, exactly as the RLS policy has always
 * allowed.
 */
export default async function OwnProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/sign-in")

  // The username, not the id: the RPC's whole contract is a username, and
  // giving it one keeps this page identical to the public one.
  const { data: me } = await supabase
    .from("users")
    .select("username")
    .eq("id", user.id)
    .maybeSingle()

  // The `(app)` layout already bounces anyone without a username to onboarding.
  // Guarded anyway, because a profile without one has nothing to look up.
  if (!me?.username) redirect("/onboarding")

  const profile = await profileByUsername(me.username)

  // Unreachable in practice — this is your own row, and blocking yourself is
  // not possible. Handled rather than asserted, because a `!` here would be a
  // runtime TypeError on a screen someone reached by tapping a tab.
  if (!profile) redirect("/dashboard")

  const avatarUrl = await signedAvatarUrl(profile.avatarKey)

  return (
    <>
      {/*
        **The settings gear, and it is here because the app bar took it away.**
        `md:hidden`.

        The bar carries the cog on desktop and is hidden entirely on a phone —
        so on mobile the only remaining route to Settings was the sentence
        below, buried in a line about who can see your stats. That is reachable
        rather than findable.

        Profile is where it belongs anyway: the account this page is *about* is
        where the account's settings live, and the bottom bar has five equal
        tabs with no room for a sixth.

        `md:hidden` rather than always-on, so desktop keeps exactly one link
        named "Account settings" — two would be ambiguous to a screen reader
        and to a test locator, which is the rule `sections.ts` already states.
      */}
      <div className="flex justify-end md:hidden">
        <Link
          href="/settings"
          aria-label="Account settings"
          title="Account settings"
          className="ds-link"
        >
          <SettingsIcon size={22} />
        </Link>
      </div>

      <ProfileView profile={profile} avatarUrl={avatarUrl} />

      <p className="ds-text-muted">
        {/*
          The toggle lives in settings with every other preference, and this is
          the screen where someone thinks to look for it. A second copy of the
          control here would be two writers for one column.
        */}
        {profile.statsVisible ? "Your stats are visible" : "Your stats are hidden"} to
        other members.{" "}
        <Link href="/settings" className="underline">
          Change this in settings
        </Link>
        .
      </p>
    </>
  )
}

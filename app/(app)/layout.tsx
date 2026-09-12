import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { signOut } from "@/app/actions/auth"
import { signedAvatarUrl } from "@/app/actions/settings"
import { Avatar } from "@/components/avatar"
import { AppNavDesktop, AppNavMobile } from "@/components/shell/app-nav"
import { SunMark, SettingsIcon } from "@/components/marks/marks"
import { TAB_NOTIFICATION_TYPES } from "@/lib/notification-types"

/**
 * Onboarding gate for every signed-in screen. See architecture/app.md section 2b
 * for why this lives here rather than in the proxy.
 *
 * A signed-in user with no row is a broken state rather than a new user — the
 * auth trigger creates it. Onboarding is still the right destination, since
 * setting a username is the only thing that can repair it.
 */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/sign-in")

  /**
   * Step 20d. **An account can exist with an address nobody has proved they
   * own**, and only a gate catches it.
   *
   * **The original note here was wrong and is worth correcting rather than
   * deleting.** It said `signUp` returns a session, so closing the tab left a
   * signed-in account on an unverified address. With "Confirm email" on — our
   * configuration — `signUp` returns `session: null`, so that person is signed
   * *out* and the proxy sends them to sign-in long before this line runs. The
   * same mistake left the resend control on `/auth/check-email` invisible,
   * which is how it was found.
   *
   * So what does reach this check? Configuration and providers, not the signup
   * form: "Confirm email" being turned off later, an OAuth provider that hands
   * back an address it has not verified, or an account created through the
   * dashboard without confirmation. **A cheap defence against a setting
   * changing**, rather than the main path it was written as.
   *
   * **Free.** `email_confirmed_at` is on the object `getUser()` already
   * returned; this costs no query.
   *
   * **Google accounts are unaffected**, and that was checked against the data
   * rather than assumed: Google verifies the address, so Supabase sets
   * `email_confirmed_at` at sign-in. All three accounts that predate step 20
   * have it. Had they not, adding this line would have locked every one of them
   * out of the app behind a screen that did not exist yet.
   */
  if (!user.email_confirmed_at) redirect("/auth/check-email")

  const { data: profile } = await supabase
    .from("users")
    .select("username, avatar_url, terms_accepted_at")
    .eq("id", user.id)
    .maybeSingle()

  if (!profile?.username) redirect("/onboarding")

  /**
   * Step 20c. **A gate rather than a flow**, for the same reason as the
   * username check above it: any of these can be abandoned midway, and only
   * something evaluated on every protected navigation catches that.
   *
   * Reached by exactly two kinds of account. One is somebody who signed in with
   * Google before there was anything to agree to, which is everybody who
   * existed before migration 105. The other is nobody: a signup records
   * acceptance inside `complete_onboarding`, so the front door never queues
   * this screen behind it.
   *
   * **Ordered after the username on purpose.** `/onboarding/terms` needs a
   * username to exist before it means anything, and reversing the two would put
   * a terms screen in front of an account that has no profile yet.
   *
   * The column is free: it comes back in the read the layout already does.
   */
  if (!profile.terms_accepted_at) redirect("/onboarding/terms")


  /**
   * 15f. Your own picture in the header.
   *
   * **One signed URL per page load, and it is the price of the feature.** This
   * layout wraps every signed-in screen, so a Storage round trip here is paid
   * on all of them. It is a single `createSignedUrl` against a private bucket
   * and the alternative — a public bucket — would make every avatar a
   * permanent unauthenticated URL, which is a worse trade than one request.
   *
   * Null when there is no picture, and `Avatar` renders an initial rather than
   * a broken image.
   */
  /**
   * ## The unread count moved up here, and the bar moved with it
   *
   * It used to live in `(shell)/layout.tsx` on the stated rule *"does it belong
   * to the shell rather than to a section"*. The rule is right and the answer
   * changed: the bar is now the **app's** furniture rather than the shell's —
   * one navbar on desktop, one tab bar on a phone — so the count that renders
   * on it belongs here too.
   *
   * The cost is three extra `head: true` counts, on `/today`, `/settings` and
   * `/circles/*`, which previously rendered no bar at all. That is one cheap
   * count query in exchange for a bar that is correct on every screen instead
   * of five.
   *
   * `MarkRead` still repairs it: opening Notifications marks everything read
   * and calls `router.refresh()`, which re-renders this layout on the server
   * without unmounting the bar.
   */
  const [avatarUrl, { count: unread }] = await Promise.all([
    signedAvatarUrl(profile.avatar_url),
    supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .is("read_at", null)
      .in("type", TAB_NOTIFICATION_TYPES),
  ])

  const badges = { notifications: unread ?? 0 }

  return (
    <div className="ds-app flex min-h-full flex-1 flex-col">
      {/*
        ═══ the app bar ═══

        **One bar on desktop, and none on a phone.**

        It used to be a wordmark row here plus a section row in the shell —
        three horizontal rules in the first 100px, and the sections reading as
        the page's first section rather than as the app's furniture.

        The bar is *filled*, and that is the distinction: everything the page
        owns sits on the abyss, and the one thing the app owns does not. A
        border could not say it, because the page is full of borders — a change
        of plane is the only signal nothing else on screen is using.

        **Hidden below `md`.** A wordmark and an avatar across the top of a
        375px screen cost 52px of the one dimension a phone is short of, and
        neither is a control: the wordmark names an app you just tapped the
        icon of, and the avatar goes to Profile, which is a tab.
      */}
      <header className="ds-navbar hidden md:block">
        <div className="ds-container flex items-center justify-between gap-6 px-8 py-3">
          <Link
            href="/dashboard"
            /*
              `ds-type-title`, not `text-xl font-semibold tracking-[-0.01em]` —
              those three are value-for-value what the token already sets, and
              `AuthShell`'s wordmark was corrected the same way. Three raw
              classes that agree with a token today are three that disagree
              after the next change to the scale.
            */
            className="ds-type-title ds-font-display ds-text-primary flex shrink-0 items-center gap-2.5"
          >
            <span className="ds-text-flame">
              <SunMark size={19} />
            </span>
            Solarity
          </Link>

          <AppNavDesktop badges={badges} />

          <span className="flex shrink-0 items-center gap-4">
            <Link
              href="/settings"
              aria-label="Account settings"
              title="Account settings"
              className="ds-text-muted"
            >
              <SettingsIcon size={19} />
            </Link>

            {/*
              **A link to your own profile, not decoration.** The picture is
              the most tappable thing in the header and every app puts your
              profile behind it; making it inert would be a small, constant
              surprise.
            */}
            <Link href="/profile" className="flex items-center gap-2">
              <Avatar url={avatarUrl} name={profile.username} size={26} />
              <span className="sr-only">{profile.username}</span>
            </Link>

            <form action={signOut}>
              <button type="submit" className="ds-link ds-type-note">
                Sign out
              </button>
            </form>
          </span>
        </div>
      </header>

      {/*
        **The bottom padding reads the bar's own variable**, so the two cannot
        drift, and it is dropped at `md` where the bar is not there to need it.
        Written as an arbitrary value rather than the `ds-tabbar-pad` token
        because the token is unconditional — solarity-ui has no breakpoints to
        speak of, since its previews render inside a device frame that would lie
        to one.

        **Every safe-area inset is already paid on `body` in `globals.css`, not
        just the top one.** This calc used to add `env(safe-area-inset-bottom)`
        as well, and the comment here named only the top — which is how it went
        unnoticed. Counting it again reserved an extra 34px of empty scroll at
        the end of every list on an iPhone.

        Three places were paying one inset: `body`, this padding, and
        `.ds-tabbar` itself. The bar was the visible one, floating above a band
        of dead abyss; this was the quiet one.
      */}
      <main className="ds-container flex flex-1 flex-col p-4 pb-[calc(var(--ds-tabbar-height)+1rem)] md:px-8 md:pb-6 md:pt-6">
        {children}
      </main>

      <AppNavMobile badges={badges} />
    </div>
  )
}

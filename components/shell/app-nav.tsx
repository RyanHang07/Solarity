"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { SECTIONS, activeSection } from "@/app/(app)/(shell)/sections"
import {
  BellIcon,
  CirclesIcon,
  GoalsIcon,
  OverviewIcon,
  ProfileIcon,
} from "@/components/marks/marks"

/* ------------------------------------------------------------------ *
 * The section navigation, in two shapes.
 *
 * ## Why this is a client component, unchanged from the bar it replaces
 *
 * A layout does *not* re-render when you navigate between its children. If the
 * layout computed the active section and passed it down it would compute it
 * once — on the section you first arrived at — and every tab after that would
 * highlight the wrong one. `usePathname` subscribes to the router instead, so
 * the highlight updates without the layout being involved, and updates *on
 * tap* rather than after the new segment loads.
 *
 * That reasoning is `tab-bar.tsx`'s and it survives the restyle intact.
 *
 * ## Two shapes, one list
 *
 * **Desktop** — a text row inside the app bar, with Notifications pulled out
 * as a bell beside the settings cog. It is the only section that is
 * *time-sensitive* rather than a place you go, so it sits where a browser's
 * utilities live. A pointer does not need a 44px target and four icons across
 * a wide bar is decoration.
 *
 * **Mobile** — five equal targets glued to the bottom, icon above label. The
 * labels stay: dropping them is the conventional choice and the wrong one
 * here, because Overview and Circles are not things a glyph says unambiguously
 * on first use, and nobody gets a second onboarding.
 * ------------------------------------------------------------------ */

const ICONS: Record<string, (props: { size?: number }) => React.ReactNode> = {
  overview: OverviewIcon,
  goals: GoalsIcon,
  circles: CirclesIcon,
  notifications: BellIcon,
  profile: ProfileIcon,
}

/**
 * The accessible name for a section link that may carry a badge.
 *
 * **One format for both shapes, and an `aria-label` rather than an `sr-only`
 * span.** The mobile tab already renders "Notifications" visibly, so an
 * `sr-only` addition composed into "Notifications Notifications, 3 unread" —
 * the label said twice. The desktop bell has no visible text at all, so it
 * needed the opposite: a name from nowhere.
 *
 * An `aria-label` answers both, and because it *starts with* the visible label
 * it still satisfies "label in name" for anyone driving the app by voice.
 *
 * The dot itself is `aria-hidden`: it is the same fact drawn twice, and a
 * screen reader announcing a decorative circle after the count is noise.
 */
const sectionName = (label: string, count: number) =>
  count ? `${label}, ${count} unread` : label

export function AppNavDesktop({
  badges = {},
}: {
  badges?: Record<string, number | undefined>
}) {
  const active = activeSection(usePathname())
  const unread = badges.notifications ?? 0

  return (
    <>
      {/*
        **`items-center` on the row, and its absence used to be a bug.**

        A flex container with no `align-items` is `stretch`, so each link grew
        to the height of the bar — set by the 20px wordmark — and its text
        rendered at the *top* of a box nobody meant to create. It looked like a
        spacing problem and no amount of margin fixed it.
      */}
      <nav
        className="flex flex-1 items-center gap-5 pt-0.5"
        aria-label="Sections"
      >
        {SECTIONS.filter((section) => section.key !== "notifications").map(
          (section) => {
            const on = active?.key === section.key
            return (
              <Link
                key={section.key}
                href={section.href}
                aria-current={on ? "page" : undefined}
                className={`ds-navbar-link ds-type-label whitespace-nowrap ${
                  on ? "ds-text-flame" : "ds-text-primary"
                }`}
              >
                {section.label}
              </Link>
            )
          },
        )}
      </nav>

      {/*
        The bell is a section and the cog is not, which is why the bell can be
        flame and the cog never is. They sit together because both are reached
        for when something is off, rather than being places the app moves you
        through.
      */}
      <Link
        href="/dashboard/notifications"
        aria-current={active?.key === "notifications" ? "page" : undefined}
        aria-label={sectionName("Notifications", unread)}
        className={`relative ${
          active?.key === "notifications" ? "ds-text-flame" : "ds-text-muted"
        }`}
      >
        <BellIcon size={19} />
        {unread ? <span className="ds-badge" aria-hidden /> : null}
      </Link>
    </>
  )
}

export function AppNavMobile({
  badges = {},
}: {
  badges?: Record<string, number | undefined>
}) {
  const active = activeSection(usePathname())

  return (
    /*
      **A zero-height sticky slot, not a fixed bar.**

      `position: fixed` would take the bar out of the document and pin it to the
      viewport — which works, until the page is inside anything that
      establishes a containing block. The slot takes no space in the flow, so
      content scrolls *under* the bar rather than stopping above it; the layout
      reserves the height by reading `--ds-tabbar-height` directly, so the bar
      and the gap beneath it cannot drift.
    */
    <div className="ds-tabbar-slot md:hidden">
      <nav className="ds-tabbar" aria-label="Sections">
        {SECTIONS.map((section) => {
          const on = active?.key === section.key
          const Icon = ICONS[section.key]
          const count = badges[section.key] ?? 0
          return (
            <Link
              key={section.key}
              href={section.href}
              aria-current={on ? "page" : undefined}
              aria-label={sectionName(section.label, count)}
              className={`flex flex-1 flex-col items-center justify-center gap-1 border-t-2 pt-1 ${
                on
                  ? "ds-text-flame border-current"
                  : "ds-text-muted border-transparent"
              }`}
              style={{ minHeight: "var(--ds-tabbar-height)" }}
            >
              {/*
                **Overview is the logo at home size, and it breaks the row on
                purpose.** The other four are 21px Heroicons that say *go
                here*; this one says *you are home*. A bar where every icon has
                equal weight makes you read all five to find the one you want.
                The reserved height is the larger of the two, so the small
                icons centre against it instead of the labels stepping up and
                down across the bar.
              */}
              <span className="relative flex h-8 items-center">
                <Icon size={section.key === "overview" ? 30 : 21} />
                {count ? <span className="ds-badge" aria-hidden /> : null}
              </span>
              <span className="ds-font-mono text-[9px] uppercase tracking-[0.08em]">
                {section.label}
              </span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

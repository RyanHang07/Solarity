import type { ReactNode } from "react"
import { Corners } from "@/components/marks/accents"

/**
 * The frame the five onboarding screens share.
 *
 * **The five disagreed on width three ways** — `max-w-xs` on four, `max-w-sm`
 * on terms — and only terms sat in a box at all, so the flow visibly changed
 * shape twice on the way through. That is the whole of what this fixes.
 *
 * ## There is no step indicator, and adding one would be a lie
 *
 * An earlier pass had "Step 2 of 4" with a phase row above it. The real flow
 * has no fixed denominator: `terms` is a gate shown only to accounts that
 * predate it, `install` can be skipped outright, and `goal` redirects past
 * itself for anyone who has ever had one. "of 4" would be a number the app
 * cannot honour — the design inventing a fact about the product rather than
 * dressing one.
 *
 * ## `title` is optional, because two screens cannot use it
 *
 * `/onboarding/install` and `/onboarding/notifications` change their own
 * heading *and* lede from client state — the install nudge says something
 * different once it knows the app is already installed, and the push prompt
 * once permission is granted. A title passed from the server would be the wrong
 * one half the time, so those two render their own using the same tokens.
 *
 * Everything else passes `title`, which keeps the `<h1>` in the shell where the
 * card can be sure it has exactly one.
 */
export const OnboardingShell = ({
  title,
  lede,
  children,
}: {
  title?: string
  lede?: string
  children: ReactNode
}) => (
  <main className="flex min-h-full flex-1 flex-col items-center justify-center gap-6 p-8">
    <div className="ds-card relative flex w-full max-w-sm flex-col gap-5 p-5">
      <Corners at={["tl", "br"]} size={14} />

      {title ? (
        <div className="flex flex-col gap-1.5">
          <h1 className="ds-type-title ds-text-primary">{title}</h1>
          {lede ? <p className="ds-type-note ds-text-muted">{lede}</p> : null}
        </div>
      ) : null}

      {children}
    </div>
  </main>
)

/**
 * The heading a screen renders for itself, when the shell cannot.
 *
 * Exported rather than duplicated so the two client-driven screens cannot
 * drift from the three server-rendered ones — the failure this shell exists to
 * end, reintroduced one level down.
 */
export const OnboardingHeading = ({
  title,
  lede,
}: {
  title: string
  lede?: ReactNode
}) => (
  <div className="flex flex-col gap-1.5">
    <h1 className="ds-type-title ds-text-primary">{title}</h1>
    {lede ? <p className="ds-type-note ds-text-muted">{lede}</p> : null}
  </div>
)

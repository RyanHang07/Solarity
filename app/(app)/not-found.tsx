import Link from "next/link"
import { CONTACT_EMAIL } from "@/lib/legal"
import { OrbitMark } from "@/components/marks/marks"

/**
 * The signed-in 404.
 *
 * **A second file, and the duplication is the point.** A `not-found.tsx` inside
 * a route group is rendered *within* that group's layout, so this one keeps the
 * app bar and the tab bar while the root one does not. Removing the chrome on
 * the one screen that means "you took a wrong turn" is exactly when a person
 * most wants the way back — and it keeps the 404 feeling like a room in the app
 * rather than the exit.
 *
 * **What differs from the root page is the offer, not the styling.** Signed out
 * there is one honest destination; signed in there are two, because the wrong
 * turn may have come from a broken link inside Solarity and that is worth
 * hearing about.
 *
 * No `<AuthShell>` here: `(app)/layout.tsx` already supplies `ds-app`, the
 * container and the navigation. This renders into the `<main>` it provides.
 */
export default function AppNotFound() {
  return (
    /*
      `ds-centre-short` rather than a hard-coded min-height. The token centres a
      screen that does not fill the viewport without pushing a tall one around,
      which is the whole reason it exists.
    */
    <div className="ds-centre-short flex flex-col items-center gap-5 text-center">
      <span className="ds-text-flame opacity-60" aria-hidden>
        <OrbitMark size={64} />
      </span>

      <div className="flex flex-col gap-1.5">
        <h1 className="ds-type-title ds-text-primary">
          Nothing at this address
        </h1>
        <p className="ds-type-note ds-text-muted max-w-[40ch]">
          If you followed a link from inside Solarity, that is worth telling me
          about.
        </p>
      </div>

      {/*
        **Two ways out, and Overview is the primary one.** It is where the app
        opens and where somebody who took a wrong turn was probably heading.
        Support is secondary because most 404s are a mistyped URL and do not
        need reporting — but the one that came from a broken internal link does,
        and this is the only route by which anyone would hear about it.

        `items-center` on the row: the two controls have different heights, and
        without it the flex default stretches the shorter to match.
      */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/dashboard"
          className="ds-cta ds-bg-flame ds-text-on-light ds-type-label px-4 py-2.5"
          style={{ ["--ds-cta-min" as string]: "auto" }}
        >
          Back to Overview
        </Link>
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="ds-cta ds-panel ds-type-label ds-text-primary px-4 py-2.5"
          style={{ ["--ds-cta-min" as string]: "auto" }}
        >
          Get help
        </a>
      </div>
    </div>
  )
}

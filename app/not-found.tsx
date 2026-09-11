import Link from "next/link"
import { AuthShell } from "@/components/auth/auth-shell"
import { OrbitMark } from "@/components/marks/marks"

export const metadata = { title: "Not found — Solarity" }

/**
 * The root 404, and until now Solarity had none.
 *
 * **This path is reachable by design rather than by typo.**
 * `app/(app)/admin/layout.tsx` calls `notFound()` for anybody who is not an
 * admin — which is the right call, because a 404 tells a stranger nothing where
 * a 403 confirms the page exists. So the commonest way to arrive here is the
 * app's own access control working correctly. A stale invite link does the
 * same, and so does `/dashboard/goals/[id]` for a goal that is not yours.
 *
 * Without this file all of those dropped out of Solarity into Next's stock
 * black-and-white page: no wordmark, no way back, wrong font, wrong colours.
 *
 * **Deliberately not `ds-text-danger`.** Nothing went wrong. A missing page is
 * an ordinary event and usually somebody's own mistyped URL; colouring it as an
 * alarm makes the app look broken for something it handled.
 */
export default function NotFound() {
  return (
    <AuthShell wordmark>
      <div className="flex flex-col items-center gap-5 py-2 text-center">
        {/*
          **An orbit with nothing at its centre**, and it is the only place in
          the system where the mark is drawn incomplete on purpose — every other
          use has a sun in the middle. It says "there is nothing here" in the
          app's own vocabulary rather than with a large grey number.
        */}
        <span className="ds-text-flame opacity-60" aria-hidden>
          <OrbitMark size={64} />
        </span>

        <div className="flex flex-col gap-1.5">
          <h1 className="ds-type-title ds-text-primary">
            Nothing at this address
          </h1>
          <p className="ds-type-note ds-text-muted">
            The page may have moved, or the link that brought you here may have
            expired.
          </p>
        </div>

        {/*
          One destination, because signed out there is genuinely only one.
          "Sign in" as a second button would be a guess about why you are here,
          and half the time the wrong one.

          A `<Link>` styled as the primary action: the control is a navigation,
          so wrapping a `<button>` would be a button that is not one.
        */}
        <Link
          href="/"
          className="ds-cta ds-bg-flame ds-text-on-light ds-type-label self-center px-4 py-2.5"
          style={{ ["--ds-cta-min" as string]: "auto" }}
        >
          Go to Solarity
        </Link>
      </div>
    </AuthShell>
  )
}

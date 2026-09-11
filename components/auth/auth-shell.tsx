import type { ReactNode } from "react"
import { LegalFooter } from "@/components/legal-footer"
import { Corners } from "@/components/marks/accents"
import { SunMark } from "@/components/marks/marks"

/**
 * The frame every signed-out screen sits in.
 *
 * **Six screens were each drawing their own version of this** — sign-in,
 * sign-up, check-email, forgot-password, reset-password and the auth error —
 * and they disagreed about the wordmark, the card, and whether the footer was
 * there at all. That disagreement is the thing this component exists to end;
 * the styling is secondary.
 *
 * ## `wordmark` is a prop rather than always-on
 *
 * A screen someone arrives at cold — sign-in, sign-up, a 404 — should say whose
 * app it is. A screen you reach *from* one of those, like "check your email",
 * should not repeat it: the person has not gone anywhere, and a second wordmark
 * makes a two-step flow read as two products.
 *
 * ## The footer is on by default, and Google is why
 *
 * OAuth consent review wants a reachable privacy link, and a page behind a
 * redirect to sign-in does not qualify. `LegalFooter` also carries Support,
 * which is the link somebody locked out of their account is looking for. Off
 * only where the screen is already inside the app.
 */
export const AuthShell = ({
  children,
  wordmark = false,
  lede,
  footer = true,
}: {
  children: ReactNode
  wordmark?: boolean
  /** One line under the wordmark. Ignored without one, because it has nothing to sit under. */
  lede?: string
  footer?: boolean
}) => (
  <main className="flex min-h-full flex-1 flex-col items-center justify-center gap-6 p-8">
    {wordmark ? (
      <div className="flex flex-col items-center gap-3">
        {/*
          **`ds-type-title`, not `text-xl font-semibold tracking-[-0.01em]`.**
          Those three were carried over from the mock and they are, value for
          value, exactly what the token already sets — 1.25rem, 600, -0.01em.
          Three raw classes that happen to agree with a token today are three
          that will disagree with it after the next change to the scale.

          It stays a `<span>`: the token is a *type role*, not a semantic one,
          and a wordmark names the site rather than the page. The screens supply
          their own `<h1>`.
        */}
        <span className="ds-type-title ds-font-display ds-text-primary flex items-center gap-2.5">
          <span className="ds-text-flame">
            <SunMark size={18} />
          </span>
          Solarity
        </span>
        {lede ? (
          <p className="ds-type-note ds-text-muted max-w-[32ch] text-center">
            {lede}
          </p>
        ) : null}
      </div>
    ) : null}

    {/*
      Two corners, not four. Four is the accent treatment and it is spent once
      per screen on the thing that matters most; on a page that is a single card
      there is nothing to distinguish it from, so the mark would be decoration.
    */}
    <div className="ds-card relative flex w-full max-w-sm flex-col gap-5 p-5">
      <Corners at={["tl", "br"]} size={14} />
      {children}
    </div>

    {footer ? <LegalFooter /> : null}
  </main>
)

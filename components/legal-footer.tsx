import Link from "next/link"

/**
 * Privacy, Terms and Support, on every page a signed-out visitor can reach.
 *
 * **Google's OAuth consent review looks for the privacy link on the app's
 * homepage**, not only inside the account area, which is why this is on `/` and
 * `/auth/sign-in` rather than only in settings.
 *
 * **Support joined it in step 20j** rather than being inlined on the landing
 * page. It was written inline first, and that immediately meant two footers to
 * keep in step — the thing this component exists to prevent. Every auth screen
 * gets the link for free, which is where somebody locked out will look for it.
 */
export function LegalFooter() {
  return (
    <footer className="ds-type-note flex flex-wrap items-center gap-4">
      <Link href="/privacy" className="ds-link">
        Privacy
      </Link>
      <Link href="/terms" className="ds-link">
        Terms
      </Link>
      <Link href="/support" className="ds-link">
        Support
      </Link>
    </footer>
  )
}

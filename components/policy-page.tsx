import Link from "next/link"
import { formatVersion } from "@/lib/legal"

/**
 * The frame both policy pages share.
 *
 * **One layout, so the two cannot drift.** They are read side by side and
 * linked from each other; two hand-built pages would end up with two heading
 * scales and two ways of saying "last updated".
 *
 * **Reachable signed out**, which is the whole point: Google's OAuth consent
 * screen needs a public privacy URL, and a page behind a redirect to sign-in
 * does not qualify. `PUBLIC_PREFIXES` in `lib/supabase/proxy.ts` is what makes
 * that true, and `e2e/legal.spec.ts` is what keeps it true.
 */
export function PolicyPage({
  title,
  version,
  intro,
  children,
}: {
  title: string
  version: string
  /** One sentence under the heading, before any section. */
  intro: string
  children: React.ReactNode
}) {
  return (
    /*
      **`ds-app` on the wrapper, and these pages are why the class exists as a
      class.** A policy page sits outside `(app)`, so it inherits none of the
      shell's base — without this it would render at the root 16px on the abyss
      set by `globals.css`, which is close enough to look intentional and wrong
      enough that the type scale stops lining up with the rest of the product.
    */
    <main className="ds-app mx-auto flex min-h-full w-full max-w-2xl flex-col gap-6 p-6">
      <header className="flex flex-col gap-2">
        {/*
          `legal.spec.ts` clicks `link "Solarity"` here to get home, so the name
          is fixed. It is a link rather than a wordmark: on a policy page the
          way back is the useful thing, not the branding.
        */}
        <Link href="/" className="ds-link self-start">
          Solarity
        </Link>
        <h1 className="ds-type-title ds-text-primary">{title}</h1>
        <p className="ds-text-muted">{intro}</p>
        {/* A date, not a semver: nobody reading this cares about an ordinal,
            and the constant it comes from is what a future acceptance column
            will compare. */}
        <p className="ds-type-note ds-text-muted">
          Last updated {formatVersion(version)}
        </p>
      </header>

      {/* `prose`-free on purpose: the app has no typography plugin, and one
          styled wrapper here would be a second styling system to maintain for
          two pages. */}
      <div className="ds-text-primary flex flex-col gap-6 leading-relaxed">
        {children}
      </div>

      <footer className="ds-border-oatmeal flex flex-wrap items-center gap-4 border-t pt-4">
        <Link href="/privacy" className="ds-link">
          Privacy
        </Link>
        <Link href="/terms" className="ds-link">
          Terms
        </Link>
      </footer>
    </main>
  )
}

/** A titled block. Exists so every section on both pages is shaped the same. */
export function PolicySection({
  heading,
  children,
}: {
  heading: string
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="ds-type-heading ds-text-primary">{heading}</h2>
      {children}
    </section>
  )
}

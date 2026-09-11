import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { Fraunces, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ServiceWorkerRegistrar } from "@/components/service-worker-registrar";
import { INSTALL_PROMPT_SCRIPT } from "@/lib/install-prompt";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * The display face, and **the port shipped without it for a day.**
 *
 * `design-system.css` declares `--font-ds-display: var(--font-fraunces), "Times
 * New Roman", serif`, and nothing in this app defined `--font-fraunces`. So
 * every `ds-type-title`, every `ds-type-metric` and the wordmark fell through
 * to **Times New Roman** — on every screen, in a build where TypeScript, ESLint
 * and the token coverage check all passed, because a CSS variable that resolves
 * to its fallback is not an error anywhere.
 *
 * That is the failure mode a fallback chain is *for*, and it is also why this
 * one was invisible: a serif is a plausible-looking display face, so the page
 * looked designed rather than broken. Worth remembering the next time a
 * stylesheet is copied between projects — **the CSS moves, the fonts do not.**
 */
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  /**
   * **A plain string, and a `template` was tried and reverted.**
   *
   * `{ default, template: "%s — Solarity" }` is the tidier shape and is wrong
   * here: all twenty-five pages already write the suffix themselves, so the
   * template would have rendered "Today — Solarity — Solarity" on every one of
   * them. The convention is consistent, just consistent by hand.
   *
   * Worth doing properly one day — strip the suffix from all twenty-five and
   * let the template own it — but it is twenty-five files of churn for a
   * result nobody can see, and the failure mode if one is missed is a title
   * that reads wrong on a screen nobody looks at twice.
   */
  title: "Solarity",
  description:
    "Friends who see each other's progress toward their goals motivate each other to keep going.",

  /**
   * **What a link to Solarity looks like when somebody pastes it.** An invite
   * is shared in a message, and without these it unfurls as a bare URL — which
   * is the least trustworthy thing a link can look like on the one route where
   * the recipient has no account yet and every reason to be cautious.
   *
   * `/icon.svg` rather than a dedicated OG image: a 512 square is not the 1.91:1
   * most previews want, so it renders as a small square card rather than a
   * banner. That is the honest version of what exists — a real OG image is
   * artwork, not metadata, and belongs to whoever does the marketing pass.
   */
  openGraph: {
    type: "website",
    siteName: "Solarity",
    title: "Solarity",
    description:
      "Friends who see each other's progress toward their goals motivate each other to keep going.",
    images: ["/icon.svg"],
  },
  twitter: {
    card: "summary",
    title: "Solarity",
    description:
      "Friends who see each other's progress toward their goals motivate each other to keep going.",
  },

  // iOS ignores the manifest for standalone display and reads these instead.
  // Without them "Add to Home Screen" yields a browser-chrome window, and push
  // fires only for the installed case.
  appleWebApp: {
    capable: true,
    title: "Solarity",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  /**
   * `--ds-abyss`. **It was `#0b0b12`, a value in no palette** — near-black with
   * a violet cast where the abyss is blue-grey. It predates the design system
   * and nothing reconciled it, which is easy to miss in a diff and plain on a
   * phone: this colour is the status bar of an installed app, sitting directly
   * above `.ds-app`'s background all day.
   *
   * Inlined rather than read from the token, because `viewport` is evaluated on
   * the server before any stylesheet exists. `app/manifest.ts` carries the same
   * two copies for the same reason.
   */
  themeColor: "#0f1620",
  // Stops iOS zooming on input focus, which makes an installed PWA feel like a
  // web page.
  maximumScale: 1,
  viewportFit: "cover",
};

/**
 * **`async` and reading `headers()` since step 12**, which makes every route
 * dynamic. That costs nothing here and would elsewhere: every page in this app
 * already calls `createClient()` and reads cookies, so nothing was statically
 * rendered to begin with. Worth re-checking if a genuinely static page is ever
 * added — the answer would then be to hash the inline script instead.
 *
 * `?? undefined` rather than `?? ""`: an empty string is a *valid* nonce
 * attribute and would be silently rejected, which looks identical to the script
 * simply not running. Omitting the attribute at least fails loudly in the
 * console. The value is absent only on paths the proxy does not match, and none
 * of those render this layout.
 */
export default async function RootLayout({ children }: LayoutProps<"/">) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}
    >
      <head>
        {/* Before hydration on purpose: `beforeinstallprompt` fires early, once,
            and the event object is the only route to the install dialog. A
            listener added from an effect would miss it on a slow connection.
            See lib/install-prompt.ts. */}
        <script
          nonce={nonce}
          dangerouslySetInnerHTML={{ __html: INSTALL_PROMPT_SCRIPT }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <ServiceWorkerRegistrar />
      </body>
    </html>
  );
}

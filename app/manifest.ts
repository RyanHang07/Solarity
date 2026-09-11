import type { MetadataRoute } from "next"

/**
 * Served at /manifest.webmanifest. Generated natively by Next.js.
 *
 * Installability is not cosmetic: iOS delivers push only to an installed PWA,
 * and `display: standalone` is the part it checks. See architecture/
 * section 7b.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Solarity",
    short_name: "Solarity",
    description:
      "Friends who see each other's progress toward their goals motivate each other to keep going.",
    /**
     * Step 20i. **The installed app opens the app, not the marketing page.**
     *
     * This was `/` while `/` was a placeholder that bounced signed-in visitors
     * onward — harmless. With a real landing page there, every cold launch from
     * the home screen would flash the hero and then redirect, on the screen
     * somebody opens every morning.
     *
     * Signed out, `/dashboard` already redirects to `/auth/sign-in`, so the
     * signed-out case needs no second rule.
     */
    start_url: "/dashboard",

    /**
     * **Unchanged, and this is the trap in the other direction.**
     *
     * Narrowing scope to `/dashboard` would put `/privacy`, `/terms`,
     * `/support` and — worst — `/join/<token>` *outside* the installed window.
     * On iOS a URL outside scope opens in Safari, so an invite tapped inside
     * the app would land in a browser where that person is not signed in.
     *
     * Scope stays `/` precisely so the public pages remain part of the app.
     */
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    /**
     * **`--ds-abyss`, and it used to be `#0b0b12`, which is in no palette.**
     *
     * That value predates the design system and nothing ever reconciled it. It
     * reads as near-black with a violet cast; the abyss is blue-grey. The
     * difference is invisible side by side in a diff and obvious on a phone,
     * because these two are the *first* thing an installed app shows: Android
     * paints `background_color` for the whole splash before a single pixel of
     * the app renders, and `theme_color` sits behind the status bar for as long
     * as the app is open.
     *
     * So a launch went violet-black, then blue-grey, every time. Copied rather
     * than imported for the reason the icons are: a manifest is JSON at the
     * edge of the app and no CSS variable reaches it.
     */
    background_color: "#0f1620",
    theme_color: "#0f1620",
    icons: [
      {
        /**
         * **Listed first and without `sizes`, on purpose.** A browser that
         * understands SVG takes this and is done at any density; one that does
         * not skips an unknown type and falls through to the PNGs below. That
         * ordering is the whole mechanism — `sizes: "any"` on an SVG is what
         * makes some Android versions rasterise it once at the wrong density.
         */
        src: "/icons/icon.svg",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        // Artwork sits inside the centre 80% so Android can crop to any shape.
        // Drawn at scale(3.2) where the others use scale(4) — see
        // `public/icons/icon-maskable.svg`.
        src: "/icons/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  }
}

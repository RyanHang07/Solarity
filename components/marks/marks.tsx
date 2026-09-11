"use client"

import { useId, useSyncExternalStore } from "react"

/**
 * Does the OS want less motion?
 *
 * **`useSyncExternalStore`, not `useState` in an effect.** The first version
 * set state from inside the effect that subscribed, which schedules a second
 * render purely to record something the first render could already have asked
 * — the `react-hooks/set-state-in-effect` rule is right about it. A media query
 * is an external store with a subscribe and a snapshot, which is exactly the
 * shape this hook exists for.
 *
 * `getServerSnapshot` is `false`: there is no media query on a server, and
 * guessing `true` renders a still mark the client immediately animates.
 */
const MOTION = "(prefers-reduced-motion: reduce)"

const subscribeToMotion = (onChange: () => void) => {
  const query = window.matchMedia(MOTION)
  query.addEventListener("change", onChange)
  return () => query.removeEventListener("change", onChange)
}
const readMotion = () => window.matchMedia(MOTION).matches
const motionOnServer = () => false

/* ------------------------------------------------------------------ *
 * Marks — the brand's small glyphs.
 *
 * Every one of these is the hero scene reduced far enough to sit inline with
 * type. That is the whole rule: a mark that could belong to another product is
 * decoration, and decoration is what the first landing page had too much of.
 *
 *   SunMark      the sun, as rays          — A1
 *   OrbitMark    the scene at 26px         — A2
 *   ClusterMark  three suns, a circle      — A5
 *   BracketedRule  [ ✳ ○ ✳ ] as a divider  — B1
 *   OrbitCorner  an orbit arc as a corner  — C2
 *   PhaseMark    crescent → full, on done  — A4
 *
 * **All of them draw with `currentColor` unless told otherwise**, so a mark
 * inherits the colour of the text it sits beside and the palette stays the one
 * in `design-system.css`. Nothing here hardcodes a hex.
 * ------------------------------------------------------------------ */

/** Eight tapered rays. The petal is one path, rotated — see `ClusterMark`. */
const RAY = "M0,-6 C3,-14 4,-24 0,-34 C-4,-24 -3,-14 0,-6 Z"

const rays = (count: number) =>
  Array.from({ length: count }, (_, i) => (i * 360) / count)

export type MarkProps = {
  size?: number
  className?: string
  /** Defaults to `currentColor`. */
  color?: string
}

/**
 * A1 — the sun.
 *
 * **Eight rays and a hollow centre.** The hollow is doing real work: a solid
 * disc at 14px is a bullet point, and the ring is what keeps it reading as the
 * same object the hero draws.
 */
export const SunMark = ({ size = 16, className = "", color }: MarkProps) => (
  <svg
    viewBox="-40 -40 80 80"
    width={size}
    height={size}
    className={className}
    aria-hidden
    focusable="false"
    style={{ color }}
  >
    <g fill="currentColor">
      {rays(8).map((angle) => (
        <path key={angle} d={RAY} transform={`rotate(${angle})`} />
      ))}
    </g>
    <circle r="5.5" fill="var(--ds-abyss)" stroke="currentColor" strokeWidth="2" />
  </svg>
)

/**
 * A2 — the scene, at 26 pixels.
 *
 * **The only mark here nobody else could own.** Two dotted orbits, a lit
 * planet on the outer one and a spent one on the inner: the product's entire
 * metaphor, small enough to sit in a label.
 *
 * `strokeDasharray` rather than drawn dots, for the same reason the scene uses
 * points rather than lines — but inverted. At this size real dots would be
 * subpixel and disappear; a dash pattern survives the rounding.
 */
export const OrbitMark = ({ size = 20, className = "", color }: MarkProps) => (
  <svg
    viewBox="-36 -36 72 72"
    width={size}
    height={size}
    className={className}
    aria-hidden
    focusable="false"
    style={{ color }}
  >
    <g fill="none" stroke="currentColor">
      <circle r="30" strokeOpacity="0.5" strokeWidth="2" strokeDasharray="2 7" />
      <circle r="17" strokeOpacity="0.72" strokeWidth="2" strokeDasharray="2 6" />
    </g>
    <circle r="7" fill="currentColor" />
    <circle cx="30" cy="0" r="4" fill="currentColor" />
    <circle cx="-12" cy="12" r="3" fill="currentColor" fillOpacity="0.45" />
  </svg>
)

/**
 * A5 — three suns.
 *
 * The reference's trio, and the one mark that is purely typographic: it sets
 * beside a line of copy the way an asterism does, which is why the centre one
 * is a shade larger. Three identical marks read as a loading state.
 */
export const ClusterMark = ({ size = 44, className = "", color }: MarkProps) => (
  <svg
    viewBox="-60 -24 120 48"
    width={size}
    height={(size * 48) / 120}
    className={className}
    aria-hidden
    focusable="false"
    style={{ color }}
  >
    <g fill="currentColor">
      {[
        { x: -34, s: 0.44 },
        { x: 0, s: 0.52 },
        { x: 34, s: 0.44 },
      ].map((item) => (
        <g key={item.x} transform={`translate(${item.x},0) scale(${item.s})`}>
          {rays(6).map((angle) => (
            <path key={angle} d={RAY} transform={`rotate(${angle})`} />
          ))}
        </g>
      ))}
    </g>
  </svg>
)

/**
 * B1 — the bracketed divider.
 *
 * **Use it once.** A framed `✳ ○ ✳` is a wordmark's cousin and it reads as
 * ceremony; twice on a page it reads as a component, and a HUD is what the
 * corner brackets already risk. It belongs at a genuine break — between the
 * argument and the close.
 */
export const BracketedRule = ({
  className = "",
  label,
}: {
  className?: string
  /** Optional text inside the frame, replacing the ring. */
  label?: string
}) => (
  <div
    className={`ds-bracket ${className}`}
    data-ds="ds-bracket"
    aria-hidden={label ? undefined : true}
    role={label ? "separator" : undefined}
  >
    <SunMark size={13} />
    {label ? (
      <span className="ds-font-mono text-[10px] uppercase tracking-[0.24em]">
        {label}
      </span>
    ) : (
      <span className="ds-bracket-ring" />
    )}
    <SunMark size={13} />
  </div>
)

/**
 * C2 — an orbit arc, as a corner.
 *
 * **The corner bracket, but curved**, so the layout's edges are made of the
 * same shape the hero draws rather than borrowed from an instrument panel.
 * Two arcs: a solid inner one carrying the accent, and a dotted outer one that
 * is literally an orbit path — with a planet where it leaves the frame.
 *
 * Absolutely positioned by `data-corner`, exactly like `ds-corner`, so the two
 * are interchangeable at a call site.
 */
export const OrbitCorner = ({
  at = "tl",
  size = 72,
  inset = false,
  className = "",
}: {
  at?: "tl" | "tr" | "br" | "bl"
  size?: number
  /** Sit on the gutter line rather than the true edge. See `Corners`. */
  inset?: boolean
  className?: string
}) => (
  <svg
    viewBox="0 0 100 100"
    width={size}
    height={size}
    className={`ds-orbit-corner ${className}`}
    data-ds="ds-orbit-corner"
    data-corner={at}
    data-inset={inset ? "" : undefined}
    aria-hidden
    focusable="false"
  >
    {/*
      **Everything is pulled 5 units off the viewBox edge**, because a stroke
      is centred on its path: an arc ending at `y = 0` has half its width
      outside the box and gets clipped to a flat top. The planet at the end is
      worse — a circle of r=3 at the boundary loses half of itself, which is
      exactly the crop that showed on desktop.

      The old geometry ran corner-to-corner at radius 78 and 94; this runs 73
      and 89 from an origin 5 in, so the shape is identical and nothing touches
      an edge.
    */}
    <path
      d="M5,78 A73,73 0 0 1 78,5"
      fill="none"
      stroke="var(--ds-burning-flame)"
      strokeOpacity="0.85"
      strokeWidth="1.6"
    />
    <path
      d="M5,94 A89,89 0 0 1 94,5"
      fill="none"
      stroke="var(--ds-oatmeal)"
      strokeOpacity="0.45"
      strokeWidth="1.4"
      strokeDasharray="1.6 6"
    />
    <circle cx="78" cy="5" r="3" fill="var(--ds-burning-flame)" />
  </svg>
)

/**
 * A4 — the phase mark.
 *
 * **A goal's day, drawn as an eclipse that clears.** Unchecked is a crescent:
 * the shadow disc sits almost over the sun. Checked, the shadow slides off and
 * the sun completes — which is the same gesture the scene makes when a planet
 * lights, at the size of a checkbox.
 *
 * ## Why the shadow moves rather than the sun growing
 *
 * A disc scaling up reads as *appearing*, and nothing appears here — the goal
 * was always there, and what changed is whether it is done. Something moving
 * out of the way is the honest animation for that, and it is also the one that
 * survives being interrupted: the shadow can be anywhere on the path and the
 * mark still means something.
 *
 * The shadow is filled with the page colour rather than being a mask, so the
 * mark composites correctly on any surface it is placed on.
 */
export const PhaseMark = ({
  done = false,
  size = 22,
  className = "",
  color,
}: MarkProps & { done?: boolean }) => {
  const reduced = useSyncExternalStore(
    subscribeToMotion,
    readMotion,
    motionOnServer,
  )
  const clipId = `${useId()}-phase`

  return (
    <svg
      viewBox="-32 -32 64 64"
      width={size}
      height={size}
      className={className}
      aria-hidden
      focusable="false"
      style={{ color }}
    >
      {/*
        **The shadow is clipped to the sun, and that is a correctness fix
        rather than a tidy-up.**

        The shadow disc is bigger than the sun and slides *past* it, so most of
        its area sits outside the silhouette. It was invisible only because it
        was painted the same colour as the surface behind it — camouflage, not
        geometry. Anything that touched the whole element broke the illusion:
        the hover `filter: brightness()` lightened the shadow along with the
        sun and drew a pale disc hanging off the edge, cropped square by the
        viewBox.

        Clipping means the shadow can only ever exist *on* the sun. The mark is
        then immune to filters, opacity, and whatever surface it is dropped on.
      */}
      <clipPath id={clipId}>
        <circle r="24" />
      </clipPath>

      <circle r="24" fill="currentColor" />
      {/*
        **`cx` and `r` transition, not `transform`.** A transform on the shadow
        would scale its edge softness with it; animating the geometry keeps the
        terminator the same crispness from crescent to gone.

        **The shadow takes its colour from the surface it is drawn on**, via
        `--ds-phase-shadow`. It is not a dark disc — it is the *absence* of the
        sun, so on the abyss it must be abyss and on the proof band it must be
        Blue Fantastic.
      */}
      <circle
        cx={done ? 46 : 11}
        cy={done ? -30 : -7}
        r={done ? 20 : 21.5}
        fill="var(--ds-phase-shadow, var(--ds-abyss))"
        clipPath={`url(#${clipId})`}
        style={{
          transition: reduced
            ? "none"
            : "cx 620ms cubic-bezier(0.22,1,0.36,1), cy 620ms cubic-bezier(0.22,1,0.36,1), r 620ms ease",
        }}
      />
      {/* The rim survives the shadow leaving, so the mark keeps its silhouette
          at every point in the transition. */}
      <circle
        r="24"
        fill="none"
        stroke="currentColor"
        strokeOpacity={done ? 0.55 : 0.3}
        strokeWidth="1.5"
        style={{ transition: reduced ? "none" : "stroke-opacity 620ms ease" }}
      />
    </svg>
  )
}

export type PhaseItem = {
  id: string
  /** Who or what this is. Read out by a screen reader; never drawn. */
  label: string
  done: boolean
}

export type PhaseRowProps = {
  items: readonly PhaseItem[]
  /**
   * Toggling one. Omit for a read-only row — the marks then render as
   * `<span>`s rather than buttons, which is the honest markup for a display
   * that cannot be operated.
   */
  onToggle?: (id: string) => void
  size?: number
  className?: string
}

/**
 * A circle's day, as a row of phases.
 *
 * **One row, `flex-nowrap`, because a wrapped phase row is a different
 * sentence.** Four marks reading left to right are one circle's day; two above
 * two are a grid of unrelated things. If the row will not fit, the marks get
 * smaller — the caller sets `size` — rather than the line breaking.
 *
 * **This is what "3 of 4" looks like when it is a picture rather than a
 * sentence.** Three suns clear, one still eclipsed — the same fact the heading
 * states, in the same object the hero draws, at a size that fits beside it.
 *
 * ## Why it is one component and not four marks in a `<div>`
 *
 * The row is the reusable thing. A Circle's Today tab wants it over members; a
 * goal list wants it over goals; the landing page wants it over a fabricated
 * four. All three need the same keyboard behaviour, the same labelling, and the
 * same decision about whether a mark is pressable — and a caller assembling
 * that by hand gets one of them wrong.
 *
 * **The labels are `sr-only`, not tooltips.** The marks are legible as a group
 * and meaningless individually to anyone who cannot see them, so the name has
 * to be in the accessible name of the control rather than hidden behind a
 * hover a keyboard cannot produce.
 */
export const PhaseRow = ({
  items,
  onToggle,
  size = 44,
  className = "",
}: PhaseRowProps) => (
  <ul className={`flex flex-nowrap items-center gap-4 ${className}`}>
    {items.map((item) => (
      <li key={item.id}>
        {onToggle ? (
          <button
            type="button"
            className="ds-phase pointer-events-auto"
            data-ds="ds-phase"
            aria-pressed={item.done}
            onClick={() => onToggle(item.id)}
          >
            <PhaseMark done={item.done} size={size} />
            <span className="sr-only">
              {item.label} — {item.done ? "checked in" : "not yet"}
            </span>
          </button>
        ) : (
          <span className="ds-phase" data-ds="ds-phase">
            <PhaseMark done={item.done} size={size} />
            <span className="sr-only">
              {item.label} — {item.done ? "checked in" : "not yet"}
            </span>
          </span>
        )}
      </li>
    ))}
  </ul>
)

/* ------------------------------------------------------------------ *
 * Section icons.
 *
 * ## Heroicons for four, the logo for one
 *
 * The first attempt drew all five in the celestial vocabulary — a sun with
 * orbits for Overview, a planet on an arc for Goals, three suns for Circles, a
 * lone sun for Profile. Coherent on the specimen wall and wrong in a tab bar:
 * four glyphs made of circles, at 21px, under a thumb, are four variations of
 * "dot". A nav icon's whole job is to be told apart at a glance, and a family
 * that shares one primitive cannot do it.
 *
 * So the four navigational sections use **Heroicons v2 outline** — flag,
 * user-group, bell, user-circle. They are the shapes people already read
 * without thinking, which is exactly what furniture should be. Paths are
 * inlined rather than pulled from `@heroicons/react` (MIT): five icons is not
 * worth a dependency, and inlining keeps the mock installable from a clean
 * checkout.
 *
 * ## Overview is the logo, and it is the one that should stand out
 *
 * Overview is home. The centre tab under the thumb, the place the app opens
 * to — so it is the `SunMark` itself, drawn larger than its neighbours. That
 * asymmetry is the point: one tab is the brand and four are directions, and a
 * bar where every icon has equal weight makes you read all five to find the
 * one you want.
 * ------------------------------------------------------------------ */

export type SectionIconProps = { size?: number; className?: string }

/** Heroicons v2, 24px outline: same stroke weight, cap and join as upstream. */
const strokeIcon = (size: number, className: string) => ({
  viewBox: "0 0 24 24",
  width: size,
  height: size,
  className,
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true as const,
  focusable: "false" as const,
})

/** Heroicons `flag`. A goal is a thing you are heading for. */
export const GoalsIcon = ({ size = 22, className = "" }: SectionIconProps) => (
  <svg {...strokeIcon(size, className)}>
    <path d="M3 3v1.5M3 21v-6m0 0 2.77-.693a9 9 0 0 1 6.208.682l.108.054a9 9 0 0 0 6.086.71l3.114-.732a48.524 48.524 0 0 1-.005-10.499l-3.11.732a9 9 0 0 1-6.085-.711l-.108-.054a9 9 0 0 0-6.208-.682L3 4.5M3 15V4.5" />
  </svg>
)

/** Heroicons `user-group`. */
export const CirclesIcon = ({ size = 22, className = "" }: SectionIconProps) => (
  <svg {...strokeIcon(size, className)}>
    <path d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
  </svg>
)

/** Heroicons `bell`. */
export const BellIcon = ({ size = 22, className = "" }: SectionIconProps) => (
  <svg {...strokeIcon(size, className)}>
    <path d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
  </svg>
)

/**
 * Heroicons `cog-6-tooth`.
 *
 * Replaces the `⚙` character, which was a *glyph* — it inherited the body
 * font's metrics, sat on the text baseline rather than centring, and rendered
 * differently on every platform. A settings control that is a different shape
 * on Android than on iOS is one people have to re-find.
 */
export const SettingsIcon = ({ size = 22, className = "" }: SectionIconProps) => (
  <svg {...strokeIcon(size, className)}>
    <path d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
    <path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  </svg>
)

/** Heroicons `user-circle`. */
export const ProfileIcon = ({ size = 22, className = "" }: SectionIconProps) => (
  <svg {...strokeIcon(size, className)}>
    <path d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  </svg>
)

/**
 * Overview — `SunMark` itself, at home size.
 *
 * **The same glyph as the wordmark, not a second sun that resembles it.**
 *
 * An earlier version drew its own sixteen-ray star for this tab: close to the
 * mark in the navbar, identical to nothing. Two suns a few pixels apart is
 * worse than one sun or none — a brand mark earns its recognition by being the
 * same shape every time, and a near-copy spends that recognition without
 * adding anything.
 *
 * So Overview *is* `SunMark`, drawn larger than its four Heroicon neighbours.
 * It is home, the centre tab under the thumb, and the brand; a bar where every
 * icon has equal weight makes you read all five to find the one you want.
 *
 * The core is `--ds-abyss` with a stroked rim, which is what makes it read as
 * a sun rather than a blob at small sizes — and it means the tab inherits the
 * page it sits on, exactly as the wordmark does.
 */
export const OverviewIcon = ({ size = 30, className = "" }: SectionIconProps) => (
  <SunMark size={size} className={className} />
)

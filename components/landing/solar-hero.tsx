"use client"

import { useEffect, useRef } from "react"

/* ------------------------------------------------------------------ *
 * Solarity hero — a draggable sun with orbiting rings.
 *
 * The scene is the product metaphor, not decoration
 * (see solarity/docs/product-and-design.md §5):
 *
 *   Sun    → you
 *   Ring   → one active goal
 *   Planet → that goal's state today (lit = checked in)
 *   Star   → permanent progress from goals already achieved
 *
 * Everything tunable lives in SCENE below. Change numbers there;
 * the build functions read from it and nothing else hardcodes.
 *
 * ## What makes this read as a body rather than a diagram
 *
 * Three decisions, and they are the whole difference:
 *
 * 1. **The sun is a real light and the planets are really lit.** Every body
 *    used to be `MeshBasicMaterial` — unlit, flat, the same brightness on the
 *    side facing the sun as on the side facing away. A `PointLight` at the
 *    origin and `MeshStandardMaterial` on the planets gives each one a genuine
 *    terminator, so a planet passing behind the sun goes to a crescent on its
 *    own. One light and four meshes: the cost is nothing and it is the single
 *    biggest change to how the scene reads.
 *
 * 2. **Glow is a sprite, not a shell.** The old bloom was three back-facing
 *    icosahedrons at increasing radius, which produces a hard-edged disc
 *    because a sphere's silhouette is a circle with a definite edge. A radial
 *    gradient on a camera-facing sprite has no edge at all, which is what
 *    light actually looks like.
 *
 * 3. **No postprocessing.** A real bloom pass means an `EffectComposer`, two
 *    extra render targets and a blur at device pixel ratio — 2 to 3ms a frame
 *    on a phone, for an effect the sprite approximates at roughly zero. This
 *    is a landing page that has to open fast on the device most people will
 *    first see it on.
 * ------------------------------------------------------------------ */

/** Design-system palette, as Three.js hex ints. Mirrors app/design-system.css. */
const PALETTE = {
  flame: 0xffb162,
  truffle: 0xa35139,
  oatmeal: 0xc9c1b1,
  palladian: 0xeee9df,
} as const

export type SceneConfig = {
  /** Sun core radius in world units. Everything else scales off this. */
  sunRadius: number
  /**
   * The soft light around the core, as a multiple of `sunRadius`.
   *
   * One camera-facing sprite with a radial-gradient texture. See the header
   * for why this replaced stacked back-facing shells.
   */
  sunGlowScale: number
  /** Loose particles forming the corona. */
  coronaCount: number
  coronaSpread: number
  /**
   * How far the light reaches, and how hard it falls off.
   *
   * `decay: 2` is physically correct inverse-square and looks wrong here —
   * the outer rings go black. Softer decay is a lie that reads as truth,
   * which is the usual trade in a scene lit by one lamp.
   */
  light: { intensity: number; distance: number; decay: number }
  /** One entry per ring. `tilt` is radians off the ecliptic. */
  rings: ReadonlyArray<{
    radius: number
    tilt: number
    /** Dots drawn along the orbit path. */
    dots: number
    dotSize: number
    opacity: number
    color: number
    /** Radians per second. Negative reverses direction. */
    speed: number
    /** Where the planet starts, in radians. */
    phase: number
    planetRadius: number
    planetColor: number
    /** Lit planets glow — the "checked in today" state. */
    lit: boolean
    /** Arbitrary goal shown on hover / tap. Landing copy only. */
    goal: string
  }>
  /** Background achievement stars. */
  starCount: number
  starInner: number
  starOuter: number
  starSize: number
  /** Idle rotation, radians per second. */
  autoSpin: number
  /** How fast drag momentum decays. Lower = more slippery. */
  damping: number
  /** Vertical tilt clamp so the scene never flips upside down. */
  maxPitch: number
  camera: { fov: number; distance: number; height: number }
  /**
   * Where the sun sits in the frame, in viewport-relative units.
   *
   * **This is the composition, and it is why the hero stops looking like a
   * diagram.** `0` centres it. Pushing it right and letting the rings run off
   * the edge is what makes the viewer feel *near* something rather than
   * presented with it — the reference this was drawn from crops its planet by
   * about a third.
   */
  offset: { x: number; y: number }
}

/* ------------------------------------------------------------------ *
 * Scale, and the one number everything else is a ratio of.
 *
 * **The sun is 3.9 against a visible half-height of about 5.3**, so its disc
 * is 73% of the frame's height and about 41% of a 16:9 desktop's width.
 * Offset right, the far limb leaves the viewport. That crop is the whole
 * effect: a body you are near, not a diagram you are shown.
 *
 * **These numbers were computed against the frustum, not guessed.** The first
 * attempt used a sun of 3.2 and an offset of 0.42, which arithmetic said would
 * put a 34%-of-width disc at 92% across — a small sun hiding at the edge
 * rather than a large one cropped by it. `tan(fov/2) × distance` is one line
 * and it settles this before anything is rendered. The second attempt went to
 * 4.4 and read *too* big at 82% of the frame's height; 3.9 is that correction,
 * and it is a computed 12% rather than a nudge because the same line says what
 * 12% buys.
 *
 * **The rings are deliberately tight**, 1.26× to 2.05× the sun's radius rather
 * than the 2.6× to 6.6× they were. Two things follow, and the second is the
 * reason:
 *
 *   * the outer ring stops leaving the frame vertically on a phone, which is
 *     what made the old scene collapse to a dot at 390px wide
 *   * the planets stay *near* the sun, so they read as belonging to it. Wide
 *     orbits put them in empty sky where they look like unrelated dots
 *
 * Ratios, so changing `sunRadius` alone rescales the whole system coherently.
 * ------------------------------------------------------------------ */
const SUN = 3.9

export const SCENE: SceneConfig = {
  sunRadius: SUN,
  /**
   * **2.6, down from 7.5, because it multiplies a radius that nearly
   * quadrupled.** Left alone the glow sprite would be 33 units across against
   * a half-width of 9.5 and wash the entire frame flat — the failure mode of
   * every bloom that is tuned once and then inherited by a bigger object.
   */
  sunGlowScale: 2.6,
  coronaCount: 420,
  coronaSpread: SUN * 1.18,

  light: { intensity: 42, distance: 34, decay: 1.35 },

  rings: [
    {
      radius: SUN * 1.26,
      tilt: 0.0,
      dots: 190,
      dotSize: 0.05,
      opacity: 0.55,
      color: PALETTE.oatmeal,
      speed: 0.2,
      phase: 0.4,
      planetRadius: SUN * 0.09,
      planetColor: PALETTE.flame,
      lit: true,
      goal: "Morning run",
    },
    {
      radius: SUN * 1.52,
      tilt: 0.22,
      dots: 240,
      dotSize: 0.045,
      opacity: 0.4,
      color: PALETTE.oatmeal,
      speed: -0.13,
      phase: 2.1,
      planetRadius: SUN * 0.11,
      planetColor: PALETTE.palladian,
      lit: true,
      goal: "Read twenty pages",
    },
    {
      radius: SUN * 1.78,
      tilt: -0.16,
      dots: 300,
      dotSize: 0.042,
      opacity: 0.3,
      color: PALETTE.oatmeal,
      speed: 0.095,
      phase: 4.2,
      planetRadius: SUN * 0.075,
      planetColor: PALETTE.truffle,
      lit: false,
      goal: "No sugar today",
    },
    {
      radius: SUN * 2.05,
      tilt: 0.34,
      dots: 360,
      dotSize: 0.038,
      opacity: 0.22,
      color: PALETTE.oatmeal,
      speed: -0.065,
      phase: 5.6,
      planetRadius: SUN * 0.058,
      planetColor: PALETTE.oatmeal,
      lit: false,
      goal: "Write for thirty minutes",
    },
  ],

  starCount: 900,
  /** Clear of the outer ring at 9.0, so no star ever sits inside the system. */
  starInner: 13,
  starOuter: 48,
  starSize: 0.11,

  autoSpin: 0.028,
  damping: 0.94,
  maxPitch: 0.62,
  camera: { fov: 38, distance: 15.5, height: 3.1 },

  /**
   * **Far right and slightly high**, so the core sits near the outer third and
   * leaves the frame. The copy lives on the left, over the part of the sky the
   * light has not reached — which is what the scrim's left-to-right gradient
   * is shaped around.
   */
  offset: { x: 0.35, y: -0.05 },
}

/**
 * The phone build.
 *
 * **Fewer particles, fewer dots, and a tighter camera** — but the same four
 * rings, because dropping one changes what the picture *says*. The costs that
 * matter on a phone are fill rate and point count, not object count.
 *
 * Centred rather than offset: at 390px wide there is no room for a subject on
 * one side and type on the other, so the composition stacks instead.
 */
export const COMPACT_SCENE: SceneConfig = {
  ...SCENE,
  coronaCount: 180,
  /**
   * **Smaller than the desktop's, not larger**, which is the opposite of what
   * it was. A portrait viewport is narrow, so a glow measured in world units
   * covers far more of it: at 2.6 the skirt spanned 205% of a 390px screen and
   * turned the whole hero into an orange wash. 2.0 keeps the halo inside the
   * frame it is lighting.
   */
  sunGlowScale: 2,
  rings: SCENE.rings.map((ring) => ({
    ...ring,
    dots: Math.round(ring.dots * 0.55),
  })),
  starCount: 380,
  /**
   * **Pulled back, not scaled down.** Shrinking the sun for a small screen is
   * the instinct and it is wrong: the subject would end up the same apparent
   * size as the body copy and the composition would have no focus at all.
   * Moving the camera keeps the sun dominant and simply fits more of the
   * outer ring, which is the version that survives a 390px viewport.
   */
  camera: { fov: 44, distance: 22, height: 2.4 },
  /**
   * **High and barely off-centre.** The phone layout stacks — sun above, copy
   * below, with a bottom-up scrim — so the crop moves from the right edge to
   * the bottom one and the sun keeps a whole side of clean sky.
   */
  offset: { x: 0.08, y: -0.2 },
}

export type SolarHeroProps = {
  /** Phone layout: fewer particles, centred composition. */
  compact?: boolean
  className?: string
  /** Override the scene entirely. Falls back to SCENE / COMPACT_SCENE. */
  config?: SceneConfig
}

export const SolarHero = ({
  compact = false,
  className = "",
  config,
}: SolarHeroProps) => {
  const hostRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    const scene = config ?? (compact ? COMPACT_SCENE : SCENE)
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches

    let disposed = false
    let cleanup: (() => void) | null = null

    const boot = async () => {
      const THREE = await import("three")
      if (disposed || !hostRef.current) return

      /* ---------------- renderer ---------------- */

      const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      })

      /**
       * **1.75 rather than 2, and it is a considered number.**
       *
       * Fill rate is the whole cost of this scene: additive sprites and a
       * thousand points, all of them overdrawing. Going from DPR 2 to 1.75
       * removes about a quarter of the pixels for a difference nobody can see
       * on a display where the type is already antialiased by the browser.
       */
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75))
      renderer.setSize(host.clientWidth, host.clientHeight, false)

      const canvas = renderer.domElement
      canvas.style.width = "100%"
      canvas.style.height = "100%"
      canvas.style.display = "block"
      canvas.style.touchAction = "none"
      canvas.style.cursor = "grab"
      canvas.setAttribute("aria-hidden", "true")

      /**
       * Goal label — HTML over the canvas so it can use the design-system
       * type tokens. Positioned from projected planet coords; pointer-events
       * off so it never steals the hit that owns it.
       *
       * **`nowrap` and a fixed transform**, so the box never reflows when a
       * planet rides the viewport edge — clipping used to look like the label
       * changing shape. Position is clamped to stay fully on-screen instead.
       */
      const label = document.createElement("div")
      label.className =
        "ds-panel ds-font-mono ds-text-primary pointer-events-none absolute z-10 px-2.5 py-1.5 text-[clamp(0.65rem,1.1vw,0.75rem)] uppercase tracking-[0.18em] whitespace-nowrap"
      label.style.background =
        "color-mix(in srgb, var(--ds-abyss) 82%, transparent)"
      label.style.opacity = "0"
      label.style.visibility = "hidden"
      label.style.transition = "opacity 280ms ease"
      label.setAttribute("aria-hidden", "true")
      label.dataset.ds = "ds-panel ds-font-mono ds-text-primary"

      host.style.position = "relative"
      host.replaceChildren(canvas, label)

      const world = new THREE.Scene()

      const camera = new THREE.PerspectiveCamera(
        scene.camera.fov,
        host.clientWidth / Math.max(host.clientHeight, 1),
        0.1,
        200,
      )
      camera.position.set(0, scene.camera.height, scene.camera.distance)
      camera.lookAt(0, 0, 0)

      /**
       * **The composition, applied to the projection rather than to the
       * scene.** Moving the objects would move them relative to each other and
       * to the light; shifting the camera's view offset slides the whole frame,
       * which is what a photographer does with a shift lens. The sun stays the
       * centre of its own system and stops being the centre of the picture.
       */
      const applyOffset = (w: number, h: number) => {
        if (scene.offset.x === 0 && scene.offset.y === 0) return
        camera.setViewOffset(
          w,
          h,
          -scene.offset.x * w,
          -scene.offset.y * h,
          w,
          h,
        )
      }

      /** Everything the user drags lives under this. */
      const system = new THREE.Group()
      world.add(system)

      /* ---------------- disposal bookkeeping ---------------- */

      const disposables: Array<{ dispose: () => void }> = []
      const track = <T extends { dispose: () => void }>(item: T): T => {
        disposables.push(item)
        return item
      }

      /**
       * A soft radial falloff, drawn once into a canvas and reused.
       *
       * **Four stops rather than two.** A linear ramp from opaque to
       * transparent reads as a disc with a blurry edge; light falls off far
       * faster near the source than a straight line does, so the extra stops
       * near the centre are what stop it looking like a sticker.
       */
      const radialTexture = (inner: string, outer: string) => {
        const size = 256
        const el = document.createElement("canvas")
        el.width = size
        el.height = size
        const ctx = el.getContext("2d")
        if (ctx) {
          const gradient = ctx.createRadialGradient(
            size / 2,
            size / 2,
            0,
            size / 2,
            size / 2,
            size / 2,
          )
          gradient.addColorStop(0, inner)
          gradient.addColorStop(0.18, inner)
          gradient.addColorStop(0.42, outer)
          gradient.addColorStop(1, "rgba(0,0,0,0)")
          ctx.fillStyle = gradient
          ctx.fillRect(0, 0, size, size)
        }
        const texture = new THREE.CanvasTexture(el)
        texture.colorSpace = THREE.SRGBColorSpace
        return track(texture)
      }

      /**
       * A bright band at a fixed fraction of the sprite's radius.
       *
       * **This is the lit limb**, and it is the detail that most sells scale.
       * A sphere lit from inside has a hard silhouette and nothing happening at
       * the edge; a real body has atmosphere there, and the eye reads a bright
       * rim as *size* more than as light. Sized so `peak` lands exactly on the
       * sun's silhouette.
       */
      /**
       * The limb, as a **hue ramp** rather than one colour fading in and out.
       *
       * ## Why a single colour could not blend
       *
       * The band was one white, varying only in alpha. Additive blending means
       * low-alpha white over orange is *still* white-ish — it lifts all three
       * channels equally — so the transition from disc to rim was a jump in
       * hue no amount of softening in alpha could hide. The edge read as white
       * paint on an orange ball.
       *
       * A star does not do that. It goes **orange → yellow → white** as it
       * approaches the limb, because you are looking through progressively less
       * atmosphere at progressively hotter gas. Ramping the colour across the
       * band gives the eye the intermediate hue it was missing, and the white
       * can then be narrower *and* dimmer while reading brighter.
       *
       * Stops are `[position, r, g, b, alpha]`, interpolated in RGB across 40
       * gradient stops — enough that no band edge is visible at the sizes this
       * renders at.
       */
      const rampTexture = (
        stops: ReadonlyArray<readonly [number, number, number, number, number]>,
      ) => {
        const size = 512
        const el = document.createElement("canvas")
        el.width = size
        el.height = size
        const ctx = el.getContext("2d")
        if (ctx) {
          const g = ctx.createRadialGradient(
            size / 2,
            size / 2,
            0,
            size / 2,
            size / 2,
            size / 2,
          )
          const steps = 40
          for (let i = 0; i <= steps; i += 1) {
            const t = i / steps
            let lo = stops[0]!
            let hi = stops[stops.length - 1]!
            for (let s = 0; s < stops.length - 1; s += 1) {
              if (t >= stops[s]![0] && t <= stops[s + 1]![0]) {
                lo = stops[s]!
                hi = stops[s + 1]!
                break
              }
            }
            const span = hi[0] - lo[0]
            const k = span === 0 ? 0 : (t - lo[0]) / span
            const mix = (a: number, b: number) => Math.round(a + (b - a) * k)
            const alpha = lo[4] + (hi[4] - lo[4]) * k
            g.addColorStop(
              t,
              `rgba(${mix(lo[1], hi[1])},${mix(lo[2], hi[2])},${mix(
                lo[3],
                hi[3],
              )},${alpha.toFixed(4)})`,
            )
          }
          ctx.fillStyle = g
          ctx.fillRect(0, 0, size, size)
        }
        const texture = new THREE.CanvasTexture(el)
        texture.colorSpace = THREE.SRGBColorSpace
        return track(texture)
      }

      /**
       * The sun's surface, drawn once into an equirectangular canvas.
       *
       * ## Why this exists
       *
       * At the old scale the sun was 34px across and a flat fill was honest —
       * there was nothing to resolve. At 46% of the viewport it is the largest
       * object on the page and a single colour reads as a **hole**, not a star:
       * the eye expects detail at that size and finds none.
       *
       * ## Blobs rather than noise
       *
       * Per-pixel value noise is the obvious choice and looks like static.
       * Granulation on a real star is cells — soft-edged, varied in size,
       * clustered — which is what overlapping radial gradients give for far
       * less code and one draw.
       *
       * **Every blob is drawn three times**, at `x`, `x - width` and
       * `x + width`. A sphere's UVs wrap horizontally, so a blob near either
       * edge would otherwise be sliced in half and leave a visible seam running
       * pole to pole — the classic tell of a procedural planet.
       */
      const sunTexture = () => {
        const w = 1024
        const h = 512
        const el = document.createElement("canvas")
        el.width = w
        el.height = h
        const ctx = el.getContext("2d")
        if (!ctx) return track(new THREE.CanvasTexture(el))

        ctx.fillStyle = "#ffb162"
        ctx.fillRect(0, 0, w, h)

        const blob = (x: number, y: number, r: number, color: string) => {
          for (const wrapped of [x - w, x, x + w]) {
            const g = ctx.createRadialGradient(wrapped, y, 0, wrapped, y, r)
            g.addColorStop(0, color)
            g.addColorStop(1, "rgba(0,0,0,0)")
            ctx.fillStyle = g
            ctx.fillRect(wrapped - r, y - r, r * 2, r * 2)
          }
        }

        /**
         * **A hot equatorial band, and it is the neon move.**
         *
         * Neon light is saturated and *flat* — the tube is one brightness end
         * to end, and the drama is entirely at its edge. So the interior gets
         * one broad, soft lift toward white-yellow rather than surface detail,
         * which reads as a lamp instead of as a star photographed by a probe.
         */
        {
          /**
           * **The interior stays orange — the palette's orange — and only the
           * rim goes white.**
           *
           * The first neon pass lifted the middle to `rgba(255,236,190)`, very
           * nearly white, and the result was a bulb rather than a sun: nothing
           * left in the disc belonged to Solarity's colours. Burning Flame
           * `#FFB162` is the base, the equator lifts toward a *warm* cream that
           * is still unmistakably orange, and the poles fall to Truffle
           * `#96422C` — so both ends of the ramp are palette colours and the
           * body reads as lit rather than as blown out.
           */
          const g = ctx.createLinearGradient(0, 0, 0, h)
          g.addColorStop(0, "rgba(150,66,44,0.55)")
          g.addColorStop(0.2, "rgba(214,118,58,0.34)")
          g.addColorStop(0.44, "rgba(255,214,150,0.42)")
          g.addColorStop(0.56, "rgba(255,214,150,0.42)")
          g.addColorStop(0.8, "rgba(214,118,58,0.34)")
          g.addColorStop(1, "rgba(150,66,44,0.55)")
          ctx.fillStyle = g
          ctx.fillRect(0, 0, w, h)
        }

        /**
         * **A trace of structure, and deliberately less than before.**
         *
         * The first version had 260 cool lanes, 340 warm granules and seven
         * hard-edged sunspots — granulation photographed off a real star. It
         * was convincing and it was wrong for this brand: realism competes with
         * a scene whose planets are flat-shaded icosahedrons and whose orbits
         * are dotted lines. Roughly a third of the marks at half the strength,
         * and no spots at all, so the surface has *life* without claiming to be
         * a photograph.
         */
        for (let i = 0; i < 90; i += 1) {
          blob(
            Math.random() * w,
            Math.random() * h,
            30 + Math.random() * 70,
            "rgba(255,120,50,0.13)",
          )
        }
        for (let i = 0; i < 150; i += 1) {
          blob(
            Math.random() * w,
            Math.random() * h,
            14 + Math.random() * 40,
            "rgba(255,244,214,0.17)",
          )
        }

        const texture = new THREE.CanvasTexture(el)
        texture.colorSpace = THREE.SRGBColorSpace
        texture.wrapS = THREE.RepeatWrapping
        texture.anisotropy = renderer.capabilities.getMaxAnisotropy()
        return track(texture)
      }

      /* ---------------- the sun ---------------- */

      const sun = new THREE.Group()
      system.add(sun)

      /**
       * **A sphere rather than an icosahedron, and only because of the map.**
       * An icosahedron's UVs are per-face and seam badly; equirectangular
       * texturing needs the spherical parameterisation. 64 × 48 segments is
       * about 3,000 triangles for the single largest object on the page —
       * nothing, and it holds a silhouette at 46% of the viewport where a
       * low-poly ball would show facets on the limb.
       *
       * **The core is unlit, and that is correct rather than lazy.** It is the
       * light source: a lit material would shade it by its own lamp, which is
       * the one body in the scene that should carry its own brightness.
       */
      const coreGeo = track(new THREE.SphereGeometry(scene.sunRadius, 64, 48))
      const coreMat = track(
        new THREE.MeshBasicMaterial({ map: sunTexture() }),
      )
      sun.add(new THREE.Mesh(coreGeo, coreMat))

      /**
       * Luminescence, in three layers rather than one — and this is the part
       * that stands in for a bloom pass.
       *
       * A single wide gradient reads as fog. Real overexposure has a hard,
       * intense core that falls off almost immediately, *then* a wide faint
       * skirt — two different curves, which is exactly what a bloom shader
       * produces by blurring at two mip levels. Three additive sprites
       * approximate it for the cost of three quads:
       *
       * | Layer | Reaches | Does |
       * |---|---|---|
       * | rim | 1.2× radius | a bright band exactly on the silhouette |
       * | inner | 0.8× glow | the intense near-halo that reads as heat |
       * | outer | 1.3× glow | the wide skirt that lights the whole corner |
       *
       * All three are `depthTest: false`: this is light in the air between the
       * camera and the sun, so a ring passing in front must not clip it.
       */
      {
        /**
         * **The ramp's positions are fractions of the sprite's half-extent,
         * and the 2 is why they land where they do.**
         *
         * A sprite's `scale` is its *full* width in world units, so a sprite of
         * `sunRadius × rimScale` reaches `sunRadius × rimScale / 2` from its
         * centre. To put a stop on a sphere of radius `sunRadius`:
         *
         *     position = sunRadius ÷ (sunRadius × rimScale ÷ 2) = 2 ÷ rimScale
         *
         * At `rimScale: 2.4` that is **0.833**, which is why the white stop in
         * the ramp sits at 0.842 — just outside the silhouette, where a limb
         * actually is.
         *
         * An earlier version used `1 / rimScale` and would have put the bright
         * band at half the sun's radius: a glowing ring *inside* the disc,
         * reading as a bullseye rather than a limb. Caught by doing the
         * division rather than by looking, which is the only way to catch a
         * factor of two that still produces a plausible picture.
         */
        const rimScale = 2.4
        const rimMat = track(
          new THREE.SpriteMaterial({
            /**
             * **Orange → yellow → white → yellow → orange**, centred on the
             * silhouette at 0.833 of the sprite's half-extent.
             *
             * The white is now 0.55 alpha rather than 0.92 and only 0.02 wide,
             * with warm yellow either side of it and Burning Flame beyond that
             * fading to nothing. Less white, spread over more distance, reading
             * brighter — because the eye judges an edge by the *gradient* it
             * sits in, not by the peak value.
             */
            map: rampTexture([
              [0.0, 255, 177, 98, 0],
              [0.66, 255, 177, 98, 0],
              [0.74, 255, 186, 104, 0.14],
              [0.79, 255, 208, 132, 0.32],
              [0.823, 255, 236, 190, 0.5],
              [0.842, 255, 250, 232, 0.55],
              [0.876, 255, 214, 146, 0.3],
              [0.925, 255, 177, 98, 0.12],
              [1.0, 255, 150, 70, 0],
            ]),
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            depthTest: false,
          }),
        )
        const rim = new THREE.Sprite(rimMat)
        const rs = scene.sunRadius * rimScale
        rim.scale.set(rs, rs, 1)
        system.add(rim)

        const halo = (scale: number, inner: string, outer: string) => {
          const mat = track(
            new THREE.SpriteMaterial({
              map: radialTexture(inner, outer),
              transparent: true,
              blending: THREE.AdditiveBlending,
              depthWrite: false,
              depthTest: false,
            }),
          )
          const sprite = new THREE.Sprite(mat)
          const s = scene.sunRadius * scale
          sprite.scale.set(s, s, 1)
          // On the group rather than on `sun`, so the drag rotation cannot
          // rotate a billboard — which produces a visible shimmer.
          system.add(sprite)
        }

        // Saturated rather than warm-grey: a neon halo keeps its hue all the
        // way out, which is exactly what a photographic bloom does not do.
        halo(
          scene.sunGlowScale * 0.62,
          "rgba(255,196,120,0.62)",
          "rgba(255,150,70,0.36)",
        )
        halo(
          scene.sunGlowScale,
          "rgba(255,150,70,0.34)",
          "rgba(150,66,44,0.18)",
        )
      }

      /**
       * The light every planet is lit by.
       *
       * At the origin, inside the core, so a planet's terminator always points
       * at the sun no matter how the system is dragged.
       */
      const light = new THREE.PointLight(
        PALETTE.flame,
        scene.light.intensity,
        scene.light.distance,
        scene.light.decay,
      )
      system.add(light)

      /**
       * **A trace of fill, and it is 0.055.** With one lamp the night side of
       * every planet is pure black, which reads as a hole cut in the sky rather
       * than as a sphere. Just enough ambient to recover the silhouette.
       */
      world.add(new THREE.AmbientLight(PALETTE.palladian, 0.055))

      // Corona: loose particles in a shell around the core.
      {
        const positions = new Float32Array(scene.coronaCount * 3)
        for (let i = 0; i < scene.coronaCount; i += 1) {
          const r =
            scene.sunRadius * 1.2 +
            Math.random() * (scene.coronaSpread - scene.sunRadius * 1.2)
          const theta = Math.random() * Math.PI * 2
          const phi = Math.acos(2 * Math.random() - 1)
          positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
          positions[i * 3 + 1] = r * Math.cos(phi) * 0.55
          positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta)
        }
        const geo = track(new THREE.BufferGeometry())
        geo.setAttribute("position", new THREE.BufferAttribute(positions, 3))
        const mat = track(
          new THREE.PointsMaterial({
            color: PALETTE.flame,
            size: 0.05,
            transparent: true,
            opacity: 0.5,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            sizeAttenuation: true,
          }),
        )
        sun.add(new THREE.Points(geo, mat))
      }

      /* ---------------- rings and planets ---------------- */

      type Orbiter = {
        pivot: import("three").Group
        planet: import("three").Group
        /** Body mesh only — halo sprites must not inflate the hit area. */
        body: import("three").Mesh
        radius: number
        speed: number
        angle: number
        lit: boolean
        goal: string
      }

      const orbiters: Orbiter[] = []
      const planetMeshes: import("three").Mesh[] = []

      for (const ring of scene.rings) {
        const pivot = new THREE.Group()
        pivot.rotation.x = Math.PI / 2 + ring.tilt
        system.add(pivot)

        // Orbit path drawn as dots — reads better than a 1px line,
        // since WebGL ignores linewidth.
        const positions = new Float32Array(ring.dots * 3)
        for (let i = 0; i < ring.dots; i += 1) {
          const angle = (i / ring.dots) * Math.PI * 2
          positions[i * 3] = Math.cos(angle) * ring.radius
          positions[i * 3 + 1] = Math.sin(angle) * ring.radius
          positions[i * 3 + 2] = 0
        }
        const pathGeo = track(new THREE.BufferGeometry())
        pathGeo.setAttribute(
          "position",
          new THREE.BufferAttribute(positions, 3),
        )
        const pathMat = track(
          new THREE.PointsMaterial({
            color: ring.color,
            size: ring.dotSize,
            transparent: true,
            opacity: ring.opacity,
            depthWrite: false,
            sizeAttenuation: true,
          }),
        )
        pivot.add(new THREE.Points(pathGeo, pathMat))

        /**
         * The planet itself.
         *
         * **`MeshStandardMaterial`, so the sun actually shades it.** A low
         * roughness would give a specular hotspot that reads as plastic; near
         * 1 with a little metalness is closer to rock catching one light.
         */
        const planet = new THREE.Group()
        const bodyGeo = track(
          new THREE.IcosahedronGeometry(ring.planetRadius, 4),
        )
        const bodyMat = track(
          new THREE.MeshStandardMaterial({
            color: ring.planetColor,
            roughness: 0.82,
            metalness: 0.06,
            /**
             * **Only the checked-in ones emit.** This is the product rule
             * drawn rather than described: a lit planet is a goal you closed
             * today, so it carries its own light and the others only borrow
             * the sun's.
             */
            emissive: ring.lit ? ring.planetColor : 0x000000,
            emissiveIntensity: ring.lit ? 0.42 : 0,
          }),
        )
        const body = new THREE.Mesh(bodyGeo, bodyMat)
        body.userData.goal = ring.goal
        planet.add(body)

        if (ring.lit) {
          const haloMat = track(
            new THREE.SpriteMaterial({
              map: radialTexture(
                "rgba(255,177,98,0.55)",
                "rgba(255,177,98,0.12)",
              ),
              transparent: true,
              blending: THREE.AdditiveBlending,
              depthWrite: false,
            }),
          )
          const halo = new THREE.Sprite(haloMat)
          const s = ring.planetRadius * 7
          halo.scale.set(s, s, 1)
          planet.add(halo)
        }

        pivot.add(planet)

        orbiters.push({
          pivot,
          planet,
          body,
          radius: ring.radius,
          speed: ring.speed,
          angle: ring.phase,
          lit: ring.lit,
          goal: ring.goal,
        })
        planetMeshes.push(body)
      }

      /* ---------------- achievement stars ---------------- */

      {
        const positions = new Float32Array(scene.starCount * 3)
        for (let i = 0; i < scene.starCount; i += 1) {
          const r =
            scene.starInner +
            Math.random() * (scene.starOuter - scene.starInner)
          const theta = Math.random() * Math.PI * 2
          const phi = Math.acos(2 * Math.random() - 1)
          positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
          positions[i * 3 + 1] = r * Math.cos(phi)
          positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta)
        }
        const geo = track(new THREE.BufferGeometry())
        geo.setAttribute("position", new THREE.BufferAttribute(positions, 3))
        const mat = track(
          new THREE.PointsMaterial({
            color: PALETTE.palladian,
            size: scene.starSize,
            transparent: true,
            opacity: 0.6,
            depthWrite: false,
            sizeAttenuation: true,
          }),
        )
        /**
         * **In the world, not in the system.** Stars do not rotate with the
         * drag, so dragging produces parallax between them and the rings —
         * which is most of what sells the depth, and it costs nothing.
         */
        world.add(new THREE.Points(geo, mat))
      }

      /* ---------------- drag + planet goals ---------------- */

      let yaw = 0.35
      let pitch = 0.28
      let yawVelocity = 0
      let pitchVelocity = 0
      let dragging = false
      let pointerId: number | null = null
      let lastX = 0
      let lastY = 0
      let downX = 0
      let downY = 0
      /** Movement past this (css px) turns a press into a drag. */
      const DRAG_THRESHOLD = 8

      const raycaster = new THREE.Raycaster()
      const pointerNdc = new THREE.Vector2()
      const worldPos = new THREE.Vector3()
      let hovered: Orbiter | null = null
      /** Sticky label from a touch tap until the next empty tap / drag. */
      let pinned: Orbiter | null = null
      /** Planet the label is still tracking through a desktop linger/fade. */
      let labeled: Orbiter | null = null
      let lingerTimer: number | null = null
      let fadeTimer: number | null = null
      const LINGER_MS = 750
      const FADE_MS = 280
      const finePointer = window.matchMedia(
        "(hover: hover) and (pointer: fine)",
      ).matches

      const clearHideTimers = () => {
        if (lingerTimer !== null) {
          window.clearTimeout(lingerTimer)
          lingerTimer = null
        }
        if (fadeTimer !== null) {
          window.clearTimeout(fadeTimer)
          fadeTimer = null
        }
      }

      const finishHide = () => {
        labeled = null
        label.textContent = ""
        label.style.opacity = "0"
        label.style.visibility = "hidden"
      }

      /**
       * Hide immediately (drag / empty tap) or linger then fade (desktop
       * unhover). Text stays until the fade ends — clearing it first left a
       * tiny empty bordered panel, the residual black box.
       */
      const hideGoal = (immediate = false) => {
        hovered = null
        pinned = null
        clearHideTimers()
        if (!labeled) {
          finishHide()
          if (!dragging) canvas.style.cursor = "grab"
          return
        }
        if (immediate) {
          label.style.transition = "none"
          finishHide()
          requestAnimationFrame(() => {
            label.style.transition = "opacity 280ms ease"
          })
          if (!dragging) canvas.style.cursor = "grab"
          return
        }
        if (!dragging) canvas.style.cursor = "grab"
        lingerTimer = window.setTimeout(() => {
          lingerTimer = null
          label.style.opacity = "0"
          fadeTimer = window.setTimeout(() => {
            fadeTimer = null
            finishHide()
          }, FADE_MS)
        }, LINGER_MS)
      }

      const showGoal = (orbiter: Orbiter) => {
        clearHideTimers()
        hovered = orbiter
        labeled = orbiter
        label.style.visibility = "visible"
        label.textContent = orbiter.goal
        label.style.opacity = "1"
        if (!dragging && finePointer) canvas.style.cursor = "pointer"
      }

      const placeLabel = (orbiter: Orbiter) => {
        orbiter.planet.getWorldPosition(worldPos)
        worldPos.project(camera)
        if (worldPos.z > 1) return

        const x = (worldPos.x * 0.5 + 0.5) * host.clientWidth
        const y = (-worldPos.y * 0.5 + 0.5) * host.clientHeight
        const pad = 10
        const lw = label.offsetWidth || 0
        const lh = label.offsetHeight || 0
        /*
          Keep the full box on-screen without changing its size. Centred above
          the planet, then nudged inward when that would clip at an edge.
        */
        const left = Math.min(
          Math.max(x, pad + lw / 2),
          host.clientWidth - pad - lw / 2,
        )
        const top = Math.min(
          Math.max(y - 12, pad + lh),
          host.clientHeight - pad,
        )
        label.style.left = `${left}px`
        label.style.top = `${top}px`
        label.style.transform = "translate(-50%, -100%)"
      }

      const hitPlanet = (clientX: number, clientY: number): Orbiter | null => {
        const rect = canvas.getBoundingClientRect()
        if (rect.width <= 0 || rect.height <= 0) return null
        pointerNdc.x = ((clientX - rect.left) / rect.width) * 2 - 1
        pointerNdc.y = -((clientY - rect.top) / rect.height) * 2 + 1
        raycaster.setFromCamera(pointerNdc, camera)
        const hits = raycaster.intersectObjects(planetMeshes, false)
        const mesh = hits[0]?.object
        if (!mesh) return null
        return orbiters.find((o) => o.body === mesh) ?? null
      }

      const onPointerDown = (event: PointerEvent) => {
        pointerId = event.pointerId
        dragging = false
        downX = event.clientX
        downY = event.clientY
        lastX = event.clientX
        lastY = event.clientY
        yawVelocity = 0
        pitchVelocity = 0
        canvas.setPointerCapture(event.pointerId)
      }

      const onPointerMove = (event: PointerEvent) => {
        if (pointerId !== null && event.pointerId === pointerId) {
          const dx = event.clientX - lastX
          const dy = event.clientY - lastY
          const total =
            Math.hypot(event.clientX - downX, event.clientY - downY)

          if (!dragging && total >= DRAG_THRESHOLD) {
            dragging = true
            hideGoal(true)
            canvas.style.cursor = "grabbing"
          }

          if (dragging) {
            lastX = event.clientX
            lastY = event.clientY
            yawVelocity = dx * 0.005
            pitchVelocity = dy * 0.004
            yaw += yawVelocity
            pitch = clamp(
              pitch + pitchVelocity,
              -scene.maxPitch,
              scene.maxPitch,
            )
            return
          }
        }

        /*
          **Hover only on fine pointers, and only on the planet body.**
          Coarse/touch uses tap-to-show below — synthesised hover on a phone
          would flash a label under a finger that cannot leave it.
        */
        if (!finePointer || dragging || pointerId !== null) return

        const hit = hitPlanet(event.clientX, event.clientY)
        if (!hit) {
          if (hovered && !pinned) hideGoal()
          else if (!pinned) canvas.style.cursor = "grab"
          return
        }
        showGoal(hit)
        placeLabel(hit)
      }

      const endDrag = (event: PointerEvent) => {
        if (event.pointerId !== pointerId) return
        const wasDragging = dragging
        const x = event.clientX
        const y = event.clientY
        dragging = false
        pointerId = null
        if (canvas.hasPointerCapture(event.pointerId)) {
          canvas.releasePointerCapture(event.pointerId)
        }
        canvas.style.cursor = "grab"

        /*
          **Tap to show on touch.** A press that never crossed the drag
          threshold is a deliberate planet pick — pin the label until the
          next empty tap or a drag. Fine-pointer hover already owns desktop.
        */
        if (wasDragging || finePointer) return

        const hit = hitPlanet(x, y)
        if (!hit) {
          hideGoal(true)
          return
        }
        pinned = hit
        showGoal(hit)
        placeLabel(hit)
      }

      canvas.addEventListener("pointerdown", onPointerDown)
      canvas.addEventListener("pointermove", onPointerMove)
      canvas.addEventListener("pointerup", endDrag)
      canvas.addEventListener("pointercancel", endDrag)
      const onPointerLeave = () => {
        if (finePointer && !pinned && !dragging) hideGoal()
      }
      canvas.addEventListener("pointerleave", onPointerLeave)

      /* ---------------- resize ---------------- */

      const resize = () => {
        const w = host.clientWidth
        const h = Math.max(host.clientHeight, 1)
        renderer.setSize(w, h, false)
        camera.aspect = w / h
        camera.clearViewOffset()
        applyOffset(w, h)
        camera.updateProjectionMatrix()
      }
      resize()
      const observer = new ResizeObserver(resize)
      observer.observe(host)

      /* ---------------- loop ---------------- */

      let frame = 0
      let last = performance.now()
      let running = false

      const render = (now: number) => {
        frame = requestAnimationFrame(render)

        // Clamp dt so a backgrounded tab doesn't jump the scene on return.
        const dt = Math.min((now - last) / 1000, 0.05)
        last = now

        if (!dragging) {
          yaw += yawVelocity
          pitch = clamp(pitch + pitchVelocity, -scene.maxPitch, scene.maxPitch)
          yawVelocity *= scene.damping
          pitchVelocity *= scene.damping
          if (Math.abs(yawVelocity) < 1e-5) yawVelocity = 0
          if (Math.abs(pitchVelocity) < 1e-5) pitchVelocity = 0

          if (!reduceMotion) yaw += scene.autoSpin * dt
        }

        system.rotation.y = yaw
        system.rotation.x = pitch

        for (const orbiter of orbiters) {
          if (!reduceMotion) orbiter.angle += orbiter.speed * dt
          orbiter.planet.position.set(
            Math.cos(orbiter.angle) * orbiter.radius,
            Math.sin(orbiter.angle) * orbiter.radius,
            0,
          )
        }

        const active = pinned ?? hovered ?? labeled
        if (active) placeLabel(active)

        // Slow counter-rotation on the sun so the corona shimmers.
        if (!reduceMotion) sun.rotation.y -= dt * 0.08

        renderer.render(world, camera)
      }

      const start = () => {
        if (running) return
        running = true
        last = performance.now()
        frame = requestAnimationFrame(render)
      }
      const stop = () => {
        if (!running) return
        running = false
        cancelAnimationFrame(frame)
      }

      /**
       * **Two reasons to stop, and both matter on a phone.**
       *
       * A hidden tab is the obvious one and the single biggest battery lever.
       * Scrolled past is the one a landing page specifically needs: this is a
       * long page, the hero leaves the viewport almost immediately, and a
       * WebGL scene rendering behind three screens of copy is pure drain.
       */
      const onVisibility = () => {
        if (document.hidden) stop()
        else if (visible) start()
      }
      document.addEventListener("visibilitychange", onVisibility)

      let visible = true
      const seen = new IntersectionObserver(
        ([entry]) => {
          visible = entry?.isIntersecting ?? true
          if (visible && !document.hidden) start()
          else stop()
        },
        { rootMargin: "120px" },
      )
      seen.observe(host)

      start()

      cleanup = () => {
        stop()
        clearHideTimers()
        document.removeEventListener("visibilitychange", onVisibility)
        seen.disconnect()
        observer.disconnect()
        canvas.removeEventListener("pointerdown", onPointerDown)
        canvas.removeEventListener("pointermove", onPointerMove)
        canvas.removeEventListener("pointerup", endDrag)
        canvas.removeEventListener("pointercancel", endDrag)
        canvas.removeEventListener("pointerleave", onPointerLeave)
        for (const item of disposables) item.dispose()
        renderer.dispose()
        host.replaceChildren()
      }
    }

    void boot()

    return () => {
      disposed = true
      cleanup?.()
    }
  }, [compact, config])

  return (
    <div
      ref={hostRef}
      className={className}
      role="img"
      aria-label="Solarity, drawn as a solar system: a sun at the centre with four orbiting goals. Hover or tap a planet to see its goal. Drag to rotate."
    />
  )
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

"use client"

import dynamic from "next/dynamic"
import Link from "next/link"
import { useEffect, useState } from "react"
import { ExampleDigest } from "@/app/example-digest"
import { Corners, Ticks } from "@/components/marks/accents"
import {
  BracketedRule,
  OrbitCorner,
  OrbitMark,
  PhaseRow,
  SunMark,
} from "@/components/marks/marks"

/* ------------------------------------------------------------------ *
 * The landing page, as five acts rather than a stack of cards.
 *
 * ## What changed, and why the old shape could not get there
 *
 * The first version was a centred hero over a grid of bordered panels. Every
 * section was the same width, the same weight and the same distance from the
 * edge, so the page had no rhythm — it read as a component gallery with a
 * headline on top, which is exactly what it was.
 *
 * Three rules replace that:
 *
 * 1. **The subject is cropped.** The sun runs off the right edge of the
 *    viewport and the rings leave the frame. You are near a body, not looking
 *    at a diagram of one. This is the single decision the reference site rests
 *    on and the one worth copying.
 *
 * 2. **Every act owns its full width**, and they alternate between held-in
 *    text columns and edge-to-edge fields. Uniform margins are what make a
 *    page feel like a template.
 *
 * 3. **Hairlines instead of boxes.** `ds-rule` is an orbit seen edge-on, so
 *    the layout draws the same shape the scene does. Bordered cards were a
 *    second, competing idea.
 * ------------------------------------------------------------------ */

const SolarHero = dynamic(
  () => import("@/components/landing/solar-hero").then((mod) => mod.SolarHero),
  {
    ssr: false,
    loading: () => (
      <div className="ds-bg-abyss size-full" aria-hidden data-ds="ds-bg-abyss" />
    ),
  },
)

const RHYTHM = [
  {
    index: "01",
    title: "Set a goal",
    copy: "One clear intention your circle can see — not a private checklist nobody will ever ask about.",
  },
  {
    index: "02",
    title: "Check in",
    copy: "A daily pulse, once. Friends notice when you show up, and they notice when you don’t.",
  },
  {
    index: "03",
    title: "Stay in orbit",
    copy: "Shared momentum compounds. A quiet digest each morning, and nothing else asking for you.",
  },
] as const

/**
 * The fabricated circle the proof band draws.
 *
 * **Four, and one of them not yet**, because that is the state the section is
 * about: a day still open, with one person the others are waiting on. Starting
 * it complete would make the heading read "4 of 4" and the copy beneath it
 * nonsense.
 */
const CIRCLE = [
  { id: "ana", label: "Ana", done: true },
  { id: "ben", label: "Ben", done: true },
  { id: "cal", label: "Cal", done: true },
  { id: "dee", label: "Dee", done: false },
] as const

/**
 * **`compact` described a device frame, and nothing described a phone.**
 *
 * In the catalog this component only ever rendered inside a preview that passed
 * `compact` explicitly. `app/page.tsx` renders `<LandingContent />` with no
 * props, so on the real site the flag is **permanently false** and every
 * `compact ?` branch in this file is dead code on the one device most visitors
 * arrive with.
 *
 * Three bugs, one cause. The navbar kept "How it works" and pushed Sign up off
 * the right edge. The hero used the desktop scene, whose camera sits close
 * enough that the sun fills a 390px viewport. `PhaseRow` stayed at 84px, which
 * the comment beside it already said overflows 342px of usable width.
 *
 * So the flag now means what its branches always assumed: **phone layout**,
 * whether that is a real phone or a frame pretending to be one.
 *
 * The breakpoint matches Tailwind's `sm`, because the navbar is handled in CSS
 * rather than here (see below) and the two must agree. A media query rather
 * than a resize listener: it fires on orientation change, costs nothing between
 * changes, and is the thing actually being asked about.
 */
function useIsPhone() {
  const [isPhone, setIsPhone] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)")
    const sync = () => setIsPhone(mq.matches)
    sync()
    mq.addEventListener("change", sync)
    return () => mq.removeEventListener("change", sync)
  }, [])

  return isPhone
}

export const LandingContent = ({ compact = false }: { compact?: boolean }) => {
  const [circle, setCircle] = useState<
    { id: string; label: string; done: boolean }[]
  >(() => CIRCLE.map((member) => ({ ...member })))

  /**
   * **`phone`, not `compact`, for anything whose value is a number.**
   *
   * The server cannot know the viewport, so this is false for one frame after
   * hydration. That is fine for the two things using it: the hero canvas is a
   * `ssr: false` dynamic import and has not mounted yet, and `PhaseRow` is far
   * enough down the page to be off-screen at first paint.
   *
   * **Anything that would *flash* stays in CSS.** The navbar is the example,
   * and it is why this hook is not simply used everywhere.
   */
  const isPhone = useIsPhone()
  const phone = compact || isPhone

  const toggleMember = (id: string) =>
    setCircle((prev) =>
      prev.map((member) =>
        member.id === id ? { ...member, done: !member.done } : member,
      ),
    )

  /** One measure for every act, so the page has a spine. */
  const gutter = compact ? "px-6" : "px-8 lg:px-16"

  return (
    <div
      className="ds-bg-abyss ds-font-body ds-text-primary"
      /*
        **Only the compact layout writes `--ds-gutter`, and only because it is
        the one that can lie to a media query.**

        The mobile preview is a 390px `DeviceFrame` inside a desktop window, so
        a breakpoint reads the *window* and answers 4rem for a column padded to
        1.5rem — which is how the proof band's corner marks ended up further in
        than the text they were measuring.

        The full-width layout needs no override: there the window *is* the
        layout, so `:root`'s 2rem / 4rem step is correct by construction. An
        inline style beats a media query, so the narrow case wins wherever it
        is drawn and the wide case is left alone.
      */
      style={
        compact ? { ["--ds-gutter" as string]: "1.5rem" } : undefined
      }
    >
      {/* ═══════════════ act 0 — the hero ═══════════════ */}

      <section
        id="top"
        className={`ds-hero flex flex-col justify-end ${
          compact ? "min-h-[680px]" : "min-h-[100dvh]"
        }`}
        data-ds="ds-hero ds-bg-abyss"
        aria-label="Solarity hero"
      >
        {/*
          **Full bleed, and behind everything.** The canvas is the page's
          background rather than an illustration sitting in a column — which is
          the difference between a scene and a picture of one. `inset-0` plus a
          scrim is all the composition there is.
        */}
        <div className="absolute inset-0 z-0" aria-hidden>
          {/* `phone`: the pulled-back `COMPACT_SCENE` camera, which is what
              keeps the sun from filling a 390px viewport entirely. */}
          <SolarHero compact={phone} className="size-full" />
        </div>

        <div
          className="ds-scrim"
          data-ds="ds-scrim"
          data-compact={compact ? "" : undefined}
          aria-hidden
        />

        {/*
          ═══ the navbar ═══

          **Absolute over the hero rather than sticky**, and that is a real
          choice rather than the easy one. A bar pinned to the viewport spends
          the whole page covering the top of a full-bleed scene, and the page
          already closes with the same call to action — so pinning buys a
          second Sign in and costs the hero its top edge. It also survives the
          device-frame preview, where a sticky element inside a scroll
          container is the thing that most often misbehaves.

          **Only the routes that exist.** Sign in and sign up are real; "How it
          works" is an in-page anchor to the act that answers it. Nothing here
          links somewhere unbuilt, which is the failure a designed navbar
          invites — inventing a Pricing and a Blog because the shape expects
          them.
        */}
        <header
          className={`pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between ${gutter} ${
            compact ? "py-5" : "py-6"
          }`}
        >
          <a
            href="#top"
            className="ds-font-display ds-text-primary pointer-events-auto flex shrink-0 items-center gap-2.5 text-lg font-semibold tracking-[-0.01em]"
            data-ds="ds-font-display ds-text-primary"
          >
            <span className="ds-text-flame" data-ds="ds-text-flame">
              <SunMark size={17} />
            </span>
            Solarity
          </a>

          {/*
            **The header's rule, and it is load-bearing rather than decorative.**

            A wordmark at one margin and three controls at the other is two
            islands with a void between them — `justify-between` arranging
            things, not a designed bar. The rule spans the void and ties them
            into one object, which is what a navbar is.

            `fade="start"`: it emerges from empty space beside the wordmark and
            is at full strength where it meets the nav. The default fades the
            other way and would dissolve exactly where it needs to make
            contact.

            Desktop only. At 390px there is no void to span — the wordmark and
            the two remaining controls already fill the row.
          */}
          {compact ? null : (
            <Ticks fade="start" className="mx-10 min-w-0 flex-1" />
          )}

          <nav
            className="flex shrink-0 items-center gap-5 sm:gap-7"
            aria-label="Primary"
          >
            {/*
              **Hidden on a phone, in CSS rather than in JS.**

              Three items in 390px leaves the wordmark no room and pushes Sign
              up off the right edge, which is what it was doing. The anchor is
              the one a scroll reaches anyway, so losing it costs nothing.

              `hidden sm:inline` rather than the `phone` flag, because this is
              the one place a flag would be visible: the server renders the
              desktop bar, so the link would appear and then vanish a frame
              later, at the top of the page, where it is the first thing seen.
              CSS decides before the first paint. The 639px breakpoint in
              `useIsPhone` is Tailwind's `sm` for exactly this reason.
            */}
            {compact ? null : (
              <a
                /*
                  **The section, not the heading inside it.** `#rhythm-heading`
                  landed on the `<h2>` and left the "The loop" eyebrow scrolled
                  off above — the reader arrived one line into the answer. The
                  act begins at its own top edge.
                */
                href="#how-it-works"
                className="ds-link ds-font-body pointer-events-auto hidden text-sm sm:inline"
                data-ds="ds-link ds-font-body"
              >
                How it works
              </a>
            )}
            {/*
              **`<Link>`, not the catalog's `<button>`.** In the catalog these
              were `onClick` stubs that flipped a "signing in…" flag for 1.2s
              and went nowhere, because there was nowhere to go. A landing page
              whose two ways in are buttons that do nothing is the one bug a
              visitor cannot work around.

              The label stays "Sign in": `legal.spec.ts` asserts a *link* by
              that name, which is now what it is.
            */}
            <Link
              href="/auth/sign-in"
              className="ds-link ds-font-body pointer-events-auto text-sm"
              data-ds="ds-link ds-font-body"
            >
              Sign in
            </Link>
            {/*
              **The width floor is the leak, more than the padding is.**

              `--ds-cta-min: 7rem` reserves 112px for a label that needs about
              55, and `px-5` adds 40 on top. On a 390px viewport, minus a 32px
              gutter each side, the bar has ~326px for a wordmark, two links and
              this — so the button was claiming a third of the row to hold two
              words, and Sign up went over the right edge.

              Both are relaxed below `sm` and restored above it, **through
              custom properties rather than `px-*`**. The `px-5` that used to sit
              here never did anything: `design-system.css` is unlayered and
              Tailwind's utilities are not, so `.ds-cta`'s own padding outranked
              it. `--ds-cta-pad-x` is the override that works, and it is now
              read the same way `--ds-cta-min` always has been.

              In the className rather than the `style` prop because an inline
              style cannot carry a breakpoint, and this needs one.

              The floor is lowered, not removed. It exists so a label change
              cannot resize the button, and 5rem still does that at this size.
            */}
            <Link
              href="/auth/sign-up"
              className="ds-cta ds-bg-flame ds-text-on-light ds-font-body pointer-events-auto text-[0.8rem] [--ds-cta-min:5rem] [--ds-cta-pad-x:0.875rem] [--ds-cta-pad-y:0.5rem] sm:[--ds-cta-min:7rem] sm:[--ds-cta-pad-x:1.25rem]"
              data-ds="ds-cta ds-bg-flame ds-text-on-light ds-font-body"
            >
              Sign up
            </Link>
          </nav>
        </header>

        {/* The ember, kept — it warms the corner the sun cannot reach. */}
        <div className="ds-glow" data-ds="ds-glow" aria-hidden />

        {/*
          **`pointer-events-none` on the wrapper, `auto` on anything you can
          press.** This block is full-width and, once the headline is at its
          display size, most of the viewport tall — so as a solid hit target it
          swallowed every drag before the canvas underneath ever saw one. The
          scene stopped being draggable and nothing about the markup looked
          wrong, because a transparent div covering a canvas is invisible in
          every way except this one.

          Not solved by lowering the z-index: the copy has to sit *over* the
          scene, and the two links have to stay clickable. Only the wrapper is
          transparent to the pointer; each control opts back in.
        */}
        <div
          className={`pointer-events-none relative z-10 w-full ${gutter} pb-14 ${
            compact ? "pt-24" : "pt-32"
          }`}
        >
          <div className={compact ? "" : "max-w-[46rem]"}>
            {/*
              The orbit mark replaces a plain flame rule here. It is the scene
              at 18px, so the eyebrow carries the same object the canvas behind
              it does — and it is the one glyph nobody else's brand could own.
            */}
            <p
              className="ds-eyebrow mb-6 flex items-center gap-2.5"
              data-ds="ds-eyebrow"
            >
              <OrbitMark size={18} />
              Accountability, in orbit
            </p>

            {/*
              **`text-balance` and a tight leading.** At this size the default
              1.5 leading opens gaps a headline cannot survive, and an unbalanced
              ragged edge is the thing that most reliably makes large type look
              accidental.
            */}
            <h1
              className={`ds-font-display ds-text-primary text-balance font-semibold leading-[0.94] tracking-[-0.02em] ${
                compact ? "text-[2.75rem]" : "text-[clamp(3.5rem,7.5vw,7rem)]"
              }`}
              data-ds="ds-font-display ds-text-primary"
            >
              Progress you can see,
              <br />
              <span className="ds-text-flame" data-ds="ds-text-flame">
                with people who
              </span>
              <br />
              keep you honest.
            </h1>

            <p
              className={`ds-font-body ds-text-muted mt-7 text-pretty ${
                compact ? "text-[0.95rem]" : "max-w-[34rem] text-lg"
              }`}
              data-ds="ds-font-body ds-text-muted"
            >
              A circle of friends, one goal each, checked off in public. No
              feed, no streak-shaming, no strangers — just the few people who
              would notice.
            </p>

            <div
              className={`mt-9 flex items-center gap-6 ${
                compact ? "flex-wrap" : ""
              }`}
            >
              {/*
                **"Create an account", not the catalog's "Start a circle".**
                `legal.spec.ts` asserts `link "Create an account"` on this page,
                and it is the more honest label anyway: you cannot start a
                Circle until you have an account, so the button named the second
                step and hid the first.
              */}
              <Link
                href="/auth/sign-up"
                className="ds-cta ds-bg-flame ds-text-on-light ds-font-body pointer-events-auto px-7 py-3.5 text-[0.95rem]"
                data-ds="ds-cta ds-bg-flame ds-text-on-light ds-font-body"
              >
                Create an account
              </Link>

              {/* An in-page anchor, which is what the label always promised. */}
              <a
                href="#how-it-works"
                className="ds-link ds-font-body pointer-events-auto text-sm"
                data-ds="ds-link ds-font-body"
              >
                See how it works
              </a>
            </div>
          </div>

          {/*
            **Ticks under the hero, not a rule.** A hairline would close the
            section; a ruled edge that fades out says the page continues, which
            is the one thing a hero has to communicate before anyone scrolls.
          */}
          <Ticks className="mt-14" />

          <div className="mt-4 flex items-center justify-between gap-4">
            <p
              className="ds-font-mono ds-text-muted text-[10px] uppercase tracking-[0.24em] opacity-70"
              data-ds="ds-font-mono ds-text-muted"
            >
              Drag the sky
            </p>
            <p
              className="ds-font-mono ds-text-muted text-[10px] uppercase tracking-[0.24em] opacity-70"
              data-ds="ds-font-mono ds-text-muted"
            >
              Scroll
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════ act 1 — the loop ═══════════════ */}

      <section
        id="how-it-works"
        className={`relative scroll-mt-6 ${gutter} ${
          compact ? "py-20" : "py-32 lg:py-44"
        }`}
        aria-labelledby="rhythm-heading"
      >
        <p className="ds-eyebrow mb-5" data-ds="ds-eyebrow">
          The loop
        </p>
        <h2
          id="rhythm-heading"
          className={`ds-font-display ds-text-primary max-w-[24ch] text-balance font-semibold leading-[1.02] tracking-[-0.015em] ${
            compact ? "text-[2rem]" : "text-[clamp(2.25rem,4.5vw,4rem)]"
          }`}
          data-ds="ds-font-display ds-text-primary"
        >
          Three beats a day, and none of them is a dashboard.
        </h2>

        {/*
          **A row of hairlines, not a row of cards.** Each beat gets the same
          measure and is separated by a rule rather than enclosed by a border —
          so the eye reads three parts of one thing instead of three objects.
        */}
        <div
          className={`mt-16 grid gap-px ${
            compact ? "grid-cols-1" : "md:grid-cols-3"
          }`}
        >
          {RHYTHM.map((beat) => (
            <article key={beat.index} className="relative pt-8">
              <hr className="ds-rule absolute top-0" data-ds="ds-rule" />
              <p
                className="ds-font-mono ds-text-flame mb-5 text-xs tracking-[0.2em]"
                data-ds="ds-font-mono ds-text-flame"
              >
                {beat.index}
              </p>
              <h3
                className="ds-font-display ds-text-primary text-2xl font-semibold tracking-[-0.01em]"
                data-ds="ds-font-display ds-text-primary"
              >
                {beat.title}
              </h3>
              <p
                className="ds-font-body ds-text-muted mt-3 max-w-[34ch] text-pretty text-[0.95rem] leading-relaxed"
                data-ds="ds-font-body ds-text-muted"
              >
                {beat.copy}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* ═══════════════ act 2 — the proof ═══════════════ */}

      {/*
        **Edge to edge, and the only surface colour on the page.** One band of
        `ds-bg-surface` running the full width is what gives the scroll a
        change of pressure — the thing a uniform column of sections never has.
      */}
      <section
        className="ds-bg-surface relative overflow-hidden"
        data-ds="ds-bg-surface"
        aria-labelledby="proof-heading"
      >
        {/*
          All four, because this is the one band that *is* a surface — it has a
          real edge, so marking it is describing the page rather than
          decorating it. The hot corner is the only one on the page.

          **Inset**, so the marks land on the same line the copy is set to
          rather than on the browser's edge. At the true edge they read as
          attached to the window; on the gutter they read as drawn around the
          number, which is what they are for.
        */}
        <Corners
          at={["tl", "tr", "br", "bl"]}
          accent="tl"
          size={20}
          inset
        />

        {/*
          **The phase row lives on this band, so the shadow has to be this
          band's colour.** An eclipse is the absence of the sun, not a dark
          disc: on the abyss it must be abyss, and here it must be Blue
          Fantastic. `--ds-phase-shadow` is how a surface tells the mark what it
          is standing on.
        */}
        <div
          className={`grid items-center gap-12 ${gutter} ${
            compact ? "py-20" : "py-28 lg:grid-cols-[1fr_auto] lg:py-36"
          }`}
          style={{
            ["--ds-phase-shadow" as string]: "var(--ds-blue-fantastic)",
          }}
        >
          <div>
          <p className="ds-eyebrow mb-6" data-ds="ds-eyebrow">
            Yesterday, in one circle
          </p>
          {/*
            **The number is derived, not written.** It counts the row of marks
            beside it, so pressing one changes both — which is the point of
            putting them together. A hardcoded "3" next to a togglable picture
            would be the page contradicting itself the first time anyone
            touched it.
          */}
          <p
            id="proof-heading"
            className={`ds-font-display ds-text-primary font-semibold leading-[0.95] tracking-[-0.02em] ${
              compact ? "text-[3rem]" : "text-[clamp(3rem,9vw,8.5rem)]"
            }`}
            data-ds="ds-font-display ds-text-primary"
          >
            {circle.filter((member) => member.done).length}
            <span className="ds-text-muted"> of </span>
            {circle.length}
          </p>
          <p
            className={`ds-font-body ds-text-primary mt-6 text-pretty ${
              compact ? "text-base" : "max-w-[40rem] text-xl"
            }`}
            data-ds="ds-font-body ds-text-primary"
          >
            {circle.every((member) => member.done)
              ? "checked in — the whole circle closed its day."
              : circle.filter((member) => !member.done).length === 1
                ? "checked in — and the fourth knows it."
                : "checked in — and the rest know it."}
          </p>
          {/*
            **Primary, not muted, and that is a rule rather than a preference.**
            Muted on the surface fill measures 3.96:1 after the palette
            re-spacing — under the 4.5 small text wants. Primary on surface is
            8.11:1. Muted belongs on the abyss; the surface band is a moment of
            emphasis and emphasis does not want a whisper on it.
          */}
          <p
            className={`ds-font-body ds-text-primary mt-4 text-pretty opacity-80 ${
              compact ? "text-sm" : "max-w-[38rem]"
            }`}
            data-ds="ds-font-body ds-text-primary"
          >
            That is the whole mechanism. Not a notification designed to be
            ignored, but four people who will see the number in the morning.
          </p>

          <button
            type="button"
            className="ds-link ds-font-body mt-8 text-sm"
            data-ds="ds-link ds-font-body"
          >
            Read how a circle works
          </button>
          </div>

          {/*
            **The right half was empty, and this is what belongs in it.**

            The band had a number on the left and a third of a screen of nothing
            on the right — the composition was doing the same thing the first
            hero did, holding a subject in a column with dead space beside it.

            Four phases: three clear, one eclipsed. It is the heading as a
            picture, in the same object the scene above draws, and it is
            *pressable* — which turns a claim into a demonstration. Somebody who
            toggles the fourth sees the number move and understands the
            mechanism without reading the paragraph under it.
          */}
          <div className={compact ? "" : "lg:justify-self-end"}>
            <PhaseRow
              items={circle}
              /* 84 on desktop, 44 on a phone. The band's number is set at
                 clamp(3rem, 9vw, 8.5rem); at 68 the marks read as a caption
                 beside it rather than the same statement twice. A phone has
                 no such headroom — four marks at 84 plus gaps overflow 342px
                 of usable width, and the row must not wrap. */
              size={phone ? 44 : 84}
              onToggle={toggleMember}
              /* Flame, because these are suns. The band's own text is
                 Palladian, and Palladian discs read as moons — which is the
                 opposite object. */
              className={`ds-text-flame ${
                phone ? "gap-5" : "justify-end gap-7"
              }`}
            />
            <p
              className="ds-font-mono ds-text-primary mt-5 text-[10px] uppercase tracking-[0.24em] opacity-60"
              data-ds="ds-font-mono ds-text-primary"
            >
              Try one
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════ act 3 — the objection ═══════════════ */}

      {/*
        **The section that replaced the palette wall.**

        A swatch grid and three type specimens sat here, and they were on a
        marketing page for one reason: the token inspector counted a missing
        class as a defect, so the page was arranged to satisfy a tool. A
        visitor does not care what `#C9C1B1` is called. The specimens now live
        at `/tokens`, where coverage is a real assertion, and this act does the
        job a third section on a landing page actually has — **answering the
        objection the reader is already forming.**

        For an accountability product that objection is always the same, and
        every competitor in this space either ducks it or leans on it: being
        watched sounds like pressure. Say it first.
      */}
      <section
        className={`relative ${gutter} ${compact ? "py-20" : "py-32 lg:py-40"}`}
        aria-labelledby="objection-heading"
      >
        {/*
          The curved corner, used once, and this is where it earns its place:
          the act sits between two straight-edged bands, so an arc is the one
          mark that reads as a *turn* rather than as another frame.
        */}
        {/*
          **Not on a phone.** At 390px the arc's 96px radius eats a quarter of
          the column and collides with the heading it is supposed to frame — a
          mark that has to compete with the text is decoration. The desktop
          layout has margin to spare and the mobile one does not, which is the
          only reason it differs.
        */}
        {compact ? null : <OrbitCorner at="tl" size={96} inset />}

        <p className="ds-eyebrow mb-5" data-ds="ds-eyebrow">
          The obvious worry
        </p>
        <h2
          id="objection-heading"
          className={`ds-font-display ds-text-primary max-w-[20ch] text-balance font-semibold leading-[1.02] tracking-[-0.015em] ${
            compact ? "text-[2rem]" : "text-[clamp(2.25rem,4.5vw,4rem)]"
          }`}
          data-ds="ds-font-display ds-text-primary"
        >
          &ldquo;I don&rsquo;t want to be watched.&rdquo;
        </h2>
        <p
          className="ds-font-body ds-text-muted mt-6 max-w-[46ch] text-pretty"
          data-ds="ds-font-body ds-text-muted"
        >
          Nor does anyone. So there is no feed, no score, no league table, and
          nothing a stranger can see. Four things are true of every circle, and
          they are the whole privacy model.
        </p>

        <div
          className={`mt-14 grid gap-px ${compact ? "grid-cols-1 gap-8" : "md:grid-cols-2 md:gap-x-16 md:gap-y-12"}`}
        >
          {[
            {
              k: "Ten people, invited",
              v: "A circle is capped at ten and joined by a link somebody sent you. There is no discovery and no way in from outside.",
            },
            {
              k: "A goal can stay private",
              v: "Hide any goal from one circle or from everyone. It still counts toward your day — the commitment survives, only the title goes.",
            },
            {
              k: "One pulse a day",
              v: "Checking in is a single act, once. Nothing here rewards opening the app more often than that.",
            },
            {
              k: "Leaving takes one button",
              v: "So does deleting everything. Your notes and photos go with you; past days stay, with your name removed.",
            },
          ].map((item) => (
            <div key={item.k} className="relative pt-6">
              <hr className="ds-rule absolute top-0" data-ds="ds-rule" />
              <h3
                className="ds-font-display ds-text-primary text-xl font-semibold tracking-[-0.01em]"
                data-ds="ds-font-display ds-text-primary"
              >
                {item.k}
              </h3>
              <p
                className="ds-font-body ds-text-muted mt-2 max-w-[46ch] text-pretty text-[0.95rem] leading-relaxed"
                data-ds="ds-font-body ds-text-muted"
              >
                {item.v}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════ act 3b — the streak rule ═══════════════ */}

      {/*
        **The act the catalog never had, and the one the product most needs.**

        One person missing one goal ends the streak for everybody. That is the
        rule most likely to feel unfair the first time it bites, and a landing
        page that omits it is the product hiding its sharpest edge from exactly
        the people who should hear it first — the ones deciding whether to
        invite three friends into it.

        **Placed as a sibling of "the obvious worry", because it is one.** That
        act answers "I don't want to be watched"; this answers "what happens
        when I let people down". Two hard things, said plainly, next to each
        other, before the close asks for a signature.

        `e2e/legal.spec.ts` asserts both the heading and the sentence, with a
        comment naming this as the paragraph a rewrite would trim for length. It
        was right — the rewrite trimmed it, and the assertion is what caught it.
      */}
      {/*
        **Same surface as the proof band**, and the same two-column beat.
        Copy left, the day example right — so the rule and the picture of it
        land in one glance on a wide screen. Stacked on a phone, because a
        digest panel beside a heading at 390px is two half-finished columns.
      */}
      <section
        id="streaks"
        aria-labelledby="streaks-heading"
        className="ds-bg-surface relative overflow-hidden"
        data-ds="ds-bg-surface"
      >
        <div
          className={`grid items-center gap-12 ${gutter} ${
            compact
              ? "py-20"
              : "py-28 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,40rem)] lg:gap-16 lg:py-36"
          }`}
        >
          <div>
            <p className="ds-eyebrow mb-5" data-ds="ds-eyebrow">
              The rule worth knowing first
            </p>
            <h2
              id="streaks-heading"
              className={`ds-font-display ds-text-primary max-w-[20ch] text-balance font-semibold leading-[1.02] tracking-[-0.015em] ${
                compact ? "text-[2rem]" : "text-[clamp(2.25rem,4.5vw,4rem)]"
              }`}
              data-ds="ds-font-display ds-text-primary"
            >
              About streaks
            </h2>
            {/*
              Primary on the surface, not muted — same contrast rule as the
              proof band. Muted on Blue Fantastic fails small-text AA.
            */}
            <p
              className="ds-font-body ds-text-primary mt-6 max-w-[46ch] text-pretty opacity-80"
              data-ds="ds-font-body ds-text-primary"
            >
              A circle&rsquo;s streak counts days where <em>everyone</em> finished.
              One person missing one goal ends it for the group — not just for them.
              That is the point rather than a penalty: it is what makes the day
              matter to four people instead of one.
            </p>
            <p
              className="ds-font-body ds-text-primary mt-4 max-w-[46ch] text-pretty opacity-80"
              data-ds="ds-font-body ds-text-primary"
            >
              Somebody who joins mid-run is not counted until the next one starts,
              so a newcomer cannot break a streak they were not part of earning.
            </p>
          </div>

          {/*
            **The example is a component, not a screenshot**, so it cannot go
            stale silently — if the digest's shape changes, this changes with it
            or the build fails. `legal.spec.ts` locates it by its label.
          */}
          <div className={compact ? "" : "lg:w-full"}>
            <ExampleDigest />
          </div>
        </div>
      </section>

      {/* ═══════════════ act 4 — the close ═══════════════ */}

      {/*
        **No border at all, and a ruled line inside the gutter instead.**

        This was `ds-panel` with the left, right and bottom edges switched off —
        which leaves a hairline running the full width of the viewport, hard
        against both sides. It read as a stray rule rather than as the top of a
        section, because it belonged to the window rather than to the column.

        The ticks under the hero are the pattern the page already established:
        a line that starts and ends where the writing does. Reusing it here
        means both ends of the page are closed the same way.
      */}
      <footer className="relative overflow-hidden">
        {/*
          **The page ends at a sunrise.** It opens near a star and closes on the
          far edge of the same sky — abyss through truffle to flame and out to a
          yellow the palette does not otherwise contain. It drifts at 6% over
          eighteen seconds, which is slow enough that nobody catches it moving.

          `background-position` on a compositor thread, so it survives a busy
          page and costs no main-thread work at all.
        */}
        <div className="ds-horizon" data-tiled data-ds="ds-horizon" aria-hidden />

        <div
          className={`relative z-10 ${gutter} ${
            compact ? "pb-20 pt-14" : "pb-28 pt-16 lg:pb-36"
          }`}
        >
          {/* The same ruled line that closes the hero, inset to the column. */}
          <Ticks className="mb-14" />

          {/*
            **The one place the bracketed mark appears.** It is a wordmark's
            cousin — ceremony rather than a component — so it goes at the single
            genuine break on the page: between the argument and the close. Twice
            and it stops being a mark and starts being a divider style.
          */}
          <BracketedRule className="mb-14" />

          <h2
            className={`ds-font-display ds-text-primary max-w-[16ch] text-balance font-semibold leading-[0.98] tracking-[-0.02em] ${
              compact ? "text-[2.25rem]" : "text-[clamp(2.5rem,6vw,5.5rem)]"
            }`}
            data-ds="ds-font-display ds-text-primary"
          >
            Ready when your circle is.
          </h2>

          {/*
            **"Create an account" here too, and not a second "Sign in".** The
            catalog closed with Sign in because both of its buttons were the
            same stub. The page has spent five acts arguing to somebody who does
            not have an account yet; ending on the control for people who
            already do would be answering the wrong reader at the one moment
            they are most likely to act.

            `ds-bg-truffle` rather than flame: the horizon behind this is
            already at its hottest, and a flame button on it disappears.
          */}
          <Link
            href="/auth/sign-up"
            className="ds-cta ds-bg-truffle ds-text-primary ds-font-body mt-10 inline-block px-7 py-3.5 text-[0.95rem]"
            data-ds="ds-cta ds-bg-truffle ds-text-primary ds-font-body"
          >
            Create an account
          </Link>

          <hr className="ds-rule mt-20" data-ds="ds-rule" />

          {/*
            **Left-aligned at every width, and the desktop layout used to push
            these apart.**

            `justify-between` sent the legal links to the far right — which is
            exactly where the horizon's hot end is. Oatmeal at 70% opacity over
            a near-yellow gradient is unreadable, so on desktop the links were
            present, painted, and invisible. It read as them being missing.

            Keeping the whole row on the left puts it over the dark half, where
            the gradient has not started. The heat stays on the right because
            nothing is written there — which is the arrangement the mobile
            layout already had by accident of wrapping.
          */}
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
            <p
              className="ds-font-mono ds-text-muted text-[10px] uppercase tracking-[0.24em] opacity-70"
              data-ds="ds-font-mono ds-text-muted"
            >
              Solarity
            </p>
            {/*
              **Real links, and Google's OAuth review is why this is not
              optional.** Consent review looks for a reachable privacy URL on
              the app's homepage; three `<button>`s that go nowhere would fail
              it while looking finished. Support is the third because somebody
              locked out of their account looks here for it.
            */}
            <nav className="flex items-center gap-6" aria-label="Legal">
              <Link
                href="/privacy"
                className="ds-link ds-font-body text-sm"
                data-ds="ds-link ds-font-body"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="ds-link ds-font-body text-sm"
                data-ds="ds-link ds-font-body"
              >
                Terms
              </Link>
              <Link
                href="/support"
                className="ds-link ds-font-body text-sm"
                data-ds="ds-link ds-font-body"
              >
                Support
              </Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  )
}

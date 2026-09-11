/**
 * The design port's standing check.
 *
 *   node scripts/design-audit.mjs          # summary
 *   node scripts/design-audit.mjs --full   # every file, not just the worst
 *
 * Three questions, each of which had already gone wrong once by the time this
 * was written. That is the entire selection criterion: nothing here is
 * hypothetical.
 *
 * **1. Does every `ds-*` class used in the app exist in the stylesheet?**
 * `ds-type-body` was used on a real screen and defined nowhere — the type scale
 * deliberately made 14px the inherited base instead of naming it. A className
 * that matches no rule is not an error in TypeScript, ESLint, the build, or the
 * browser. It is a silently unstyled element.
 *
 * **2. Does every CSS variable the stylesheet reads get defined somewhere?**
 * `design-system.css` reads `--font-fraunces`; the font was declared in the
 * catalog's root layout and the port copied the CSS without it. Every
 * `ds-type-title` in the app fell through to the `"Times New Roman"` fallback —
 * on every screen, with every check passing, because **falling back is what a
 * fallback is for.** A serif looks deliberate, so nothing looked broken.
 *
 * **3. How much pre-design markup is left, and where?**
 * The conversion backlog, counted rather than estimated. `rounded border`,
 * `text-sm`, `opacity-70`, `text-red-600` and friends are the idioms the system
 * replaces; a file's count is how much of it has not been ported yet, and the
 * total is the honest answer to "how far through are we".
 *
 * ## What it deliberately does not check
 *
 * **Whether a token *wins* where it is used.** `ds-link` beat `ds-text-danger`
 * by declaration order for weeks, so "Delete your account" was oatmeal rather
 * than red with every automated check green. Specificity is a runtime property
 * of the cascade and cannot be read off the source; the `/tokens` specimens are
 * the only real regression test a stylesheet has.
 *
 * **Whether the markup is right.** A `<label>` that swallows a hint into the
 * accessible name is invisible here and always will be. That is what the e2e
 * locators are for.
 */
import { readFileSync, readdirSync, statSync } from "node:fs"
import { join, relative } from "node:path"

const ROOT = process.cwd()
const FULL = process.argv.includes("--full")

/* ------------------------------------------------------------------ *
 * Collecting sources
 * ------------------------------------------------------------------ */

const walk = (dir, out = []) => {
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry === ".next" || entry === ".git") continue
    const path = join(dir, entry)
    if (statSync(path).isDirectory()) walk(path, out)
    else out.push(path)
  }
  return out
}

const files = walk(join(ROOT, "app")).concat(walk(join(ROOT, "components")))
const tsx = files.filter((f) => f.endsWith(".tsx"))
const css = files.filter((f) => f.endsWith(".css"))

const read = (f) => readFileSync(f, "utf8")

/**
 * Comments are stripped before anything is counted.
 *
 * This codebase explains itself at length, and those explanations quote the
 * very strings being searched for — `design-system.css` discusses
 * `ds-type-body` in the paragraph explaining why it does *not* exist. Counting
 * prose would make the audit report its own documentation as a finding.
 */
const stripComments = (src) =>
  src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "")

/* ------------------------------------------------------------------ *
 * 1. Undefined ds-* classes
 * ------------------------------------------------------------------ */

const defined = new Set()
for (const f of css) {
  for (const m of read(f).matchAll(/\.(ds-[a-z0-9-]+)/g)) defined.add(m[1])
}

/**
 * **The lookbehind is the whole correctness of this section.**
 *
 * A bare `\b(ds-...)` also matches inside `--ds-tabbar-height` and
 * `--font-ds-body`, so the first run of this script reported seven "undefined
 * classes" that were all CSS custom properties being used exactly as intended.
 * An audit whose default output is false positives gets ignored within a week,
 * which is worse than not having one.
 *
 * `(?<![-\w])` says: a class name, not the tail of a variable.
 */
const usedIn = new Map() // token -> Set<file>
for (const f of tsx) {
  for (const m of stripComments(read(f)).matchAll(/(?<![-\w])(ds-[a-z0-9-]+)/g)) {
    if (!usedIn.has(m[1])) usedIn.set(m[1], new Set())
    usedIn.get(m[1]).add(relative(ROOT, f))
  }
}

const undefinedTokens = [...usedIn].filter(([token]) => !defined.has(token))

/* ------------------------------------------------------------------ *
 * 2. CSS variables read but never defined
 * ------------------------------------------------------------------ */

const varsDefined = new Set()
const varsUsed = new Map() // name -> Set<file>

for (const f of css) {
  const src = read(f)
  for (const m of src.matchAll(/(--[a-z0-9-]+)\s*:/g)) varsDefined.add(m[1])
  for (const m of src.matchAll(/var\((--[a-z0-9-]+)/g)) {
    if (!varsUsed.has(m[1])) varsUsed.set(m[1], new Set())
    varsUsed.get(m[1]).add(relative(ROOT, f))
  }
}

/**
 * Variables can also be defined from TypeScript, two ways, and both count.
 *
 * `next/font` declares one per face — **this is exactly the seam Fraunces fell
 * through**: the CSS was copied between repos, the font declaration was not.
 *
 * And a `style={{ ["--ds-cta-min"]: "auto" }}` sets one per instance. Those are
 * *designed* to be absent most of the time — the rule reads
 * `var(--ds-cta-min, 11rem)` and the fallback is the normal case — so treating
 * them as missing would flag the pattern working correctly.
 */
for (const f of tsx) {
  const src = read(f)
  for (const m of src.matchAll(/variable:\s*["'](--[a-z0-9-]+)["']/g)) {
    varsDefined.add(m[1])
  }
  for (const m of src.matchAll(/["'](--[a-z0-9-]+)["']\s*(?:as\s+string\s*)?\]/g)) {
    varsDefined.add(m[1])
  }
}

const undefinedVars = [...varsUsed].filter(([name]) => !varsDefined.has(name))

/* ------------------------------------------------------------------ *
 * 3. The conversion backlog
 * ------------------------------------------------------------------ */

/**
 * The idioms the design system replaces.
 *
 * **Colour utilities are listed but weighted separately below**, because a
 * `text-red-600` is a contrast failure rather than an unconverted style — it
 * measured 3.76:1 on the abyss, under the 4.5 small text needs.
 */
/**
 * **`font-medium` is deliberately not in this list, and `font-semibold` and
 * `font-bold` are.**
 *
 * The scale's tokens are size-and-weight *roles* — `ds-type-title`,
 * `ds-type-label`. A heading weight never appears without a size, so
 * `font-semibold` in a className is a role written out by hand and worth
 * flagging. `font-medium` is different: it is emphasis on a `<strong>` inside a
 * running sentence, where applying `ds-type-label` would also change the size
 * mid-line and be wrong.
 *
 * The scale has no weight-only token and should not grow one — that would be a
 * Tailwind utility with a `ds-` prefix, which is the thing this system exists
 * instead of. So `font-medium` is a permitted primitive.
 *
 * Nothing is lost: every case worth catching pairs it with a size, and the
 * `text-*` half still trips the regex. Four of the last six "findings" were
 * `font-medium` alone, and all four were correct code.
 */
const LEGACY = /\brounded border\b|\btext-(red|green|blue|amber|yellow)-\d{3}\b|\bopacity-\d{2}\b|\btext-(xs|sm|base|lg|xl|2xl|3xl)\b|\bfont-(semibold|bold)\b/g

/**
 * Files with raw utilities that are **decisions, not backlog.**
 *
 * Without this the count can never reach zero, and a number that cannot reach
 * zero stops being read — which would waste the one thing this script is for.
 * Every entry needs a reason, and the reason has to be a property of the file
 * rather than "we did not get to it".
 *
 * Kept here rather than as inline pragmas so the whole set of exceptions is
 * reviewable in one place. If this list grows past a handful, the system is
 * missing a token and the answer is to add one.
 */
const EXEMPT = {
  "components/galaxy-card.tsx":
    "On-sky chrome. The tooltip and Expand control sit on --galaxy-sky, not on the abyss, so #f4f1de is measured against a surface the app does not own. Type is tokenised; colour is the module's.",
  "components/skeleton.tsx":
    "`bg-current opacity-10`, deliberately not `bg-current/10` — the slash modifier on a currentColor background does not compose. Documented in the file.",
  "app/(app)/(shell)/dashboard/photo-button.tsx":
    "`opacity-40` marks the upload in flight. There is no busy token, and inventing one for a single control would be worse than the utility.",
  "app/(app)/circles/[id]/today-roster.tsx":
    "`disabled:opacity-40` on the note-sharing toggle, same reason as photo-button: an in-flight state with no token to name it.",

  /**
   * **The landing is the design system's source, not one of its consumers.**
   *
   * The type scale was *derived* from this page — 278 elements clustered into
   * six roles — so its display sizes are the measurements the tokens were cut
   * from, at values the app scale deliberately does not carry: a
   * `clamp(3.5rem,7.5vw,7rem)` headline has no business being a token, because
   * nothing else in the product is ever that size.
   *
   * The catalog said this out loud by rendering it with `expectAll={false}`:
   * "a landing page owes the system nothing. Shaping this page to satisfy a
   * coverage number was what put a palette grid in the middle of an argument."
   *
   * It is also a verbatim clone. "Converting" it would mean editing the
   * reference to match the thing derived from it.
   */
  "components/landing/landing-content.tsx":
    "The design reference itself, cloned verbatim. Its display sizes are the measurements the token scale was derived from, at values no other screen uses. Converting it would mean editing the source to match its own output.",

  /**
   * Rendered inside the landing's streak act, so it is sized to that page
   * rather than to the app. Its `clamp()` sizes track the surrounding display
   * type; the app scale has no step that wide because nothing in the app is.
   */
  "app/example-digest.tsx":
    "Lives in the landing's streak act and is scaled to it. Same exemption as landing-content: the landing's display sizes are measurements, not tokens.",

  "app/(app)/settings/avatar-form.tsx":
    "`opacity-40` while an upload is in flight, same as photo-button. No busy token exists, and one control does not justify inventing one.",

  /**
   * The 404's orbit mark is dimmed, not coloured. `ds-text-flame` sets the ink;
   * the opacity holds it back so an empty orbit reads as absence rather than as
   * a warning. That is a property of one decorative glyph, not a colour
   * decision the system should have an opinion about.
   */
  "app/not-found.tsx":
    "`opacity-60` dims the decorative orbit mark. Not text, not a container border — the rule about opacity dimming a border does not apply.",
  "app/(app)/not-found.tsx":
    "Same as the root not-found: the orbit mark is dimmed rather than coloured.",
}

const backlog = []
const exempt = []
for (const f of tsx) {
  const rel = relative(ROOT, f).split("\\").join("/")
  const hits = [...stripComments(read(f)).matchAll(LEGACY)].map((m) => m[0])
  if (!hits.length) continue
  if (EXEMPT[rel]) exempt.push({ file: rel, count: hits.length, why: EXEMPT[rel] })
  else backlog.push({ file: rel, count: hits.length })
}
backlog.sort((a, b) => b.count - a.count)

/* ------------------------------------------------------------------ *
 * Report
 * ------------------------------------------------------------------ */

let failed = false
const rule = (s) => console.log(`\n${s}\n${"─".repeat(s.length)}`)

rule("1. ds-* classes used but not defined")
if (undefinedTokens.length === 0) {
  console.log("None.")
} else {
  failed = true
  for (const [token, where] of undefinedTokens) {
    console.log(`  ${token}`)
    for (const f of where) console.log(`      ${f}`)
  }
  console.log("\n  These style nothing. Either the class is misspelt or the")
  console.log("  token was never created — check design-system.css before adding one.")
}

rule("2. CSS variables read but never defined")
if (undefinedVars.length === 0) {
  console.log("None.")
} else {
  failed = true
  for (const [name, where] of undefinedVars) {
    console.log(`  ${name}   (read in ${[...where].join(", ")})`)
  }
  console.log("\n  Each of these silently resolves to its fallback. If the fallback")
  console.log("  is plausible — a system serif, a grey — nothing will look broken.")
}

rule("3. Conversion backlog")
const total = backlog.reduce((n, b) => n + b.count, 0)
console.log(`${total} legacy uses across ${backlog.length} files.\n`)
for (const b of FULL ? backlog : backlog.slice(0, 20)) {
  console.log(`  ${String(b.count).padStart(4)}  ${b.file}`)
}
if (!FULL && backlog.length > 20) {
  console.log(`  … and ${backlog.length - 20} more (--full)`)
}

if (exempt.length) {
  const n = exempt.reduce((t, e) => t + e.count, 0)
  console.log(`\n  Plus ${n} declared exception(s), not counted above:`)
  for (const e of exempt) {
    console.log(`    ${String(e.count).padStart(3)}  ${e.file}`)
    if (FULL) console.log(`         ${e.why}`)
  }
}

console.log()
process.exit(failed ? 1 : 0)

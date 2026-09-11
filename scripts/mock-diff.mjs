/**
 * Compares each shipped screen against the mock it was drawn from.
 *
 *   node scripts/mock-diff.mjs [path-to-solarity-ui]
 *   node scripts/mock-diff.mjs --screen settings
 *
 * ## This runs the gap audit backwards, and that is the point
 *
 * `solarity-ui/docs/gap-audit.md` ran **implementation → mock**: it pulled every
 * human-facing string out of the real files and reported the ones the mock
 * lacked. That found sections the design had never drawn — settings was missing
 * fifteen strings because the system had no checkbox, so the mock could not
 * draw one and nobody noticed the screen was incomplete.
 *
 * The port needs the opposite question: **mock → implementation.** What did the
 * design decide that the port did not carry over? A mock that says `ds-eyebrow`
 * where the shipped screen says nothing is a decision quietly dropped, and no
 * other check in this repo can see it — `design-audit.mjs` proves every class
 * *exists*, never that the right one was *used*.
 *
 * ## Two questions, because they fail differently
 *
 * **Strings** catch a section that did not travel. Loud, obvious once seen.
 *
 * **Tokens** catch a screen that was converted but not to the design — the
 * right classes, in the wrong places. That is the failure mode of a port done
 * file by file under time pressure, which is exactly how this one was done.
 *
 * ## Read the output with judgement
 *
 * Roughly a third of string hits are false positives, for the same reasons the
 * original audit documents: the string lives in a shared component rather than
 * in the file, or it is sample data. `Morning crew`, `Run 5k`, `Ana`, `Ben` are
 * invented. This script does not try to be clever about that — a checker that
 * guesses which findings to hide is one you stop trusting.
 */
import { readFileSync, readdirSync, existsSync } from "node:fs"
import { join, resolve, basename } from "node:path"

const UI = resolve(process.argv[2]?.startsWith("--") ? "../solarity-ui" : (process.argv[2] ?? "../solarity-ui"))
const ONLY = process.argv.includes("--screen")
  ? process.argv[process.argv.indexOf("--screen") + 1]
  : null

const MOCKS = join(UI, "mocks")
if (!existsSync(MOCKS)) {
  console.error(`No mocks at ${MOCKS}. Pass solarity-ui's path.`)
  process.exit(1)
}

const read = (f) => readFileSync(f, "utf8")

/** Block and line comments go first: this codebase quotes its own strings in prose. */
const stripComments = (src) =>
  src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "")

/**
 * Human-facing text, from the four places it hides.
 *
 * JSX text nodes, plus the three attributes that reach a person —
 * `aria-label`, `placeholder`, `title`. Deliberately not `alt`: it is usually
 * interpolated from data in both trees and produces noise on every row.
 */
function strings(src) {
  const out = new Set()
  const clean = stripComments(src)

  for (const m of clean.matchAll(/>([^<>{}]{4,})</g)) {
    const text = m[1].replace(/\s+/g, " ").trim()
    if (text && /[a-z]{3}/i.test(text)) out.add(text)
  }
  for (const m of clean.matchAll(/(?:aria-label|placeholder|title)="([^"]{3,})"/g)) {
    out.add(m[1].trim())
  }
  return out
}

/** Every `ds-*` class, as a multiset — a screen using `ds-panel` twice matters. */
function tokens(src) {
  const counts = new Map()
  for (const m of stripComments(src).matchAll(/(?<![-\w])(ds-[a-z0-9-]+)/g)) {
    counts.set(m[1], (counts.get(m[1]) ?? 0) + 1)
  }
  return counts
}

/** The `Sources:` block every mock header carries. */
function sourcesOf(src) {
  const block = src.match(/\*\s*Sources:\s*([\s\S]*?)\*\//)
  if (!block) return []
  /*
    **`[^\s]`, not `[^\s(]`, and the first draft got this wrong.**

    Excluding `(` truncated every route-group path — `app/(app)/(shell)/dashboard
    /page.tsx` became `app/`, which exists nowhere and was silently filtered
    out. The screens with the most sources were the worst hit: `dashboard` and
    `settings` fell back to the single component in their list without parens,
    so the whole mock was compared against `galaxy-card.tsx` and
    `push-toggle.tsx` respectively, and every token the rest of the screen used
    was reported missing.

    A checker whose failure mode is "invents findings" is worse than no checker.
    Route groups are the defining feature of this app's URL structure, so a path
    regex that cannot express one was never going to work here.
  */
  return [...block[1].matchAll(/^\s*\*\s*-\s*(\S+)/gm)]
    .map((m) => m[1].trim().replace(/[.,;]$/, ""))
    .filter((p) => p.endsWith(".tsx") || p.endsWith(".ts"))
    .filter((p) => !p.startsWith("e2e/"))
}

/**
 * A `Sources:` entry may be a bare filename — "role-form.tsx" — meaning "beside
 * the previous one". Resolved against the last full path seen, which is how the
 * headers are actually written.
 */
function resolveSources(list) {
  const out = []
  let dir = ""
  for (const entry of list) {
    if (entry.includes("/")) {
      dir = entry.slice(0, entry.lastIndexOf("/"))
      out.push(entry)
    } else if (dir) {
      out.push(`${dir}/${entry}`)
    }
  }
  return out
}

const mocks = readdirSync(MOCKS)
  .filter((f) => f.endsWith(".tsx"))
  .filter((f) => !["registry.tsx", "types.ts", "placeholder.tsx"].includes(f))
  .filter((f) => (ONLY ? f.startsWith(ONLY) : true))

let screens = 0
let unchecked = 0
for (const file of mocks) {
  const mockSrc = read(join(MOCKS, file))
  const declared = sourcesOf(mockSrc)
  const sources = resolveSources(declared)

  /*
    A mock with no `Sources:` at all is a design with no screen yet — fine, skip
    it. A mock that *declares* sources none of which survived parsing is a bug
    in this script, and the first version skipped both cases identically and
    silently.

    That is how fourteen screens — Today, Circle, goals, profile, every admin
    page — sat in a clean report without ever being compared to anything. The
    output said "16 screens differ" and the reader's inference, that the other
    screens matched, was exactly wrong.

    Silence has to mean checked-and-clean, or the report cannot be read at all.
  */
  if (!sources.length) {
    if (declared.length) {
      unchecked += 1
      console.log(`\n${basename(file, ".tsx")}  — NOT CHECKED: declares sources, none parsed`)
      console.log(`  ${declared.join("\n  ")}`)
    }
    continue
  }

  const present = sources.filter((p) => existsSync(join(process.cwd(), p)))
  if (!present.length) {
    unchecked += 1
    console.log(`\n${basename(file, ".tsx")}  — NOT CHECKED: none of its sources exist here`)
    console.log(`  ${sources.join("\n  ")}`)
    continue
  }

  /* A partial resolve is the inflating case: the screen is compared against a
     fraction of itself, so everything in the rest of it reads as missing. */
  const absent = sources.filter((p) => !existsSync(join(process.cwd(), p)))

  const impl = present.map((p) => read(join(process.cwd(), p))).join("\n")

  const mockStrings = strings(mockSrc)
  const implStrings = strings(impl)
  const missing = [...mockStrings].filter((s) => !impl.includes(s) && !implStrings.has(s))

  const mockTokens = tokens(mockSrc)
  const implTokens = tokens(impl)
  const tokenGaps = [...mockTokens]
    .filter(([t]) => !implTokens.has(t))
    .map(([t, n]) => `${t}${n > 1 ? ` ×${n}` : ""}`)

  if (!missing.length && !tokenGaps.length) continue

  screens += 1
  console.log(`\n${"─".repeat(60)}\n${basename(file, ".tsx")}`)
  console.log(`  sources: ${present.join(", ")}`)
  if (absent.length) {
    console.log(`  ⚠ not found, so findings below are inflated: ${absent.join(", ")}`)
  }

  if (tokenGaps.length) {
    console.log(`\n  tokens the mock uses and the screen does not:`)
    console.log(`    ${tokenGaps.join("  ")}`)
  }

  if (missing.length) {
    console.log(`\n  strings in the mock, absent from the screen:`)
    for (const s of missing.slice(0, 12)) {
      console.log(`    ${s.length > 88 ? s.slice(0, 85) + "…" : s}`)
    }
    if (missing.length > 12) console.log(`    … and ${missing.length - 12} more`)
  }
}

console.log(
  `\n${"─".repeat(60)}\n${screens} screen(s) differ from their mock.\n` +
    (unchecked ? `${unchecked} screen(s) COULD NOT BE CHECKED — see above.\n` : "") +
    `Token gaps are the useful half. Strings are noisier: a third live in a\n` +
    `shared component or are invented sample data.\n`,
)

/* Unchecked is a failure, not a footnote: a green report that skipped a third
   of the screens is worse than a red one. */
if (unchecked) process.exitCode = 1

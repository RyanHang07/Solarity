# The design port — v1 record

Moving the `solarity-ui` design system onto the real app, screen by screen.
**Complete, 11 September 2026**, suite green.

`solarity-ui/docs/porting-plan.md` was the strategy — what moves, why dark-only,
what the mocks owed the app. This is what the execution actually did. The
living guide for design work from here is
[`../design-system.md`](../design-system.md).

## What moved

| # | Tranche | Files | Legacy uses at end |
|---|---|---|---|
| 0 | Chrome — layout, nav, CSS, dark-only | 7 | — |
| 1 | Auth | 11 | 0 |
| 2 | Onboarding | 10 | 0 |
| 3a | Today + Overview | 9 | 0 (+7 exempt) |
| 3b | Circle | 4 | 0 (+1 exempt) |
| 4 | Goals + lists | 7 | 0 |
| 5a | Settings | 5 | 0 |
| 5b | Circle settings | 4 | 0 |
| 6 | Profiles | 3 | 0 |
| 7 | Admin, legal, join | 13 | 0 |
| 8 | Landing | 4 | 0 (+29 exempt) |
| — | Shared components | 18 | 0 |

909 legacy uses at the start; zero outside the declared exceptions at the end.

## The five bug classes it produced

Three came from `solarity-ui`. The fourth was found during the auth tranche, in
code written *by someone who had read the other three* — which is the argument
for the list existing at all. All five now live in
[`../patterns.md`](../patterns.md); they are repeated here because this is where
they were paid for.

**1. Cascade order.** Any token that sets a colour and is routinely combined
with another that sets a colour needs one of them in `:where()`. `ds-link` and
`ds-panel` are both handled; a third would not be.

**2. Flex defaults.** `self-start` hardcoded on a button overrides every
parent's `items-*`. **A layout bug that looks like a spacing bug is the
expensive kind**, because the obvious fix — add margin — makes it worse.

**3. Nested interactive elements.** A card that is a link and contains a link.
Next reports it as a *hydration* error rather than an HTML nit, because the
browser repairs nested anchors during parsing and the repaired DOM no longer
matches what React rendered. The stretched-link `::after` is the fix.

**4. The label is not a container.** Text inside a `<label>` joins the field's
accessible name, so a hint under an input renames it: "Password" becomes
"Password At least 8 characters, with a letter and a number." `htmlFor` plus
`aria-describedby`; **a label holds the label and nothing else.**

`components/password-fields.tsx` carried a long comment about learning this the
hard way, and the port's own `Field` reintroduced it anyway. It was caught only
because the first occurrence had been written down.

**5. Grep `design-system.css` before writing markup.** Process, not code.
`OrRule` was hand-built out of two `h-px flex-1` spans and `.ds-or` already
existed, doing the job better. Fifty tokens is more than anyone holds in their
head, and the cost of missing one is not a bug, it is a duplicate that drifts.

## Three bugs that shipped and were caught by reading, not by looking

Each rendered *plausibly*. Every automated check was green through all three.

- **`ds-type-body` was used and never defined.** The scale deliberately makes
  14px the inherited base on `.ds-app`, so there is no body token. Motivated
  section 1 of `design-audit.mjs`.
- **Fraunces was never ported.** `--font-ds-display` fell through to
  `"Times New Roman", serif` and every `ds-type-title` and `ds-type-metric` in
  the app rendered as a serif. **The CSS moves between repos; the fonts do
  not.** Motivated section 2.
- **`PrimaryButton` typed seven props and spread none**, so `onClick` was
  silently dropped. Caught by the alignment pass, not by a test.

## Two colour rules the shared-component pass turned up

`Avatar`'s initial fallback had a bare `border`, so the circle changed shade
with whatever ink the row around it set — the same person drew differently on a
roster row and a muted digest line. `GalaxyPreview`'s default frame was
`rounded border` while `GalaxyCard` had already moved to `ds-card`.

**An untokenised `border` is not neutral: it inherits the text colour of
whatever it lands in.** And opacity on a container dims its border too, so
"de-emphasise" is a colour decision, not an opacity one.

## The triage, 11 September

`scripts/mock-diff.mjs` runs the gap audit backwards — mock → implementation —
asking what the design decided that the port did not carry. The final run
compared 27 screens with none unchecked. **Most of what it reported is not a
defect, and the categories matter more than the list.**

### The parser bug, and why it is written down

The first run reported "16 screens differ" and was mostly fiction. The
`Sources:` parser matched paths with `[^\s(]+`, so a route group's opening paren
ended the match: `app/(app)/(shell)/dashboard/page.tsx` became `app/`, not a
`.tsx`, filtered away. Eighteen mocks name route-group paths.

- **Four inflated** — `dashboard`, `settings`, `not-found`, `_shared/chrome`
  kept only their one paren-free entry, so a whole screen's mock was compared
  against `galaxy-card.tsx` or `push-toggle.tsx`. `ds-link ×18` was an artifact.
- **Fourteen invisible** — Today, Circle, goals, profile, every admin page.
  Every source truncated, `sources.length === 0`, and the loop `continue`d
  without printing. They were not reported clean. They were **not reported**.

The second failure is the one worth keeping, and it is not about parsing. The
script treated *no sources declared* and *sources declared, none parsed*
identically — one is a design with no screen yet, the other is a broken checker.
A report naming 16 screens invites exactly one inference about the rest, and
that inference was wrong for a third of the app. **Silence has to mean
checked-and-clean.** The script now prints `NOT CHECKED`, counts it, and exits
non-zero.

### What the clean run actually found

| Class | Share | What it is |
|---|---|---|
| **Token owned by an extracted component** | most token findings | `components/ui/button.tsx` emits `ds-cta ds-bg-flame ds-text-on-light ds-type-label ds-panel ds-text-primary`; `field.tsx` emits `ds-field`. A screen using `<PrimaryButton>` or `<Field>` names none of them. This is the extraction working |
| **Sample data** | most string findings | `alex`, `Closest Friends`, `Morning run`, `you@example.com`, `Gym crew`, `demo-token` |
| **Stale `Sources:` header** | 4 screens | `dashboard` names `app/(app)/(shell)/tab-bar.tsx`, which is now `components/shell/app-nav.tsx`; `not-found` omits `app/(app)/not-found.tsx` where its strings live; `today` omits `app/(app)/layout.tsx`, which owns `ds-container`; `circle-settings` names only `page.tsx` for a screen with several forms |
| **Script limitation** | 1 screen | `admin` reported `("pending") const empty = state === "empty" return (` — `strings()` matches between `>` and `<`, and `=>` supplies the first |
| **Genuine** | 8 screens | Below |

The first row is the important one. **The check cannot see through a component
boundary**, and this port deliberately created several. That is a permanent
property of comparing a flat mock against a composed implementation, not
something to fix by loosening the check.

### Deliberate divergences, confirmed

| Divergence | Why |
|---|---|
| The check-in disc keeps `"Check in"` / `"Undo"` as its accessible name | The catalog said "Undo check-in"; four specs and nine call sites locate the app's strings |
| `auth-error` does not use `ds-text-danger` | Every reason that page renders is recoverable and none is the visitor's fault |
| `RadioGroup` unused on the check-in frequency | A `<fieldset>` there announces the form's name twice |
| `landing-content.tsx` untokenised | It is the reference the scale was derived from |
| `ExampleDigest` at landing sizes | It renders inside the landing's streak act |
| Two `<span role="alert">` | Phrasing-content parents where a `<p>` is invalid nesting |

### Genuine gaps, carried forward

Eight screens have findings that survive the triage. None is a defect a user
would call a bug; each is a design decision the port did not carry. They are
listed as open work in [`../build-plan.md`](../build-plan.md#the-design-gaps-mock-diff-still-reports).

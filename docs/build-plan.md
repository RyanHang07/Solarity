# Solarity: Build Plan

**Open work only.** v1 is complete and its record is in [`v1/`](v1/README.md);
finished steps and their reasoning are in [`history.md`](history.md). This file
is read daily and should stay short.

| You want | Read |
|---|---|
| What shipped in v1 | [`v1/README.md`](v1/README.md) |
| How it works now | [`architecture/`](architecture/README.md) |
| What keeps going wrong | [`patterns.md`](patterns.md) |
| How to run or verify it | [`testing.md`](testing.md) |
| Design tokens and the standing checks | [`design-system.md`](design-system.md) |
| Why a past decision went that way | [`history.md`](history.md) |

---

## Verify

Cheapest first.

```
rm -rf .next/dev

npm run typecheck
npx eslint .
npm run test:run
npm run build
npx playwright test --list
npm run test:e2e
node scripts/design-audit.mjs
node scripts/mock-diff.mjs ../solarity-ui
node scripts/graph-freshness.mjs
```

| Command | Catches what nothing else does |
|---|---|
| `npm run build` | `server-only` in a client bundle. `tsc` and ESLint cannot see bundler constraints |
| `playwright test --list` | Compiles every spec without running one, so a broken spec fails in seconds rather than mid-suite |
| `E2E_PROD=1 npm run test:e2e:ios` | **The only run that sees the CSP that ships.** Both CSP bugs so far were production-only *and* WebKit-only. Before any deploy |
| `design-audit.mjs` | A `ds-*` class that does not exist, a CSS variable nothing defines |
| `mock-diff.mjs` | A screen converted to the wrong tokens. Exits non-zero if any screen could not be checked |
| `graph-freshness.mjs` | Exits non-zero when `graphify-out/` stops matching the repository |

**`rm -rf .next/dev` is not superstition.** `tsconfig.json` includes both
`.next/types/**` and `.next/dev/types/**`, and **`next typegen` only writes the
first**. After moving a route file, typecheck compares a fresh route map against
a stale one and reports errors inside a generated file about paths you just
moved. Only needed after a move or rename.

---

## Make yourself an admin

**`/admin` does not exist for anyone until this runs.** Nothing in the app can
create the first administrator, because there is nobody to authorise it — and a
UI that could would be the highest-value target in the product.

**By email, which means a join.** `public.users` has no email column; email
lives in `auth.users`, and the two share an id.

```sql
update public.users u
   set role = 'admin'
  from auth.users au
 where au.id = u.id
   and au.email = 'edgy.zedmain@gmail.com';
```

Confirm it took, since an email that matches nothing updates nothing and says so
in the same way as success:

```sql
select au.email, u.username, u.role
from public.users u join auth.users au on au.id = u.id
where u.role = 'admin';
```

**The account has to have signed in at least once.** The row in `public.users`
is created by the `on_auth_user_created` trigger.

**Put the same address in `.env.local` as `E2E_ADMIN_EMAIL`.** The suite needs a
*real* admin rather than one it makes: `admin.spec.ts` asserts that the last
admin cannot be demoted, and a run that promoted a test account would have two
admins, so the assertion would fail.

---

## Open work

Nothing here blocks a private beta. The first section is the only one with a
user-visible effect.

### The design gaps `mock-diff` still reports

Eight screens carry findings that survive triage — a design decision the port
did not carry, rather than a bug anyone would report. The triage classes are in
[`design-system.md`](design-system.md#mock-diffmjs--the-question-no-other-check-asks);
what is left after applying them:

| Screen | Gap | Read as |
|---|---|---|
| **`join`** | `ds-horizon ×2`, `ds-font-display ×2`, `ds-text-flame ×5`, `ds-card`, `ds-eyebrow ×4`, `ds-type-metric ×2`, plus ten strings — "That link has expired", "This Circle is full, so you can't join right now", "Already have an account? Sign in to join", "of 10 members" | **The one worth doing first.** Tranche 7 was last and least verified, and this is the screen a new person sees before they have an account |
| **`notifications-list`** | `ds-border-oatmeal ×2`, `ds-text-flame ×2`, `ds-bg-flame ×2`, and "Unread." | The unread affordance the design drew — a flame marker — did not port |
| **`goal-detail`** | `ds-eyebrow ×2`, `ds-border-oatmeal ×4`, `ds-font-mono ×2`, plus "← Goals" and "Photo retained 90 days" | The back-link and the retention note are real copy, and the second is the only place a person learns it |
| **`circle-settings`** | `ds-eyebrow ×2`, `ds-font-mono ×2`, `ds-text-danger ×4`, `ds-border-oatmeal ×2`, plus "Generate link", "Revoke", "Archive this Circle" | **Check the `Sources:` header first** — it names only `page.tsx` for a screen with several forms, so some of this is likely the component-boundary class |
| **`circle`** | `ds-text-danger ×2`, plus "A decision is waiting on you", "Keep the 12 day streak", "Start everyone over at 0" | Streak-decision copy. `today-roster.tsx` is not in the mock's sources, so part of this may resolve by fixing the header |
| **`admin-report`** | `ds-text-danger ×2` and "Content no longer available." | A removed-content state the screen does not draw |
| **`onboarding-goal`** | `ds-swatch ×2` | The sun picker hand-rolls `peer-checked` ring styling instead of using the token |
| **`policy`, `onboarding-terms`, `onboarding-install`** | `ds-text-flame`, `ds-font-display`, `ds-font-mono` | Low stakes. `ds-font-display` may be the mock spelling out what `ds-type-title` already includes |

**✅ Four stale mock `Sources:` headers fixed in `solarity-ui`**, which were the
limiting factor on the check's precision:

- `dashboard` named `app/(app)/(shell)/tab-bar.tsx`; it is now `components/shell/app-nav.tsx`
- `not-found` omitted `app/(app)/not-found.tsx` and still said "(does not exist
  yet)" of the root one — written before either existed
- `today` omitted `app/(app)/layout.tsx`, which owns `ds-container`
- `sign-up` omitted `components/password-fields.tsx`, which owns the password hint

Re-run `mock-diff` to confirm the artefacts these produced are gone; the
remaining gaps below should shrink.

**One script limitation, not worth fixing.** `strings()` matches between `>` and
`<`, and `=>` supplies the first, so `admin` reports a fragment of JavaScript as
a missing string.

### The audit of 11 September

Nine findings, only one of them a live defect, and the suite was green
throughout — which is why the audit was worth running at all. Full reasoning and
file/line citations in [`audit-2026-09-11.md`](audit-2026-09-11.md).

**Done, and verified: typecheck, eslint, build and the full suite are green,
and the mobile fixes were checked on a device.**

- ✅ **`e2e/ui.ts` now matches `:is(p, span, li)[role="alert"]`.** It matched `p`
  alone, and the port had introduced a `<span>`, an `<li>` and a second
  `<span>`, each carrying a comment saying the helper could not see it. All four
  comments corrected; `report-checkin.tsx` now uses `FormError` outright.
- ✅ **`error.tsx` for `(app)` and for the public routes.** Neither renders
  `error.message` — a server throw here carries schema detail — and both offer
  `reset()` plus one honest destination.
- ✅ **`clearRateLimits` in `sign-up.spec.ts` and `goals.spec.ts`.**
- ✅ **All three error paths asserted**, each also checking the refusal wrote
  nothing. Chasing them found that **the report-a-note flow had no UI test at
  all** — the refusal was untestable because of the locator, the success was
  untested by oversight. Both now covered.

- ✅ **`submitAndWait` in `e2e/ui.ts`**, used by the new settings test. Not
  retrofitted across the other eighteen: the suite is green, so a sweeping
  rewrite of working specs risks more than it fixes. Adopt it where a spec is
  being edited anyway.
- ✅ **The two settings toggles and the data export are tested.** The export
  asserts `/support`'s promise in both directions — what the file contains and
  what it says the file omits.
- ⛔ **`app/join/[token]/loading.tsx` was added and reverted.** A `loading.tsx`
  makes the route stream, which turns the page's `redirect()` for a dead token
  from a server redirect into a client-side navigation, and widens the gap
  between paint and hydration for the Join button. Two specs caught it. Written
  up in [`audit-2026-09-11.md`](audit-2026-09-11.md#7-jointoken-has-no-loading-state);
  **`loading.tsx` is not a free addition on a route that redirects or carries a
  client-component form.**

**Open, in the order worth doing:**

1. **58 actions, 2 unit tests.** No cheap layer, so every assertion costs a
   browser, a Supabase round trip and a rate-limit token. `lib/today-gate.ts`,
   `lib/legal.ts` and `lib/supabase/checkin-date.ts` are pure and only reachable
   through a browser today.

### `export-data` is gone — done 11 September

**Undeployed and removed from the repo.** It duplicated
`app/(app)/settings/export/route.ts`: same RPC, different filename stamp,
`verify_jwt: true`, deployed and ACTIVE, never updated since it was created, on
no cron schedule, and **linked from nothing in the app**. Every other Edge
Function has a caller — `delete-account` from the settings action,
`purge-expired-photos` and `send-digest-push` from `cron.job`.

**Migration 113 sharpened this rather than settling it.** The RPC was broken, so
the duplicate was a dead endpoint; now it works, so it would have been a live
second route to the same personal data, one nothing tests and nothing documents.
Two implementations of a promise `/support` publishes is one too many, and the
one kept is the one the UI links to and the suite now downloads.

### The icon

**The artwork is the navbar, shrunk**: a flame `SunMark` on
`--ds-blue-fantastic`, `.ds-navbar`'s own surface. The SVG masters are in the
repo: `app/icon.svg` (Next serves it and writes the `<link>` itself),
`public/icons/icon.svg`, `icon-maskable.svg` and `badge.svg`.

**The abyss was the first attempt and was wrong.** It is the page behind the
bar, nearly black, and a favicon on it vanishes into a tab strip of other dark
favicons. The manifest's `theme_color` and `background_color` stay on the abyss
because they paint the splash and status bar, which sit against `.ds-app`.

Three things the masters encode that are easy to get wrong:

- **The hexes are inlined.** `marks.tsx` says nothing there hardcodes a hex and
  it is right — inside the app a mark inherits `currentColor`. **No cascade
  reaches a standalone asset**, so `var(--ds-abyss)` in a favicon resolves to
  nothing and the hollow centre punches a hole through the icon. Same shape as
  the Fraunces bug. `#0f1620` and `#ffb162` are the only copies.
- **Maskable is `scale(3.2)`, the others `scale(4)`.** Android guarantees only
  the centre 80% survives its crop.
- **The badge is white on transparent with the centre cut out.** Android masks
  by alpha and tints; a badge drawn on the abyss arrives as a tinted square.

**`theme_color` and `background_color` were `#0b0b12`, a value in no palette** —
near-black with a violet cast where the abyss is blue-grey. Invisible in a diff,
plain on a phone: Android paints `background_color` for the whole splash before
the app renders a pixel, and `theme_color` sits behind the status bar all day.
Both now `#0f1620`, as is `viewport.themeColor` in `app/layout.tsx`.

**Every raster icon is generated, by one command with no dependency:**

```
node scripts/build-icons.mjs
```

It writes `icon-192`, `icon-512`, `icon-512-maskable`, `badge-72`,
`app/apple-icon.png` and `app/favicon.ico`. Node ships `zlib`, which is the
only hard part of a PNG, and an ICO is a header followed by bitmaps — so this
is arithmetic rather than a supply chain, and `package.json` is untouched.

**The previous set had no generator at all.** They were described as
"a placeholder sun mark generated programmatically", the generator was never in
the repo, and so the icons could not be regenerated and drifted from the design
system the moment it changed. That is the actual reason this file exists.

The script copies `RAY`, the eight rotations and the r=5.5 centre from
`components/marks/marks.tsx`, and the two hexes from the palette. **Copied, not
imported**: importing a `.tsx` into a plain Node script means a build step, and
avoiding one is the point. Change the mark or the palette and re-run this.

`app/favicon.ico` is generated as BMP-inside-ICO rather than PNG-inside-ICO.
Both are legal and PNG is smaller, but it is only understood from Vista onward,
and the whole reason to ship a `.ico` is the browsers that will not read
`icon.svg`. A fallback needing a modern decoder is not a fallback.

**`favicon.ico` went away and came back, and the detour is the lesson.** Next
emits a `<link>` for both it and `icon.svg` when both exist, and browsers take
the `.ico` — so a stale one silently overrode the new SVG and the tab kept
showing the placeholder no matter what the vector said. Deleting it was the
quickest way to see the new mark; generating it from the same geometry is the
durable answer, because now the two cannot disagree.

**Three corrections worth keeping, because each was confident and wrong.**

An earlier note here said `app/apple-icon.png` was missing and an installed
iPhone was falling back to a screenshot. The check used a glob of
`app/**/apple-icon.png`, and `**/` requires at least one directory, so it cannot
match a file sitting directly in `app/`. The file was there the whole time. **A
search that cannot match what it is looking for reports the same "not found" as
a thing that is absent.**

The first run of the generator produced a baby-blue square with a red sun. The
compositor un-premultiplied against the *average* alpha instead of the alpha
*sum*, leaving every channel 16× too large, and `Buffer` truncated the overflow
to eight bits: `#34485f` became `#4080F0` and `#ffb162` became `#F01020`. **An
arithmetic slip in a rasteriser does not crash, it renders wrong**, and
wrong-but-plausible passes a glance. `selfCheck()` now asserts two exact pixels
before anything is written.

And the icon was first drawn on `--ds-abyss`, the page background, when the
brief said the navbar's. `.ds-navbar` is `--ds-blue-fantastic`. The abyss is
nearly black, which is where a favicon vanishes into a row of other dark
favicons — **the token was close enough in description to pass unchecked, which
is the only kind of wrong token that survives.**

### Housekeeping

- ✅ **`scripts/port-landing.mjs` removed.** It cloned the catalog's landing
  verbatim for tranche 8 and had been run. **Re-running it would have overwritten
  the landing with the catalog version**, discarding the streak section, the
  example day, the working links and the `heading "Solarity"` that
  `legal.spec.ts` asserts — all added deliberately after the clone. **A one-shot
  script that is destructive on its second run is worse than no script**; the
  reasoning it carried is preserved in `v1/design-port.md`.
- ✅ **Three dated graph snapshots removed**: `graphify-out/2026-09-01`,
  `2026-09-04`, `2026-09-10`, each a full `graph.json` alongside the current one.
  Four copies of the same artefact. `.gitignore`'s graphify rules were written
  against the root directory only, so each snapshot's `.graphify_root`,
  `.graphify_analysis.json` and `.graphify_labels.json` walked straight past
  them. Now `**/`, because **a gitignore rule written against one directory
  stops being true the moment the tool writes a second one.**
- **Refresh the graph periodically**, not per commit, via `scripts/graph-freshness.mjs`.
- **Wire the dev-only catalog route** through `pageExtensions` and verify `next build` excludes it.
- **`lib/database.types.ts` is current as of migration 113.** Checked rather than
  assumed: 113 changes a security attribute, `export_user_data` still takes no
  arguments and returns `jsonb`, and the file already says
  `Args: never; Returns: Json`. **Regenerating would have been the riskier
  choice** — the MCP generator omits `graphql_public`, so every regeneration is a
  manual splice, and doing one for a guaranteed-empty diff is how that splice
  eventually goes wrong.
- **Deploy `send-digest-push`**, and run `backfill-sun-presets.ts`.

---

## Decided, not pending

Each of these was argued and closed. They are here so the decision does not get
made twice.

### Turnstile stays off until v3

**The code is done and shipped; the switch is off.** All three password
endpoints render the widget and pass a `captchaToken`, and the CSP allows
`challenges.cloudflare.com` in `script-src` and `frame-src`.

**Why it is not on.** One Supabase project serves both production and the e2e
suite, and Playwright cannot solve a real challenge — so enabling it permanently
breaks the six tests covering signup, confirmation and reset. Cloudflare's
always-pass test keys are worse than off: the dashboard would report CAPTCHA
enabled while every bot passes.

**The order matters**, and getting it wrong reproduces a bug already met twice —
enabling before the deployed forms send tokens refuses every password endpoint
with `captcha protection: request disallowed (no captcha_token found)`.

| | Step | Why |
|---|---|---|
| 0 | **Add Cloudflare to `PROCESSORS`, bump `PRIVACY_VERSION`, deploy that first** | **Easy to skip, and the one with a legal edge.** The moment the toggle flips, Cloudflare receives an IP address and browser signals from every visitor to three auth screens — a processor, disclosed *before* it starts processing |
| 1 | **Deploy the current code** | The CSP change ships with the build |
| 2 | **`NEXT_PUBLIC_TURNSTILE_SITE_KEY` in Vercel**, then rebuild | `NEXT_PUBLIC_` values are inlined at build time. Present in `.env.local` is not present in production |
| 3 | **The secret key goes in Supabase**, not the app | **Nothing in this codebase reads `TURNSTILE_SECRET_KEY`.** A mismatched pair fails in a way that reads like a token problem |
| 4 | **Allowed domains in Cloudflare** list the Vercel host, plus `localhost` | |
| 5 | **Then** enable the toggle and test signup in a browser immediately | If it refuses, it is almost certainly step 2 or 3 |

**And decide what happens to the six tests.** Either accept losing that
coverage, or stand up a second Supabase project for the suite — the real fix,
and a bigger piece of work than this one.

### Leaked-password protection stays off

A paid-plan Supabase toggle checking new passwords against HaveIBeenPwned.
Recorded as a decision rather than deleted, so it is not rediscovered as an
oversight: the app has Supabase's own length and complexity floor, and the far
larger share of accounts arrive through Google, where no password exists here to
leak. Revisit if password sign-up becomes the common path.

### The standing risk, written down rather than fixed

Every RPC is reachable directly at `/rest/v1/rpc/` by anyone holding a session,
so the limits in `lib/ratelimit.ts` bound what the *app* does rather than what a
determined caller can. `search_users` is where that matters most, because it is
the app's only directory. Its real defences are in the database: three
characters minimum, escaped wildcards, ten rows, and blocks excluded.

---

## Legal exposure — the part a lawyer answers

**Accuracy is a thing this repository can check and does. Exposure is not.**
This is the list to hand to a solicitor, written down so the conversation starts
from specifics rather than "please review my terms".

| Question | Why it is on the list |
|---|---|
| **Is there an entity?** | There is not. Everything below is downstream of that, and this is the only answer that changes the others |
| **The liability clause** | "No guarantees" and a total exclusion are the two clauses most often struck out, especially against consumers. What survives is usually a cap plus a carve-out for death, personal injury, fraud |
| **"We can close your account"** | An unqualified termination right is weak against a consumer. The usual fix is notice and a reason, both of which the product could give |
| **Age: stated, never checked** | 18+ appears on sign-up, the terms gate and both pages, and nothing verifies it. Ordinary at this size, and a real gap if a minor signs up |
| **UK/EU users and the US transfer** | `DATA_REGION` is the United States and the pages disclose it. Whether disclosure alone suffices, or SCCs are needed, is not answerable from documentation |
| **A named controller with no address** | GDPR wants a controller identifiable and contactable. A name and an email is usual for an individual, and "usual" is not "sufficient" |
| **The 72-hour breach commitment** | Published on `/privacy`. It is a promise one person keeps alone |
| **Photos of people** | Check-in photos can contain faces, including other people's. Nothing asks whether the subject consented, and biometric-adjacent processing has sharper rules |

**None of this blocks a private beta with people you know. It blocks opening it
to strangers.**

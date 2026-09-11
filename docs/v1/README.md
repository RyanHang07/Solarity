# Solarity v1 — complete

**Shipped 11 September 2026.** Twenty-seven numbered steps, the galaxy, the
public surface, and a nine-tranche design port. `npm run typecheck`, `eslint .`,
`npm run build` and the full Playwright suite are green together.

This folder is the **record**. Nothing in it is work to do. Open work lives in
[`../build-plan.md`](../build-plan.md); the durable reasoning behind past
decisions is in [`../history.md`](../history.md), which stays where it is
because the whole repo links into it.

## What a person can do in v1

Sign up with Google or a password, pick a username and a sun, leave onboarding
with one goal, check it off with a note and a photo, invite a friend by name
into a Circle of up to ten, see who finished today, hear about it while the day
is still going, keep a streak, read a five-day digest, retire or achieve a goal,
report and block, and delete the account and everything in it. Both galaxies
draw on a phone at 17ms a frame with a hundred planets.

## What is in here

| File | What it holds |
|---|---|
| [`design-port.md`](design-port.md) | The nine-tranche port onto the design system: what each tranche moved, the five bug classes it produced, and the deliberate divergences from the mocks |

## The verification that closed it

| Check | State |
|---|---|
| `npm run typecheck` | green |
| `eslint .` | green |
| `npm run build` | green — the only check that catches a server/client boundary violation |
| `npm run test:e2e` | green, full suite |
| `node scripts/design-audit.mjs` | no undefined classes, no unresolved variables, no legacy backlog outside the declared exceptions |
| `node scripts/mock-diff.mjs ../solarity-ui` | 27 screens compared, 0 unchecked, findings triaged in [`design-port.md`](design-port.md#the-triage-11-september) |
| The manual pass | 30 rows plus 12 re-checks, on a real iPhone installed to the home screen |

## What v1 deliberately does not have

Each of these was decided, not forgotten, and the reasoning is in
[`../build-plan.md`](../build-plan.md) so it does not get made twice.

- **Turnstile is off.** The code ships and the CSP allows it; one Supabase
  project serves both production and the suite, so enabling it breaks six tests.
- **Leaked-password protection is off.** A paid-plan toggle; most accounts
  arrive through Google, where no password exists here to leak.
- **No legal entity, and the exposure questions are unanswered.** This blocks
  opening to strangers. It does not block a private beta with people you know.
- **Age is stated and never checked.**

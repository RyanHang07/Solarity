# Solarity docs

Friends in invite-only Circles (max 10) see each other's daily progress.

**v1 is complete** — shipped 11 September 2026, every check green. The record is
in [`v1/`](v1/README.md).

## Read this when

| You want to… | Go to |
|---|---|
| Build the next thing | [`build-plan.md`](build-plan.md) — **open work only.** The design gaps, the housekeeping, and what was decided rather than deferred |
| Know what shipped in v1 | [`v1/README.md`](v1/README.md) — scope, the verification that closed it, and what it deliberately lacks |
| Write markup, or add a token | [`design-system.md`](design-system.md) — the type scale, the six rules that cost something, and the two standing checks |
| Understand how something works | [`architecture/`](architecture/README.md) — schema, security, time, app |
| Avoid a bug this codebase keeps having | [`patterns.md`](patterns.md) — fifty-one shapes, plus the standing checks |
| Run it, test it, or verify a release | [`testing.md`](testing.md) |
| Know what the product is for | [`product-and-design.md`](product-and-design.md) |
| Change what a notification says | [`notification-copy.md`](notification-copy.md) — every string, both surfaces |
| See what the last audit found | [`audit-2026-09-11.md`](audit-2026-09-11.md) — nine findings against a green suite, with what was corrected mid-audit. **Folds into `history.md` and is deleted once its open findings close** |
| Know why a past decision went that way | [`history.md`](history.md) — append-only |

## Before you change the schema

1. Assertions at the bottom of the migration.
2. Apply, then prove it in a rolled-back transaction, **both directions**.
3. Regenerate types (`Out-File -Encoding utf8` on Windows, never `>`).
4. `npm run typecheck` (**not bare `tsc`**: the route types are generated), `eslint .`, `npm run test:e2e`.
5. **Commit the migration file.** Applying through the MCP tool records it on the remote and writes nothing to `supabase/migrations/`; the repo then claims a schema it does not have, and nothing in CI notices.
6. Record the reasoning in `history.md`, and any new shape in `patterns.md`.

Full routine in [`patterns.md`](patterns.md#schema-change-routine).

## House style for these docs

- **A claim, then its reason.** Tables and bullets over paragraphs; a reason that took a debugging session to learn is worth a row, not a page.
- **Keep the reasoning.** Most bugs here were found by re-reading an old "why", so compression must not delete it.
- **History is append-only** and lives in one file, so the working documents stay short enough to read daily.
- **A finished version's record moves to `v1/`, `v2/`…** `history.md` keeps the
  decision-by-decision narrative and is linked from everywhere, so it stays put.
  What moves is the per-version plan, once it stops being a plan.

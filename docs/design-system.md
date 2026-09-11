# The design system

Read this before writing markup. The v1 port that produced it is recorded in
[`v1/design-port.md`](v1/design-port.md); this file is the part that stays true.

## The rules that cost something to learn

1. **Grep `app/design-system.css` before writing markup.** Fifty tokens is more
   than anyone holds in their head, and the cost of missing one is not a bug, it
   is a duplicate that drifts.
2. **A token that sets a colour, combined with another that sets a colour, needs
   one of them in `:where()`.** `ds-link` and `ds-panel` are zero-specificity so
   `ds-text-danger` and `ds-border-danger` can override them.
3. **A label holds the label and nothing else.** Text inside a `<label>` joins
   the field's accessible name. `htmlFor` plus `aria-describedby`.
4. **An untokenised `border` inherits `currentColor`**, so it changes shade with
   whatever ink it lands in. Opacity on a container dims its border too —
   "de-emphasise" is a colour decision.
5. **A button in a flex row states its alignment; a button in a column does
   not.** `placement()` in `components/ui/button.tsx` always emits a `self-*`
   class, which is why it once overrode every parent's `items-*`.
6. **The CSS moves between repos; the fonts do not.** A missing `next/font`
   declaration falls through to a serif that looks almost deliberate.

## The type scale

All `rem`, so identical inside or outside `.ds-app`.

| Token | Size / weight |
|---|---|
| `ds-type-title` | 1.25rem / 600 / display |
| `ds-type-heading` | 1.125rem / 600 |
| `ds-type-metric` | 1.5rem / 600 / tabular-nums / display |
| `ds-type-label` | 0.875rem / 500 |
| `ds-type-note` | 0.75rem |

**`ds-type-body` does not exist, on purpose.** `.ds-app` sets 14px as the
inherited base. A body token would be a second name for "do nothing".

**`.ds-app` is only on the app shell.** Landing, legal, auth, join and support
sit outside `(app)` and must apply it themselves, or they render at the root
16px — close enough to look intentional and wrong enough that the scale stops
matching the rest of the product.

## The standing checks

```
node scripts/design-audit.mjs               # the class-level check
node scripts/mock-diff.mjs ../solarity-ui   # the design-level check
node scripts/mock-diff.mjs ../solarity-ui --screen settings
```

### `design-audit.mjs` — three questions

1. **Does every `ds-*` class exist?** Caught `ds-type-body`.
2. **Does every CSS variable resolve?** Scans CSS *and* `next/font` declarations
   in `.tsx`. Caught Fraunces.
3. **How much pre-design markup is left, and where?** With a declared-exceptions
   map, so an exception is a decision with a name rather than a silent pass.

**`font-medium` is not flagged; `font-semibold` and `font-bold` are.** The
scale's tokens are size-and-weight *roles*. A heading weight never appears
without a size, so those two always indicate an unconverted heading.
`font-medium` is emphasis mid-sentence, where `ds-type-label` would wrongly
change the size — and the scale has no weight-only token, and should not grow
one.

### `mock-diff.mjs` — the question no other check asks

`design-audit.mjs` proves every class **exists**. It has never once proved the
**right** one was used. This runs mock → implementation, using the `Sources:`
block in each mock header, and asks what the design decided that the port did
not carry.

**Read the output with judgement.** Findings fall into five classes, and only
the last is actionable:

- **A token owned by an extracted component.** `PrimaryButton` emits
  `ds-cta ds-bg-flame ds-text-on-light ds-type-label`; `Field` emits `ds-field`.
  The screen names none of them. **The check cannot see through a component
  boundary**, and this is permanent — a flat mock against a composed
  implementation will always report this.
- **Sample data.** `Ana`, `Ben`, `Morning crew`, `you@example.com`.
- **A stale `Sources:` header.** Fix it in `solarity-ui`; this is now the
  limiting factor on the check's precision.
- **A string in a comment.** The script strips comments before scanning because
  **this codebase quotes its own class names in prose** — a hand-grep will find
  `ds-text-danger` inside a comment arguing against using it.
- **A genuine gap.** A question, not a defect: *did we decide against this, or
  miss it?* Both answers are fine; the second gets fixed, the first gets a
  comment saying so.

**A checker that guesses which findings to hide is one you stop trusting**, so
none of this is suppressed. But `NOT CHECKED` is different from clean: the
script prints unresolved sources, counts them, and exits non-zero, because a
green report that skipped a third of its subjects is worse than a red one.

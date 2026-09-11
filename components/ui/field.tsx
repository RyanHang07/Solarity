import type { InputHTMLAttributes, ReactNode } from "react"

/* ------------------------------------------------------------------ *
 * A labelled input, and the one place the mock could not be copied.
 *
 * The catalog's `Field` is `readOnly` with a `defaultValue`, because a mock
 * that submitted anything would be lying about what it is. The real one has to
 * carry `name`, `required`, `autoComplete` and everything else a form needs, so
 * this takes the mock's *markup* and none of its props.
 *
 * ## The label does not wrap the input, and `password-fields.tsx` is why
 *
 * Wrapping is the shorter way to lay a field out and it is a trap, which that
 * file found the expensive way: **a `<label>` contributes *all* its text to the
 * accessible name**, so a hint inside one renamed the field to "Password At
 * least 8 characters, with a letter and a number." — announced as the name and
 * then again as the description, and nameable by no locator a person would
 * write.
 *
 * The first draft of this component reintroduced exactly that. So: `htmlFor`
 * and an `id`, the label holds the label and nothing else, and `hint` is a
 * sibling wired with `aria-describedby` — described rather than named, because
 * a field should not be renamed by carrying a rule.
 *
 * **The id defaults to `name`**, which is deterministic across server and
 * client (a `useId` would force this to be a client component for nothing) and
 * unique because two inputs sharing a `name` in one form is already a bug.
 * Pass `id` explicitly if a form ever renders twice on one page.
 * ------------------------------------------------------------------ */

type FieldProps = {
  label: string
  /** Announced with the field, never as part of its name. */
  hint?: ReactNode
  /** Keep the label for a screen reader, drop it on screen. */
  labelHidden?: boolean
  /** Sits at the label's right edge — a "Show password" toggle, a char count. */
  aside?: ReactNode
} & InputHTMLAttributes<HTMLInputElement>

export const Field = ({
  label,
  hint,
  labelHidden = false,
  aside,
  className = "",
  id,
  ...input
}: FieldProps) => {
  const fieldId = id ?? input.name
  const hintId = hint ? `${fieldId}-hint` : undefined

  return (
    <div className="flex flex-col gap-1.5">
      <div className={aside ? "flex items-baseline justify-between gap-3" : ""}>
        <label
          htmlFor={fieldId}
          className={labelHidden ? "sr-only" : "ds-type-label ds-text-muted"}
        >
          {label}
        </label>
        {aside}
      </div>

      <input
        {...input}
        id={fieldId}
        aria-describedby={
          [hintId, input["aria-describedby"]].filter(Boolean).join(" ") ||
          undefined
        }
        className={`ds-field ${className}`}
      />

      {hint ? (
        <span id={hintId} className="ds-type-note ds-text-muted">
          {hint}
        </span>
      ) : null}
    </div>
  )
}

/**
 * A labelled select.
 *
 * **The same `ds-field` as an input, because a select *is* one.** Both were
 * carrying an identical `rounded border px-3 py-2 text-sm` string and would
 * have drifted the moment either changed. The arrow stays the browser's:
 * drawing our own means owning it on five platforms for no gain.
 *
 * ## It takes `children`, not an `options` array, on purpose
 *
 * The obvious API is `options={[...]}` with a `placeholder` prop, and it is the
 * wrong one here. **The placeholder option must not be `disabled`** — iOS
 * renders a `<select>` as a wheel and skips disabled options entirely, so a
 * disabled placeholder opens the wheel on the first real category while the
 * element's value is still `""`; tapping Done moves nothing, fires no `change`,
 * and submits empty. The picker says one thing and the form says another, which
 * reads as the selection not working.
 *
 * That has been shipped twice in this codebase — once on the dashboard, then
 * again on the first-goal screen, which is the one nobody can skip and the one
 * most likely to be met on a phone. A prop would hide the decision inside this
 * file; children keep it at the call site next to the comment explaining it.
 */
export const Select = ({
  label,
  hint,
  labelHidden = false,
  className = "",
  id,
  children,
  ...select
}: {
  label: string
  hint?: ReactNode
  labelHidden?: boolean
} & React.SelectHTMLAttributes<HTMLSelectElement>) => {
  const fieldId = id ?? select.name
  const hintId = hint ? `${fieldId}-hint` : undefined

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={fieldId}
        className={labelHidden ? "sr-only" : "ds-type-label ds-text-muted"}
      >
        {label}
      </label>

      <select
        {...select}
        id={fieldId}
        aria-describedby={hintId}
        className={`ds-field ${className}`}
      >
        {children}
      </select>

      {hint ? (
        <span id={hintId} className="ds-type-note ds-text-muted">
          {hint}
        </span>
      ) : null}
    </div>
  )
}

/**
 * A validation message.
 *
 * **A `<p>` because that is valid here, not because a locator requires one.**
 * `e2e/ui.ts` matches `:is(p, span, li)[role="alert"]` with non-space text —
 * the tag list steps around Next's dev overlay, and the non-space check is what
 * actually does the work.
 *
 * That list used to be `p` alone, and three screens had to break it: inside a
 * `<form>`'s phrasing context or a `<ul>`, a `<p>` is invalid nesting, so
 * `report-checkin.tsx`, `today-roster.tsx` and `photo-button.tsx` each render a
 * `<span>` or `<li>` instead. **Choose the element the parent permits and add
 * the tag to the helper** — never the other way round.
 *
 * `ds-text-danger` rather than `text-red-600`: the Tailwind red measured 3.76:1
 * on the abyss, under the 4.5 small text needs. An error is the one string on a
 * screen that must never be the hard one to read.
 */
export const FormError = ({ children }: { children: ReactNode }) => (
  <p role="alert" className="ds-text-danger ds-type-note">
    {children}
  </p>
)

/** A hairline above a closing note, replacing six copies of `border-t pt-4`. */
export const CardFoot = ({ children }: { children: ReactNode }) => (
  <div className="ds-border-oatmeal flex flex-col gap-2 border-t pt-4">
    {children}
  </div>
)

/**
 * "or", between two ways to sign in.
 *
 * **A wrapper over `ds-or`, which already existed and which I rewrote by hand
 * before finding it.** The first version of this was three elements and two
 * `h-px flex-1` spans — the exact markup `ds-or` was created to delete, and it
 * would have shipped as a second implementation of a token the system already
 * owns.
 *
 * The token is better than the hand-rolled version, which is the useful part:
 * the rules are `::before`/`::after`, so there are no spans to keep in sync,
 * and each fades *into* the word from its own side rather than being a flat
 * line at the text's opacity.
 *
 * **The lesson for the rest of the port: grep `design-system.css` before
 * writing markup.** Fifty tokens is more than anyone holds in their head, and
 * the cost of missing one is not a bug — it is a duplicate that drifts.
 */
export const OrRule = ({ children = "or" }: { children?: ReactNode }) => (
  <div className="ds-or ds-text-muted ds-type-note">{children}</div>
)

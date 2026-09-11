import type { ReactNode } from "react"

/* ------------------------------------------------------------------ *
 * The two buttons.
 *
 * ## `align` exists because a hardcoded default was a bug
 *
 * These carried `self-start` unconditionally in solarity-ui, which silently
 * overrode every parent's `items-*`: a Save beside a labelled field aligned to
 * the *label* rather than the input, and a centred card's button sat left of
 * everything else in it. Both looked like spacing mistakes and were one
 * hardcoded alignment.
 *
 * `inline` implies `end`, because a button standing next to a labelled field
 * wants its bottom on the input's bottom.
 * ------------------------------------------------------------------ */

/**
 * **The layout props are destructured out and everything else is spread**, and
 * the first version of this did neither.
 *
 * It typed exactly `children`, `full`, `inline`, `align`, `type`, `disabled`
 * and `className`, and passed none of the rest through — so an `onClick` was a
 * type error at the call site and, had the type been loosened without the
 * spread, would have been dropped onto the floor: a button that renders
 * perfectly and does nothing. The onboarding nudges are three buttons whose
 * whole job is `router.push`, which is where this surfaced.
 *
 * `full`, `inline` and `align` must not reach the DOM — React would warn about
 * unrecognised attributes and `inline` in particular would collide with
 * `data-inline`, which the stylesheet actually reads.
 */
type ButtonProps = {
  children: ReactNode
  /** Fill the container. Wins over `align`. */
  full?: boolean
  /**
   * Match `--ds-control-height` so the button lines up with a field beside it.
   * Without it a `py-2.5` button is 4px taller than the input it sits next to,
   * which reads as a row that is slightly wrong rather than as a measurement.
   */
  inline?: boolean
  /** Cross-axis placement inside a flex parent. */
  align?: "start" | "center" | "end"
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className"> & {
    className?: string
  }

const placement = ({
  full,
  inline,
  align,
}: Pick<ButtonProps, "full" | "inline" | "align">) =>
  full
    ? "w-full"
    : align === "center"
      ? "self-center"
      : align === "end" || inline
        ? "self-end"
        : "self-start"

/**
 * The screen's one action.
 *
 * Flame on abyss ink — the same button the landing page closes with, so
 * somebody who pressed "Sign up" there meets the identical control here.
 *
 * **There is no `disabled ? "opacity-50"` here, and there used to be.**
 * `.ds-cta:disabled` already sets `opacity: 0.45` with a grayscale and
 * brightness knock-back, and it outranks a bare `.opacity-50` on specificity —
 * so the Tailwind class was dead, at a *different* value, looking exactly like
 * the thing doing the work. That is the cascade-order bug in its harmless form,
 * and the harmless form is how you learn to recognise the harmful one.
 */
export const PrimaryButton = ({
  children,
  type = "button",
  disabled,
  className = "",
  full,
  inline,
  align,
  ...rest
}: ButtonProps) => (
  <button
    {...rest}
    type={type}
    disabled={disabled}
    className={`ds-cta ds-bg-flame ds-text-on-light ds-type-label px-4 ${
      inline ? "" : "py-2.5"
    } ${placement({ full, inline, align })} ${className}`}
    data-inline={inline ? "" : undefined}
    style={{ ["--ds-cta-min" as string]: "auto" }}
  >
    {children}
  </button>
)

/** A second way in, or a step back. Never competes with the primary. */
export const SecondaryButton = ({
  children,
  type = "button",
  disabled,
  className = "",
  full,
  inline,
  align,
  ...rest
}: ButtonProps) => (
  <button
    {...rest}
    type={type}
    disabled={disabled}
    className={`ds-cta ds-panel ds-type-label ds-text-primary px-4 ${
      inline ? "" : "py-2.5"
    } ${placement({ full, inline, align })} ${className}`}
    data-inline={inline ? "" : undefined}
    style={{ ["--ds-cta-min" as string]: "auto" }}
  >
    {children}
  </button>
)

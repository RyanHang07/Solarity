import type { InputHTMLAttributes, ReactNode } from "react"

/* ------------------------------------------------------------------ *
 * Checkbox and radio.
 *
 * ## `ds-check` is `accent-color` and almost nothing else, on purpose
 *
 * The tempting move is a custom control — hide the input, draw a div, wire
 * `aria-checked` — which buys a shape and costs the entire native contract:
 * keyboard behaviour, form participation, the OS focus ring, screen-reader
 * announcement, and the tick animation people already know. None of that is
 * worth a rounder corner.
 *
 * It also sets `color-scheme: dark`, without which an *unchecked* box renders
 * as a light control on a dark card — the same class of bug `globals.css`
 * already carries a fix for on `<input type="date">`.
 *
 * ## These are why settings was missing fifteen strings
 *
 * The gap audit's central finding: `settings-forms.tsx` is a column of
 * checkboxes and radios, the design system had neither, and a mock cannot draw
 * a control that does not exist — so those sections were quietly never
 * designed. Nothing flagged it, because the screen still looked finished. It
 * looked finished because everything on it was made of things that had been
 * built.
 * ------------------------------------------------------------------ */

/**
 * A checkbox with its label, and optionally the line under it explaining what
 * turning it on actually does.
 *
 * **The label wraps the input here, and that is safe** — it contains the label
 * text and nothing else, so the accessible name is exactly the label. `note` is
 * a sibling, wired with `aria-describedby`, for the same reason `Field` keeps
 * its hint outside: a control should not be *renamed* by its explanation.
 */
export const Checkbox = ({
  label,
  note,
  id,
  className = "",
  ...input
}: {
  label: string
  note?: ReactNode
} & InputHTMLAttributes<HTMLInputElement>) => {
  const fieldId = id ?? input.name
  const noteId = note ? `${fieldId}-note` : undefined

  return (
    <div className="flex flex-col gap-1">
      <label className="flex items-center gap-2.5">
        <input
          {...input}
          id={fieldId}
          type="checkbox"
          aria-describedby={noteId}
          className={`ds-check ${className}`}
        />
        <span className="ds-text-primary">{label}</span>
      </label>
      {note ? (
        /*
          Indented to the label's text rather than the row's edge, so the
          explanation reads as belonging to the thing above it instead of
          starting a new line of argument. `1.625rem` is the box plus its gap.
        */
        <p id={noteId} className="ds-type-note ds-text-muted pl-[1.625rem]">
          {note}
        </p>
      ) : null}
    </div>
  )
}

export type RadioOption = {
  value: string
  label: string
  /** The line under this option. Each choice can explain itself. */
  note?: ReactNode
}

/**
 * A radio group.
 *
 * **Not a `Segment`.** The segmented switch means "two readings of one screen";
 * these are settings with three or more values, at least one of which ("Never")
 * is a sentence rather than a word. A radio column also lets each option carry
 * its own explanation, which the check-in frequency needs and a segment has
 * nowhere to put.
 *
 * **A real `<fieldset>` and `<legend>`.** That is what gives the group a name a
 * screen reader announces once, rather than repeating it into every option's
 * label — and it is free, where an `aria-labelledby` arrangement is three
 * attributes that can drift.
 */
export const RadioGroup = ({
  legend,
  name,
  options,
  value,
  onChange,
}: {
  legend: string
  name: string
  options: readonly RadioOption[]
  /** Uncontrolled: this seeds `defaultChecked`, so the form owns the state. */
  value?: string
  onChange?: (value: string) => void
}) => (
  <fieldset className="flex flex-col gap-2">
    <legend className="ds-type-label ds-text-muted mb-1">{legend}</legend>
    {options.map((option) => {
      const noteId = option.note ? `${name}-${option.value}-note` : undefined
      return (
        <div key={option.value} className="flex flex-col gap-1">
          <label className="flex items-center gap-2.5">
            <input
              type="radio"
              name={name}
              value={option.value}
              defaultChecked={option.value === value}
              onChange={onChange ? () => onChange(option.value) : undefined}
              aria-describedby={noteId}
              className="ds-check"
            />
            <span className="ds-text-primary">{option.label}</span>
          </label>
          {option.note ? (
            <p id={noteId} className="ds-type-note ds-text-muted pl-[1.625rem]">
              {option.note}
            </p>
          ) : null}
        </div>
      )
    })}
  </fieldset>
)

/* ------------------------------------------------------------------ *
 * Edge and corner accents.
 *
 * The styling lives in `app/design-system.css` under `ds-corner` and
 * `ds-ticks`; these are the placement, and the reason they are components
 * rather than classes is that placement is the only decision worth repeating.
 *
 * ## Where the shape comes from
 *
 * The scene draws circles. `ds-rule` is one seen edge-on. These are the third
 * view — the marks *around* a circle: registration crosses, measure ticks, the
 * brackets on an instrument bezel. That gives a section a way to declare its
 * edge without a border, which is what turned the first version of the landing
 * page into a grid of cards.
 * ------------------------------------------------------------------ */

export type CornerPosition = "tl" | "tr" | "br" | "bl"

const ALL: CornerPosition[] = ["tl", "tr", "br", "bl"]

export type CornersProps = {
  /**
   * Which corners to mark. Defaults to the diagonal pair.
   *
   * **Two, not four, and it is the difference between a frame and a HUD.**
   * Opposite corners imply a rectangle without drawing one; all four state it,
   * and a stated rectangle is a card. Four is available for the one or two
   * places that genuinely want to feel instrumented.
   */
  at?: CornerPosition[]
  /** Marks the single corner that carries heat. Everything else is oatmeal. */
  accent?: CornerPosition
  /** Bracket arm length. The default suits a section; smaller suits a chip. */
  size?: number
  /**
   * Sit on the text column's margin rather than the true edge of the box.
   *
   * **Two kinds of edge, and they are not interchangeable.** A mark at the true
   * edge belongs to the *viewport*; a mark on the gutter line belongs to the
   * *writing*, because it measures the same column the words are set in.
   * Corners drawn around a block of copy are the second kind — at the true edge
   * they look stuck to the browser rather than drawn around the thing.
   *
   * The offset is `--ds-gutter`, the same variable the layout's padding uses,
   * so the two cannot drift.
   */
  inset?: boolean
  className?: string
}

export const Corners = ({
  at = ["tl", "br"],
  accent,
  size,
  inset = false,
  className = "",
}: CornersProps) => (
  <>
    {ALL.filter((position) => at.includes(position)).map((position) => (
      <span
        key={position}
        aria-hidden
        className={`ds-corner ${className}`}
        data-ds="ds-corner"
        data-corner={position}
        data-inset={inset ? "" : undefined}
        data-accent={accent === position ? "flame" : undefined}
        style={size ? { ["--ds-corner-size" as string]: `${size}px` } : undefined}
      />
    ))}
  </>
)

export type TicksProps = {
  direction?: "horizontal" | "vertical"
  /**
   * Which end of the rule dissolves.
   *
   * `end` (the default) is an edge anchored to the left margin and continuing
   * off the right. `start` is a rule that *arrives* somewhere — it emerges
   * from empty space and is at full strength where it makes contact. `both`
   * belongs to neither side.
   */
  fade?: "start" | "end" | "both"
  className?: string
}

/**
 * A ruled edge.
 *
 * **The orbit's dots, flattened.** The scene draws every path as points rather
 * than a line — WebGL ignores line width — so a ruled edge made of repeating
 * marks is that same gesture in two dimensions. A dashed border would read as
 * a stylistic choice; this reads as the same object.
 */
export const Ticks = ({
  direction = "horizontal",
  fade = "end",
  className = "",
}: TicksProps) => (
  <span
    aria-hidden
    className={`ds-ticks block ${className}`}
    data-ds="ds-ticks"
    data-direction={direction === "vertical" ? "vertical" : undefined}
    data-fade={fade === "end" ? undefined : fade}
  />
)

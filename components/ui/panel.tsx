import type { ReactNode } from "react"
import { Corners } from "@/components/marks/accents"

/**
 * The container a screen groups content into.
 *
 * **Corners rather than a heavier border.** The card already declares its edge
 * with a hairline and a fill; adding weight to that line would make a screen of
 * three cards read as a table. The bracket marks say *this is a region* without
 * drawing a second rectangle over the first — the same reason the landing page
 * dropped its bordered panels for hairlines and corners.
 *
 * `accent` spends the one flame mark on the card that matters most on the
 * screen, and it is deliberately not the default. One per screen, or it stops
 * meaning anything.
 */
export const Panel = ({
  title,
  note,
  action,
  accent = false,
  padded = true,
  className = "",
  children,
  ...rest
}: {
  title?: string
  note?: string
  /** Sits opposite the title — a count, a metric, a link out. */
  action?: ReactNode
  accent?: boolean
  /** Off when the children supply their own padding, e.g. full-bleed rows. */
  padded?: boolean
  className?: string
  children: ReactNode
} & Omit<React.HTMLAttributes<HTMLElement>, "title">) => (
  <section
    className={`ds-card relative ${padded ? "p-4" : ""} ${className}`}
    {...rest}
  >
    <Corners
      at={accent ? ["tl", "tr", "br", "bl"] : ["tl", "br"]}
      accent={accent ? "tl" : undefined}
      size={12}
    />
    {title ? (
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <h2 className="ds-type-heading ds-text-primary">{title}</h2>
          {note ? <p className="ds-type-note ds-text-muted">{note}</p> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    ) : null}
    {children}
  </section>
)

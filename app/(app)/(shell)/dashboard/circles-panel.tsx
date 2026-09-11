import Link from "next/link"
import { Panel } from "@/components/ui/panel"
import { CreateCircleForm } from "./create-circle-form"

export type CircleRow = {
  group_id: string
  role: string
  groups: { name: string; group_status: string } | null
}

/**
 * The `Circles` tab: the list, the create form, and retired Circles beneath.
 *
 * Moved off Overview wholesale in 8f-1. No behaviour changed; it is the same
 * markup under a tab.
 *
 * **The create form stays inside this panel rather than on Overview.** A new
 * account has no Circles, so if the form lived elsewhere this tab would render
 * as an empty page with no way out of it, which reads as broken rather than as
 * new.
 */
export function CirclesPanel({
  active,
  inactive,
}: {
  active: CircleRow[]
  inactive: CircleRow[]
}) {
  // The heading has to name what is actually in the list. `locked` lands here
  // too, and a Circle awaiting a renewal decision filed under "Archived" reads
  // as retired, which is the opposite of "needs your attention".
  const hasLocked = inactive.some((m) => m.groups?.group_status === "locked")
  const inactiveLabel = hasLocked ? "Locked and archived" : "Archived"

  return (
    /*
      `aria-label` and the visible heading say the same thing here, unlike the
      digest panel. Both stay: `Panel` renders the `<h2>` and passes the label
      through to the `<section>`, and `dashboard.spec.ts` locates the region by
      name.
    */
    <Panel title="Your Circles" aria-label="Your Circles">
      <div className="flex flex-col gap-4">
        <CreateCircleForm />

        {!active.length ? (
          <p className="ds-text-muted">
            No active Circles yet. Start one above.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {active.map((m) => (
              <li key={m.group_id} className="ds-panel">
                {/*
                  `items-center`: the name can wrap on a narrow phone and the
                  role chip should stay level with it rather than pinning to the
                  top of a two-line row. `justify-between` was setting the main
                  axis and nothing was setting the cross one.
                */}
                <Link
                  href={`/circles/${m.group_id}`}
                  className="ds-text-primary flex items-center justify-between gap-3 px-3 py-2"
                >
                  <span>{m.groups?.name}</span>
                  <span className="ds-type-note ds-text-muted">{m.role}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {inactive.length ? (
          <details>
            <summary className="ds-link cursor-pointer">
              {inactiveLabel} ({inactive.length})
            </summary>
            <ul className="mt-2 flex flex-col gap-2">
              {inactive.map((m) => (
                /*
                  **Muted ink rather than `opacity-60` on the whole row.** The
                  opacity dimmed the hairline as well, so a retired Circle's box
                  half-disappeared and the list looked like it had gaps in it.
                  Colouring the text says "past" without dissolving the
                  structure.
                */
                <li key={m.group_id} className="ds-panel">
                  <Link
                    href={`/circles/${m.group_id}`}
                    className="ds-text-muted flex items-center justify-between gap-3 px-3 py-2"
                  >
                    <span>{m.groups?.name}</span>
                    <span className="ds-type-note">
                      {m.groups?.group_status}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </details>
        ) : null}
      </div>
    </Panel>
  )
}

import { formatDay } from "@/lib/digest-days"

/**
 * Step 20i. What a day looks like, shown rather than described.
 *
 * ## Why this is a rendered component and not a screenshot
 *
 * The daily-batched model is the least obvious thing about the product: nothing
 * is live, everybody's day is summarised once, and you read it the next
 * morning. That is much weaker in prose than on screen — and a screenshot goes
 * stale the first time the digest changes, silently, in the one place a visitor
 * is deciding whether to trust the description.
 *
 * ## It deliberately does not import `DigestPanel`
 *
 * The real panel takes `DigestDay[]`, a viewer id and a `today`, all of which
 * would have to be faked here, and it renders `<details>` elements holding a
 * roll call this page has no room for. Reusing it would couple a marketing page
 * to a component that answers to the dashboard, and the first change to either
 * would break the other.
 *
 * **`formatDay` is shared**, because the date format is the part a reader
 * compares against what they later see, and two ways of writing "Yesterday"
 * would be a small visible lie.
 */
const EXAMPLE = {
  circle: "Morning Runners",
  done: 3,
  total: 4,
  members: [
    { name: "you", finished: true },
    { name: "priya", finished: true },
    { name: "sam", finished: true },
    { name: "alex", finished: false },
  ],
}

export function ExampleDigest() {
  // A fixed date rather than `new Date()`: this is an illustration, and a
  // component that renders differently on every request is one that cannot be
  // reasoned about or snapshotted.
  const day = formatDay("2026-08-31")

  return (
    /*
      **Drawn the same way `DigestPanel` draws a day box**, deliberately: an
      eyebrow date, a circle line with its count, a roll call, a streak note.
      The whole point of shipping a component rather than a screenshot is that a
      visitor recognises this the first time they open the real thing, so the
      two have to keep looking alike even though they share no code.

      **Sized for the landing column, not the dashboard.** Padding, type, and
      gaps grow with the viewport so the box can hold the right half of a wide
      band without reading as a thumbnail floating in empty space. The shape
      stays the same — only the scale changes.
    */
    <div
      aria-label="An example day"
      className="ds-panel flex w-full flex-col gap-[clamp(0.5rem,1.4vw,1.1rem)] px-[clamp(0.85rem,2.4vw,1.75rem)] py-[clamp(0.85rem,2.4vw,1.85rem)]"
    >
      <h3 className="ds-eyebrow text-[clamp(0.6875rem,1.1vw,0.8125rem)]">
        {day}
      </h3>

      <div className="flex items-baseline justify-between gap-4">
        <span className="ds-font-body ds-text-primary text-[clamp(1.05rem,2.2vw,1.55rem)] font-medium tracking-[-0.01em]">
          {EXAMPLE.circle}
        </span>
        <span className="ds-font-body ds-text-primary shrink-0 text-[clamp(0.9rem,1.6vw,1.15rem)] opacity-70">
          {EXAMPLE.done} of {EXAMPLE.total} finished
        </span>
      </div>

      <ul className="ds-font-body flex flex-col gap-[clamp(0.2rem,0.6vw,0.45rem)] text-[clamp(0.95rem,1.7vw,1.2rem)] leading-relaxed">
        {EXAMPLE.members.map((m) => (
          <li key={m.name} className="flex items-baseline gap-2.5">
            {/*
              Flame for a finished day, muted for an unfinished one — the same
              pairing the roster uses. The glyph carries no meaning on its own,
              which is what the `sr-only` word beside it is for.
            */}
            <span
              aria-hidden
              className={m.finished ? "ds-text-flame" : "ds-text-primary opacity-45"}
            >
              {m.finished ? "✓" : "✗"}
            </span>
            <span className="sr-only">
              {m.finished ? "finished" : "did not finish"}
            </span>
            <span
              className={
                m.finished
                  ? "ds-text-primary"
                  : "ds-text-primary opacity-55"
              }
            >
              {m.name}
            </span>
          </li>
        ))}
      </ul>

      <p className="ds-font-body ds-text-primary text-[clamp(0.85rem,1.4vw,1.05rem)] opacity-70">
        Group streak 6 · up from yesterday
      </p>
    </div>
  )
}

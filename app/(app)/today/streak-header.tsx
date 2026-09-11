/**
 * 9c. Where you stand, before you check anything off.
 *
 * Three states, and the third is the reason this is not one line of JSX:
 *
 * | State | Shown |
 * |---|---|
 * | A live run | the number, and that today is not counted yet |
 * | A run that just ended | **how long it was and when it ended** |
 * | Never completed a day | an invitation, not a zero |
 *
 * **A bare "0 days" is the thing to avoid.** After a fortnight it reads as a
 * bug rather than as a fact, and `user_lifetime_stats.current_streak` is
 * already 0 by the time anyone sees this: the rollover zeroed it and stored
 * nothing about what it zeroed. Both the length and the date are recovered from
 * `daily_completion` history instead. See `lastStreak`.
 */
export function StreakHeader({
  streak,
  streakIncludesToday,
  broken,
}: {
  streak: number
  streakIncludesToday: boolean
  broken: { endedOn: string; length: number } | null
}) {
  if (streak > 0) {
    return (
      <header className="flex flex-col gap-1">
        {/*
          **`ds-type-metric`, and `tabular-nums` is the reason rather than the
          size.** 9 → 10 must not shove the word beside it sideways, and every
          screen that shows a count had discovered that independently.

          Flame, because on this screen the number *is* the subject. The other
          two states below use the same token deliberately: they occupy the same
          slot, and a heading that changes size between "14 days" and "Day one"
          makes the page jump on the day a streak breaks — which is the worst
          possible day for the layout to move.
        */}
        <p className="ds-type-metric ds-text-flame">
          {streak} day{streak === 1 ? "" : "s"}
        </p>
        <p className="ds-text-muted">
          {streakIncludesToday
            ? "Today is counted. Everything below is done."
            : "Finish today's goals to keep it going."}
        </p>
      </header>
    )
  }

  if (broken) {
    return (
      <header className="flex flex-col gap-1">
        <p className="ds-type-metric ds-text-primary">Start again</p>
        <p className="ds-text-muted">
          Your {broken.length} day{broken.length === 1 ? "" : "s"} run ended on{" "}
          {formatDay(broken.endedOn)}. Today is day one of the next one.
        </p>
      </header>
    )
  }

  return (
    <header className="flex flex-col gap-1">
      <p className="ds-type-metric ds-text-primary">Day one</p>
      <p className="ds-text-muted">
        Check off everything below and your streak starts today.
      </p>
    </header>
  )
}

/**
 * `YYYY-MM-DD` read as UTC, deliberately.
 *
 * It is a check-in **date**, already resolved into the user's timezone by
 * `current_checkin_date()`. Letting the browser parse it as local time would
 * re-apply an offset and name the wrong day for anyone west of UTC — the same
 * trap `shiftDate` avoids on the server.
 */
function formatDay(date: string): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  })
}

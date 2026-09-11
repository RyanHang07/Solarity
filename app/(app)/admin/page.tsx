import Link from "next/link"
import { reportQueue, type ReportStatus } from "@/app/actions/admin"

/**
 * Step 17. The report queue.
 *
 * **Oldest first, and that is decided in the RPC.** A queue people work through
 * is not a feed: the newest report is the least likely to be the one that has
 * been waiting.
 *
 * `?status=` rather than client state, matching `/circles/[id]`: server-read,
 * deep-linkable, and an unknown value falls back to `pending` rather than
 * rendering nothing.
 */

const TABS: { key: ReportStatus; label: string }[] = [
  { key: "pending", label: "Pending" },
  { key: "reviewed", label: "Reviewed" },
  { key: "actioned", label: "Actioned" },
  { key: "dismissed", label: "Dismissed" },
]

const SAYS: Record<string, string> = {
  checkin_photo: "a check-in photo",
  checkin_note: "a check-in note",
  user_profile: "a profile",
  planet_avatar: "an avatar",
}

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams
  const active = (TABS.find((t) => t.key === status)?.key ?? "pending") as ReportStatus
  const reports = await reportQueue(active)

  return (
    <div className="flex flex-col gap-4">
      <nav className="ds-border-oatmeal flex gap-3 border-b">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/admin?status=${t.key}`}
            aria-current={active === t.key ? "page" : undefined}
            /* The same tab shape as the Circle page: flame and an underline on
               the current one, muted otherwise. */
            className={`ds-type-label px-1 pb-2 ${
              active === t.key
                ? "ds-text-flame border-b-2 border-current"
                : "ds-text-muted"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      {reports.length === 0 ? (
        // An empty queue is the good outcome and should read like one.
        <p className="ds-text-muted">Nothing {active}.</p>
      ) : (
        <ul aria-label="Reports" className="flex flex-col gap-2">
          {reports.map((r) => (
            <li key={r.id} className="ds-panel px-3 py-2">
              <Link href={`/admin/reports/${r.id}`} className="flex flex-col gap-1">
                <span className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="ds-text-primary">
                    <strong>{r.reported_username ?? "a deleted account"}</strong>
                    {" · "}
                    {SAYS[r.content_type] ?? r.content_type}
                  </span>
                  <span className="ds-type-note ds-text-muted">
                    {new Date(r.created_at).toLocaleString()}
                  </span>
                </span>

                {/* The reason, truncated. The full text is on the report page;
                    a queue is for choosing what to open. */}
                {r.reason ? (
                  <span className="ds-type-note ds-text-primary line-clamp-2">
                    {r.reason}
                  </span>
                ) : (
                  <span className="ds-type-note ds-text-muted">No reason given</span>
                )}

                <span className="ds-type-note ds-text-muted">
                  Reported by {r.reporter_username ?? "a deleted account"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

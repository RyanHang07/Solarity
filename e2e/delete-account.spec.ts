import { test, expect } from "@playwright/test"
import { admin, requireEnv, userIdByEmail } from "./db"
import { storageStateFor } from "./session"

/**
 * Step 14e. The delete-account control.
 *
 * ## What this file deliberately does not do
 *
 * **It never submits the form.** The suite runs against two real accounts, and
 * `E2E_OWNER_EMAIL` owns the storage state every other spec depends on. A
 * successful deletion would not fail one test; it would end the run and could
 * not be undone by anything in this repository.
 *
 * So the server-side confirmation check is **not** covered end to end, and it
 * would be dishonest to imply otherwise. Testing it means POSTing a deliberately
 * wrong username and asserting a refusal — which is safe only if the check
 * works, and destroys the account if it does not. That asymmetry is the reason
 * not to: a test whose failure mode is "the thing it was testing already
 * happened" is not a test.
 *
 * What is covered is the gate a person actually meets: the control is closed by
 * default, the submit stays disabled until the typed name matches exactly, and
 * cancelling puts it away. The server-side check exists because the client one
 * is a courtesy rather than a control, and it is asserted by reading the code,
 * not by running it.
 *
 * **Writes nothing.** The only database call is a read confirming the account
 * still exists at the end, which is this file's own safety net.
 */

const EMAIL = () => requireEnv("E2E_OWNER_EMAIL")

/**
 * The export the delete panel offers, actually downloaded.
 *
 * **Until now only the link's visibility was asserted**, one test below, which
 * proves an anchor exists and nothing about whether pressing it produces a file.
 * This is the feature a person uses at their angriest moment, and the one where
 * a silent failure is discovered by somebody already leaving.
 *
 * ## Why the assertions are the support page's sentences
 *
 * `/support` makes a specific, checkable promise: *"one JSON file with your
 * profile, your streaks and totals, every goal, every check-in and note, which
 * days you completed, and the Circles you're in"* — and then a second paragraph
 * naming what is **not** in it: notifications, push devices, blocks, reports,
 * and your email address.
 *
 * Both halves are worth asserting, and the second more than the first. This
 * project has run two legal-accuracy passes and the second found that step 20
 * had falsified both policy pages without anyone noticing. **A promise about
 * what a file omits is exactly the kind that rots silently**: adding a key to
 * `export_user_data` is a one-line change that makes a published sentence false,
 * and nothing else in the repository would notice.
 *
 * `page.request` rather than a click: it shares the context's cookies, so the
 * session applies, and it hands back headers a download cannot be inspected for.
 *
 * ## Why it loads `/settings` first, which is not decoration
 *
 * **A stored session is not a live one.** `storageStateFor` replays cookies from
 * `auth.setup.ts`, and Supabase's access token is short-lived; what keeps it
 * current is the middleware refreshing it on navigation. Firing a bare
 * `request.get` at the route skips every page load, so `getUser()` can meet an
 * expired token, `exportUserData` returns "Please sign in again.", and the
 * route answers **400** — which is the route behaving correctly.
 *
 * That is also the path a person takes: they are on `/settings` and they press
 * the link. Starting there tests the real sequence rather than a shortcut, and
 * it lets the same test assert the link exists rather than trusting it does.
 */
test("the data export downloads, and contains what /support promises", async ({
  browser,
}) => {
  const context = await browser.newContext({
    storageState: await storageStateFor(EMAIL()),
  })
  const page = await context.newPage()

  try {
    await page.goto("/settings")
    await expect(
      page.getByRole("link", { name: "Download your data" }),
      "the export link is not on the settings page",
    ).toBeVisible()

    const res = await page.request.get("/settings/export")

    /*
      **The body carries the reason, and the first version of this threw it
      away.** The route answers a refusal as plain text precisely so a person who
      opened the URL in a tab sees a sentence — so a test that reports only
      "expected 200, received 400" is discarding the one thing that would explain
      it, and sends the reader to the trace for a string the assertion already
      held.
    */
    const why = res.status() === 200 ? "" : `: ${(await res.text()).slice(0, 200)}`
    expect(res.status(), `the export did not return a file${why}`).toBe(200)

    const headers = res.headers()
    expect(headers["content-type"]).toContain("application/json")

    // A date-stamped attachment. Without `Content-Disposition` the browser
    // renders the JSON in a tab instead of saving it, which is not an export.
    expect(headers["content-disposition"]).toMatch(
      /attachment; filename="solarity-\d{4}-\d{2}-\d{2}\.json"/,
    )

    // Personal data that changes daily. A cached copy served to the next
    // session on a shared machine is the failure worth naming.
    expect(headers["cache-control"]).toContain("no-store")

    const body = await res.json()

    // ------------------------------------------------ what it must contain
    for (const key of [
      "exported_at",
      "profile",
      "lifetime_stats",
      "goals",
      "check_ins",
      "daily_completion",
      "circles",
    ]) {
      expect(body, `/support promises the export contains ${key}`).toHaveProperty(key)
    }

    // The collections are arrays even when empty — `coalesce(..., '[]')` in the
    // RPC — so a person with no goals gets a readable file rather than nulls.
    for (const key of ["goals", "check_ins", "daily_completion", "circles"]) {
      expect(Array.isArray(body[key]), `${key} is not an array`).toBe(true)
    }

    // ------------------------------------------------- and what it must not
    //
    // Named one by one rather than by a count of keys: a count would fail on
    // any addition, including a welcome one, and say nothing about which.
    for (const key of ["notifications", "push_subscriptions", "blocks", "reports"]) {
      expect(
        body,
        `/support says ${key} is not in the export, and it is`,
      ).not.toHaveProperty(key)
    }

    // The email lives in `auth.users` and the profile block selects named
    // columns from `public.users`, so this asserts that list has not grown.
    expect(
      JSON.stringify(body.profile ?? {}),
      "an email address reached the export, which /support says it does not",
    ).not.toContain("@")
  } finally {
    await context.close()
  }
})

test("deleting an account is closed by default and gated on typing the username", async ({
  browser,
}) => {
  const userId = await userIdByEmail(EMAIL())

  const { data: profile } = await admin
    .from("users")
    .select("username")
    .eq("id", userId)
    .single()
  const username = profile!.username!

  const context = await browser.newContext({
    storageState: await storageStateFor(EMAIL()),
  })
  const page = await context.newPage()

  try {
    await page.goto("/settings")

    const panel = page.getByRole("region", { name: "Delete your account" })
    await expect(panel).toBeVisible()

    // Closed. The confirmation field does not exist until asked for, so it
    // cannot be filled by an autofill pass or reached by a stray tab.
    await expect(panel.getByLabel(/Type .* to confirm/)).toHaveCount(0)

    await panel.getByRole("button", { name: "Delete your account" }).click()

    const field = panel.getByLabel(/Type .* to confirm/)
    await expect(field).toBeVisible()

    const submit = panel.getByRole("button", { name: "Delete my account" })
    await expect(submit, "the submit was enabled before anything was typed").toBeDisabled()

    // A near miss stays disabled. `slice(0, -1)` rather than a fixed string, so
    // this is a prefix of the real username and not merely a different word.
    await field.fill(username.slice(0, -1))
    await expect(submit, "a partial username enabled the submit").toBeDisabled()

    await field.fill(`${username}x`)
    await expect(submit, "a superset of the username enabled the submit").toBeDisabled()

    // The export offer lives inside the confirmation, where it is in front of
    // someone who has just said they are leaving.
    await expect(panel.getByRole("link", { name: /Download your data/ })).toBeVisible()

    // Exact match enables it, and this is the negative control: without it, a
    // permanently disabled button would pass every assertion above.
    await field.fill(username)
    await expect(submit, "the exact username did not enable the submit").toBeEnabled()

    // ------------------------------------------------------------------------
    // And then we do not press it. Cancel closes the panel and clears the field,
    // so the next open cannot start with a match already typed.
    // ------------------------------------------------------------------------
    await panel.getByRole("button", { name: "Cancel" }).click()
    await expect(panel.getByLabel(/Type .* to confirm/)).toHaveCount(0)

    await panel.getByRole("button", { name: "Delete your account" }).click()
    await expect(
      panel.getByRole("button", { name: "Delete my account" }),
      "cancelling left the typed username behind",
    ).toBeDisabled()
  } finally {
    await context.close()
  }

  // The safety net, asserted rather than assumed. If this file ever grows a
  // test that submits, this is what says so on the way out.
  const { data: stillThere } = await admin
    .from("users")
    .select("id")
    .eq("id", userId)
    .maybeSingle()
  expect(stillThere, "the test account was deleted").not.toBeNull()
})

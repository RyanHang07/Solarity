import { test, expect } from "@playwright/test"
import {
  admin,
  assertOk,
  circleName,
  clearRateLimits,
  createCircleViaApi,
  deleteE2ECircles,
  inviteTokenFor,
  requireEnv,
  sessionFor,
  userIdByEmail,
} from "./db"
import { checkinReference } from "@/lib/report-reference"
import { storageStateFor } from "./session"

/**
 * Steps 15d and 15e. Blocking and reporting.
 *
 * **Blocking is the one feature here whose failure is invisible.** A block that
 * silently does not apply looks exactly like a block that does, from the side
 * that matters: the person who blocked sees nothing either way. So the
 * assertions are made from **both** browsers, and at the database.
 *
 * **Writes** one block row, one Circle, and up to two reports. All removed.
 */

const OWNER = () => requireEnv("E2E_OWNER_EMAIL")
const JOINER = () => requireEnv("E2E_JOINER_EMAIL")

async function usernameOf(userId: string): Promise<string> {
  const { data, error } = await admin
    .from("users")
    .select("username")
    .eq("id", userId)
    .single()
  if (error) throw error
  return data.username!
}

async function clearBlocks(a: string, b: string) {
  await admin
    .from("user_blocks")
    .delete()
    .in("blocker_user_id", [a, b])
    .in("blocked_user_id", [a, b])
}

async function clearReports(reporterId: string) {
  await admin.from("content_reports").delete().eq("reporter_user_id", reporterId)
}

/**
 * **Every test here builds a Circle and joins it, and both are metered.**
 *
 * `createCircle` is 5 a day and `joinCircle` is 10 an hour, both keyed by the
 * two real accounts the whole suite shares; `/join/[token]` spends
 * `inviteAttempt` as well, keyed by a client IP that localhost makes identical
 * for every request. Nothing in this file re-tests those limits, so it should
 * start from a full budget the way `invite.spec.ts` does.
 *
 * Skipping it does not fail loudly. A refusal renders as an alert next to a
 * control that is still on the page, so the test reports "the block did not
 * apply" — a claim about the feature — when what happened is that the setup
 * never joined the Circle.
 */
test.beforeAll(async () => {
  await clearRateLimits()
})

test("blocking hides the profile from both sides, and settings is the way back", async ({
  browser,
}) => {
  const ownerId = await userIdByEmail(OWNER())
  const joinerId = await userIdByEmail(JOINER())
  const ownerName = await usernameOf(ownerId)
  const joinerName = await usernameOf(joinerId)

  await clearBlocks(ownerId, joinerId)

  const ownerCtx = await browser.newContext({
    storageState: await storageStateFor(OWNER()),
  })
  const joinerCtx = await browser.newContext({
    storageState: await storageStateFor(JOINER()),
  })
  const ownerPage = await ownerCtx.newPage()
  const joinerPage = await joinerCtx.newPage()

  try {
    // Both can see the other to begin with. Without this the assertions below
    // would pass on a pair who could never see each other anyway.
    await ownerPage.goto(`/profile/${joinerName}`)
    await expect(
      ownerPage.getByRole("region", { name: `${joinerName}'s profile` }),
    ).toBeVisible()

    // ---------------------------------------------------------------- block
    /**
     * **Two waits, and both exist because this test was intermittent.**
     *
     * It failed four times in one afternoon and then passed with no code
     * change. The trace said why: **no POST was ever sent**. The confirm button
     * was clicked, and the form it sits in never submitted.
     *
     * That is a hydration race. `<form action={blockAction}>` is a client
     * component form, so before React attaches, its `action` is a placeholder
     * rather than a submit target — a click lands on a real button, does
     * nothing, and reports no error. Every downstream assertion then fails
     * describing the *feature* ("the blocked profile was still rendered")
     * rather than the cause, which is what sent three separate investigations
     * at rate limits, RLS and revalidation.
     *
     * **The first wait proves hydration.** The confirm panel only exists
     * because `setConfirmingBlock(true)` ran, so seeing its copy means React is
     * attached and the form beneath it is live.
     */
    await ownerPage.getByRole("button", { name: `Block ${joinerName}` }).click()
    await expect(
      ownerPage.getByText(/Neither of you will see the other/i),
      "the block confirmation never appeared, so the page had not hydrated",
    ).toBeVisible()

    /**
     * **The second wait asserts the submit actually left the browser.**
     *
     * A server action posts to the current URL, so this is a POST to
     * `/profile/<name>`. Waiting on it turns a silent no-op into a failure at
     * the click — naming the real problem — instead of a confusing assertion
     * three steps later about a profile that should have disappeared.
     */
    await Promise.all([
      ownerPage.waitForResponse(
        (r) => r.request().method() === "POST" && r.url().includes("/profile/"),
      ),
      ownerPage.getByRole("button", { name: "Block", exact: true }).click(),
    ])

    /**
     * **Blocking takes you away from the page it just deleted.**
     *
     * `/profile/<them>` 404s the instant the block lands, so staying put meant
     * the reward for blocking somebody was Next's not-found page. The action
     * redirects to the dashboard with the app's ordinary `?notice=` instead.
     *
     * Asserted here rather than trusted, because it is the half a future
     * refactor would drop: the block would still work, and the only symptom
     * would be somebody landing on a 404 at a bad moment.
     */
    await expect(ownerPage).toHaveURL(/\/dashboard\?notice=blocked/)
    await expect(
      ownerPage.getByRole("status").filter({ hasText: /^Blocked\./ }),
      "the block notice did not render",
    ).toBeVisible()

    /**
     * The blocker's view: the profile they were just on is gone.
     *
     * **Asserted on what renders, not on the status.** These routes stream —
     * `(shell)/loading.tsx` puts a Suspense boundary above them — so the shell
     * is flushed with a 200 before `notFound()` has been reached, and the
     * not-found UI arrives inside a response that already committed. The claim
     * worth making is that no profile is shown; `profile.spec.ts` separately
     * asserts that this answer is identical to a username nobody has.
     */
    await ownerPage.goto(`/profile/${joinerName}`)
    await expect(
      ownerPage.getByRole("region", { name: `${joinerName}'s profile` }),
      "the blocked profile was still rendered",
    ).toHaveCount(0)

    /**
     * **The half that cannot be seen from the blocker's browser.** Mutual
     * invisibility means the blocked person also loses the blocker's profile,
     * and `private.is_blocked_by` — the helper the stats policy already used —
     * answers only one direction. An implementation that reused it would pass
     * every assertion above and fail this one.
     */
    await joinerPage.goto(`/profile/${ownerName}`)
    await expect(
      joinerPage.getByRole("region", { name: `${ownerName}'s profile` }),
      "the blocked person could still see the blocker's profile",
    ).toHaveCount(0)

    // --------------------------------------------------------------- unblock
    // **Settings, because the profile is exactly what blocking hid.** There is
    // no Unblock button on a page that returns 404.
    await ownerPage.goto("/settings")
    const blocked = ownerPage.getByRole("region", { name: "Blocked accounts" })
    await expect(blocked.getByText(joinerName)).toBeVisible()

    await blocked.getByRole("button", { name: "Unblock" }).click()

    await expect(
      blocked.getByText(/haven't blocked anyone/),
      "the account stayed in the blocked list after unblocking",
    ).toBeVisible()

    await ownerPage.goto(`/profile/${joinerName}`)
    await expect(
      ownerPage.getByRole("region", { name: `${joinerName}'s profile` }),
      "unblocking did not restore the profile",
    ).toBeVisible()
  } finally {
    await clearBlocks(ownerId, joinerId)
    await ownerCtx.close()
    await joinerCtx.close()
  }
})

/**
 * The report policy, through PostgREST as real users.
 *
 * `content_reports_insert_own` is three conditions at once — reporter is the
 * caller, subject is not the caller, and the two share a Circle — and a policy
 * refusal is a bare `42501` with no hint. Each is asserted separately, because
 * one broken condition in a three-part policy still refuses everything and
 * looks identical from outside.
 */
test("a report needs a shared Circle, and cannot be about yourself", async () => {
  const ownerId = await userIdByEmail(OWNER())
  const joinerId = await userIdByEmail(JOINER())
  const owner = await sessionFor(OWNER())
  const joiner = await sessionFor(JOINER())

  await clearReports(ownerId)

  try {
    // ---------------------------------------------------- about yourself
    const self = await owner.from("content_reports").insert({
      reporter_user_id: ownerId,
      reported_user_id: ownerId,
      content_type: "user_profile",
      content_reference: ownerId,
    })
    expect(self.error, "a report about yourself was accepted").not.toBeNull()

    // ------------------------------------------------- as somebody else
    // The reporter must be the caller. Forging this is how one account files
    // reports in another's name.
    const forged = await owner.from("content_reports").insert({
      reporter_user_id: joinerId,
      reported_user_id: ownerId,
      content_type: "user_profile",
      content_reference: ownerId,
    })
    expect(forged.error, "a report was filed in someone else's name").not.toBeNull()

    // ------------------------------------------------ with a shared Circle
    const created = await owner.rpc("create_circle", {
      p_name: circleName("report"),
    })
    assertOk(created, "create_circle")
    const groupId = created.data as string

    const link = await owner.rpc("create_invite_link", { p_group_id: groupId })
    assertOk(link, "create_invite_link")
    assertOk(await joiner.rpc("join_circle", { p_token: link.data as string }), "join")

    const ok = await owner
      .from("content_reports")
      .insert({
        reporter_user_id: ownerId,
        reported_user_id: joinerId,
        content_type: "user_profile",
        content_reference: joinerId,
        reason: "E2E report",
      })
      .select("id")
    expect(ok.error, "a Circle-mate could not be reported").toBeNull()
    expect(ok.data, "the report matched no rows").toHaveLength(1)

    // **The new enum value, exercised rather than assumed.** Migration 88 adds
    // it alone precisely because a value cannot be used in the transaction that
    // adds it; this is the first write that proves it took.
    const { data: row } = await admin
      .from("content_reports")
      .select("content_type, content_reference, status")
      .eq("reporter_user_id", ownerId)
      .single()
    expect(row?.content_type).toBe("user_profile")
    expect(row?.status, "a new report was not pending").toBe("pending")

    // ------------------------------------ a check-in reference is resolvable
    // The format is invented, so this asserts it round-trips into the three
    // things a moderator needs rather than trusting the string.
    const reference = checkinReference(joinerId, groupId, "2026-08-25")
    expect(reference.split("/")).toHaveLength(3)
  } finally {
    await clearReports(ownerId)
    await deleteE2ECircles()
  }
})

/**
 * Step 18a. A block hides you from the invite search too.
 *
 * **Here rather than in `invite-user.spec.ts`**, because this is a claim about
 * blocking rather than about inviting: the other guarantees blocking makes live
 * in this file, and a block that leaked through one surface while holding on
 * three is exactly the drift a scattered assertion misses.
 *
 * **One direction only, deliberately.** The joiner blocks the owner, and the
 * owner must then be unable to find the joiner. Mutual invisibility means the
 * person who blocked disappears from the blocker's view *and* the blocked
 * person's, and it is the second half that is easy to get wrong: the owner
 * never asked for this and the app has to enforce it anyway.
 */
test("a blocked account cannot be found in the invite search", async () => {
  const ownerId = await userIdByEmail(OWNER())
  const joinerId = await userIdByEmail(JOINER())
  const joinerName = await usernameOf(joinerId)

  await clearBlocks(ownerId, joinerId)
  const owner = await sessionFor(OWNER())
  const joiner = await sessionFor(JOINER())

  try {
    // The control first, and it is the whole test: without it, "the search
    // returns nothing" would pass against a search that never works.
    const before = await owner.rpc("search_users", { p_query: joinerName })
    expect(before.error, "search errored before any block existed").toBeNull()
    expect(
      (before.data ?? []).some((u) => u.id === joinerId),
      "the search could not find them before the block, so the block proves nothing",
    ).toBe(true)

    assertOk(
      await joiner
        .from("user_blocks")
        .insert({ blocker_user_id: joinerId, blocked_user_id: ownerId })
        .select("blocker_user_id"),
      "block the owner",
    )

    const after = await owner.rpc("search_users", { p_query: joinerName })
    expect(
      (after.data ?? []).some((u) => u.id === joinerId),
      "somebody who blocked you still turns up in your invite search",
    ).toBe(false)

    // And the button behind the search agrees, answered as "no such person"
    // rather than as "they blocked you". A different message here would make
    // the invite flow a detector for being blocked.
    const { groupId } = await createCircleViaApi(OWNER(), "blocked invite")
    await inviteTokenFor(OWNER(), groupId)
    const refused = await owner.rpc("invite_user_to_circle", {
      p_group_id: groupId,
      p_user_id: joinerId,
    })
    expect(
      refused.error?.hint,
      "inviting somebody who blocked you was allowed, or was refused in a way that names the block",
    ).toBe("NOT_FOUND")
  } finally {
    await clearBlocks(ownerId, joinerId)
  }
})

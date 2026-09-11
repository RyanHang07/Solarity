import { expect, type Page, type Locator } from "@playwright/test"

/**
 * Locators for things the app renders that a bare role query gets wrong.
 *
 * ## `errorAlert`, and why `getByRole("alert")` is a trap here
 *
 * **Next's dev overlay renders its own empty `alert` node on every page.** It
 * is attached before the app has done anything, so a page-wide alert query has
 * two failure modes and both of them lie:
 *
 * - When the real error *has* rendered, two nodes match and the call fails as a
 *   strict-mode violation, reported as though the page were ambiguous rather
 *   than as though the query were.
 * - When the real error has *not* rendered yet, exactly one node matches — the
 *   empty one — so nothing waits and nothing complains. `textContent()` returns
 *   `""` immediately, and an assertion on it fails with "no error shown" while
 *   the screenshot taken moments later shows the error plainly there.
 *
 * The second is how `sign-up.spec.ts` failed: the app was correct, the message
 * was on screen, and the test had read a different element entirely. `push
 * .spec.ts` had already met this and written the fix inline; the third copy is
 * what moved it here.
 *
 * **`hasText` requiring a non-space character is what actually fixes it.** An
 * alert that says nothing is not an error being shown, and that check alone
 * would have caught this without knowing the overlay existed.
 *
 * ## The tag list, and why it grew
 *
 * This used to match `p[role="alert"]` only, on the reasoning that every error
 * in the app is a paragraph and the overlay's node is not. **The design port
 * falsified that**, three times, and each one was right to:
 *
 * - `report-checkin.tsx` — inside a `<form>`'s phrasing context
 * - `today-roster.tsx` — a list item, because its parent is a `<ul>`
 * - `photo-button.tsx` — phrasing context again
 *
 * A `<p>` in any of those is invalid nesting. All three carried a comment
 * saying this helper could not see them; `photo-button.tsx` went as far as
 * "Nothing asserts on either today" and left it there. **Three error paths were
 * untestable by construction and documented rather than fixed** — the third
 * time this codebase has written the right diagnosis above code that does not
 * act on it.
 *
 * So the tag is now a list, and it is a *soft* filter: it keeps the overlay out
 * cheaply, and the emptiness check is the part that must hold. Adding a tag
 * here is fine. Narrowing the markup to suit this locator is not — the element
 * is chosen by what is valid inside its parent.
 *
 * Prefer this to `getByRole("alert")` everywhere, including inside an already
 * scoped locator: the scope makes the collision unlikely rather than
 * impossible, and the emptiness check is worth having on its own.
 */
export function errorAlert(scope: Page | Locator): Locator {
  return scope.locator(':is(p, span, li)[role="alert"]').filter({ hasText: /\S/ })
}

/**
 * Press a server-action submit and wait for the round trip it starts.
 *
 * ## The race this exists for
 *
 * **`<form action={fn}>` in a *client* component has a placeholder `action`
 * attribute until React attaches.** A click before then does nothing at all —
 * no error, no console warning, no network request. The button is visible and
 * enabled the whole time, so every locator agrees the page is ready, and the
 * failure surfaces later as an assertion timing out somewhere unrelated.
 *
 * It cost four wrong diagnoses the first time: rate limits, RLS, leftover
 * blocks, and only then the truth — from the observation *"I don't see a POST
 * at all"*. Nothing about the symptom points at hydration.
 *
 * **A form in a *server* component is not affected** and does not need this.
 * Next renders it with a real `action` attribute and hidden fields, so it
 * submits without JavaScript. `app/(app)/layout.tsx`'s sign-out and
 * `today/page.tsx`'s leave button are both in that category. The distinction is
 * the whole diagnosis; using this helper where it is not needed is harmless but
 * the comment it deserves is different.
 *
 * ## Why waiting on the response, and not on the effect
 *
 * The obvious alternative is to click and then assert on whatever the action
 * changes. That works when it works, and when it does not it reports the
 * *consequence* as missing rather than the request as never sent — which is
 * exactly the misdirection above. Waiting on the POST fails at the right place
 * with the right message.
 *
 * `urlPart` narrows which POST, for pages that fire more than one. Omit it and
 * any POST satisfies the wait, which is right for a page with a single form.
 */
export async function submitAndWait(
  page: Page,
  button: Locator,
  urlPart?: string,
) {
  /*
    Enabled, not merely visible. A `useFormStatus` submit is disabled while a
    previous submission is in flight, and clicking a disabled button is a
    silent no-op that reproduces the very bug this helper prevents.
  */
  await expect(button, "the submit was not clickable").toBeEnabled()

  await Promise.all([
    page.waitForResponse(
      (r) =>
        r.request().method() === "POST" &&
        (urlPart === undefined || r.url().includes(urlPart)),
    ),
    button.click(),
  ])
}

"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import { inviteUser, searchUsers, type FoundUser } from "@/app/actions/invites"
import { Avatar } from "@/components/avatar"
import { SecondaryButton } from "@/components/ui/button"
import { FormError } from "@/components/ui/field"

/** Matches the floor in `search_users`. Named once so the copy and the query agree. */
const MIN_QUERY = 3

/**
 * Step 18a and 18b. Find a person, put an invite in front of them.
 *
 * ## Why this is a search box and not a "share this link" button
 *
 * The link already exists and is right below this. What it cannot do is reach
 * somebody: it has to be carried into a messaging app and pasted, which means
 * the one flow that adds a person leaves the product to do it. Solarity knows
 * who its users are.
 *
 * ## Debounced, and the delay is the rate limit's friend
 *
 * Every keystroke is a database round trip and a token off an hourly budget, so
 * a 300ms pause is what separates "typing a handle" from "walking the user
 * table". Short enough to feel immediate; long enough that a nine-character
 * username costs one call rather than nine.
 *
 * ## The three-character floor is stated, not enforced here
 *
 * `search_users` returns nothing under three characters whatever this file
 * does. The message below explains the empty result rather than causing it: a
 * client-side check is a suggestion, and this one would be the second copy of a
 * rule that already lives where the rows are.
 *
 * ## Results are stale-guarded by request, not by keystroke
 *
 * A slow response for "ry" must not land after a fast one for "ryan". Each
 * search carries a sequence number and anything but the newest is dropped, the
 * same reason `avatar-form.tsx` keeps its own busy flag.
 */
export function InvitePersonPanel({ groupId }: { groupId: string }) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<FoundUser[] | null>(null)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [searching, startSearch] = useTransition()

  // Which row is mid-invite, and what happened to the ones that finished.
  const [inviting, setInviting] = useState<string | null>(null)
  const [invited, setInvited] = useState<Record<string, string>>({})
  const [failed, setFailed] = useState<Record<string, string>>({})

  const latest = useRef(0)

  /**
   * **Derived, not stored, and the lint rule was right to insist.**
   *
   * The first version cleared `results` and `searchError` inside the effect
   * when the query got too short, which is a `setState` in an effect body and
   * therefore a second render pass for something already knowable from
   * `query`. Deleting to three characters now simply stops rendering the list;
   * nothing is written to state to make that happen.
   */
  const tooShort = query.trim().length < MIN_QUERY

  useEffect(() => {
    const q = query.trim()
    if (q.length < MIN_QUERY) return

    const seq = ++latest.current
    const timer = setTimeout(() => {
      startSearch(async () => {
        const result = await searchUsers(q, groupId)
        // Dropped rather than rendered: this answer is for a query the person
        // has already typed past.
        if (seq !== latest.current) return

        if (!result.ok) {
          setSearchError(result.error)
          setResults([])
          return
        }
        setSearchError(null)
        setResults(result.data)
      })
    }, 300)

    return () => clearTimeout(timer)
  }, [query, groupId])

  async function invite(user: FoundUser) {
    setInviting(user.id)
    setFailed((f) => {
      const next = { ...f }
      delete next[user.id]
      return next
    })

    const result = await inviteUser(groupId, user.id)
    setInviting(null)

    if (result.ok) {
      // **Kept in place rather than removed from the list.** Somebody who has
      // just invited three people wants to see that they did; a row that
      // vanishes on success looks like it failed.
      setInvited((i) => ({ ...i, [user.id]: user.username }))
    } else {
      setFailed((f) => ({ ...f, [user.id]: result.error }))
    }
  }

  return (
    <section aria-labelledby="invite-person" className="flex flex-col gap-3">
      <h2 id="invite-person" className="ds-type-heading ds-text-primary">
        Invite someone
      </h2>
      <p className="ds-text-muted">
        Search by username. They get a notification with the invite in it.
      </p>

      {/*
        **The app's only live search**, and the field whose missing results list
        set off the whole gap audit: the mock drew the input with nothing under
        it, which is what a search box looks like when it does not work.

        The label is `sr-only` rather than absent. A placeholder is not a label
        — it disappears the moment anybody types, which is exactly when somebody
        using a screen reader would want to know what the field is.
      */}
      <label htmlFor="invite-search" className="sr-only">
        Search by username
      </label>
      <input
        id="invite-search"
        type="search"
        autoComplete="off"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="username"
        className="ds-field"
      />

      {/*
        Said before the search runs rather than after it returns nothing, so the
        floor reads as a rule and not as "there is nobody called ry".
      */}
      {query.trim().length > 0 && tooShort ? (
        <p className="ds-type-note ds-text-muted">
          Type at least {MIN_QUERY} characters.
        </p>
      ) : null}

      {/*
        `role="status"` on both transient lines. A search that is running and a
        search that found nobody are the two states somebody not watching the
        screen most needs announced.
      */}
      {searching && !tooShort ? (
        <p role="status" className="ds-type-note ds-text-muted">
          Searching…
        </p>
      ) : null}

      {searchError && !tooShort ? <FormError>{searchError}</FormError> : null}

      {/*
        **"Nobody with that name" covers three cases and says one thing.** No
        such username, somebody blocked in either direction, and somebody
        already in this Circle all arrive here as an empty list. Naming which
        would turn the box into a detector for the second one.
      */}
      {results && !tooShort && results.length === 0 && !searching && !searchError ? (
        <p role="status" className="ds-type-note ds-text-muted">
          Nobody with that name is available to invite.
        </p>
      ) : null}

      {results && !tooShort && results.length > 0 ? (
        <ul aria-label="Search results" className="flex flex-col gap-1">
          {results.map((user) => (
            <li
              key={user.id}
              className="ds-panel flex items-center justify-between gap-3 px-3 py-2"
            >
              <span className="ds-text-primary flex min-w-0 items-center gap-2">
                <Avatar url={user.avatarUrl} name={user.username} size={28} />
                <span className="truncate">{user.username}</span>
              </span>

              {invited[user.id] ? (
                <span className="ds-type-note ds-text-muted shrink-0">
                  Invited
                </span>
              ) : (
                /*
                  The name carries the username — "Invite ryahn1", not "Invite"
                  — because `invite-user.spec.ts` locates it that way and,
                  more to the point, a list of ten identical "Invite" buttons is
                  ten controls a screen reader cannot tell apart.
                */
                <SecondaryButton
                  onClick={() => void invite(user)}
                  disabled={inviting === user.id}
                  align="center"
                  className="shrink-0"
                >
                  {inviting === user.id ? "Inviting…" : `Invite ${user.username}`}
                </SecondaryButton>
              )}
            </li>
          ))}
        </ul>
      ) : null}

      {/*
        Per person, under the list, because a single shared error line cannot
        say *which* invite failed once more than one has been tried.
      */}
      {Object.entries(failed).map(([id, message]) => (
        <FormError key={id}>{message}</FormError>
      ))}
    </section>
  )
}

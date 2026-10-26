---
"@seliseblocks/genesis-os": patch
---

Back to console now shows the console only once the server confirms the session is back in root. It used to show it whatever the stop call did, including a stop that failed, whose answer never arrived, or that got a 401 only because the access token had expired. The guard now asks the server where the session is after every stop attempt; if it is still in the project it offers Try again and Sign out, or Sign in again when the session cannot be used any more. Stop refreshes an expired access token and tries again instead of reading the 401 as "already stopped".

Opening a project is confirmed the same way: after a 200 with `cookie_set`, the server must report the session in that project before the page renders.

After every token refresh the client checks that the session is still in the tenant the page is showing. A request that started for one tenant is not sent again in another, and data cached under the page's keys while the session was elsewhere is dropped. A refused refresh that only means the token was replaced by a project change (`session_changed`) no longer signs the user out while the cookie still holds a working token.

Refreshing, opening and leaving a project now take turns across every tab of the app (Web Locks), so concurrent responses can no longer leave the shared cookie in an unexpected tenant. Returning to a tab asks where the session is before refetching anything else, and a failed status refetch no longer unmounts the whole layout.

Signing in tells the app's other tabs which tenant the new session is in (an app switch can arrive inside a project), and signing out sends every other tab to the login page. The sign-in callback is no longer redirected to the console, and AuthResolver no longer calls `/auth/me`, while the code exchange is still in progress.

`HttpClient` gains `withSessionLock`, `refreshWithinSessionLock` and `setSessionGuard`; requests accept `skipSessionCheck`. `useStopImpersonation` now settles with `{ status, stopError }`.

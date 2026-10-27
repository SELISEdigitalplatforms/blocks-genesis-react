---
"@seliseblocks/genesis-os": patch
---

A stop or open-project request that never gets an answer no longer holds up the app's token refreshes. Each call made while holding the session lock (start, stop, and the status check) now gives up after 20 seconds, so the lock is released; a stop that times out shows "Couldn't return to the console" with Try again, as any failed stop does. A refresh that has waited 25 seconds for the lock now goes ahead without it as intended; before, the browser's timeout was reported as a `TimeoutError` that was not recognised, and the refresh failed instead.

---
"@seliseblocks/genesis-os": patch
---

Stop the AppSwitcher calling `/idp/initiate` for every app on every open. The redirect URLs now live in the TanStack Query cache, keyed by client, redirect URI and `forwardedTo`, and are reused for up to five minutes -- half of the ten minutes IAM keeps each flow's state, so a user always has at least five to finish signing in. A URL older than that is never shown. Because IAM consumes a state on its first callback, a URL is dropped and replaced the moment its link is used: clicked, middle-clicked, opened from the context menu or dragged out.

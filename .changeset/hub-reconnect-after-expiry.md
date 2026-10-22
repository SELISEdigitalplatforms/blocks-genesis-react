---
"@seliseblocks/genesis-os": patch
---

The notification hub reconnects after the login expires. blocks-logic now closes a hub connection when its token expires; the listener refreshes the login and starts the same connection again (2s, 5s, 15s, 30s, then every 60s, and at once when the browser comes back online or the tab becomes visible). A refused refresh (401) stops the retries.

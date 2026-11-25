---
"@seliseblocks/genesis-os": minor
---

The AppSwitcher lists Agents and Studio only when their runtime settings say so: `BLOCKS_FEATURE_AGENTS` and `BLOCKS_FEATURE_STUDIO`, each `"true"` to show the entry. Both are off when unset, so an installation without those services no longer offers an entry that leads nowhere. A deployment that runs them sets the two values next to `BLOCKS_AGENTS_BASE_URL` and `BLOCKS_STUDIO_BASE_URL`. `BLOCKS_ALLOWED_SERVICES` still applies on top.

---
"@seliseblocks/genesis-os": patch
---

Bell notifications for logic events (failed workflow run, failed function run, function build, schedule) now open their page in the merged blocks-os console. A `blocks-logic` link opens in `blocks-os` when the app does not set `BLOCKS_LOGIC_BASE_URL`, the same rule `getMergedAreaBaseUrl` uses for API calls; while the key is set the link stays plain, as before. Links still open in their own app, release links stay in blocks-release, and the path is still built only from the event and its ids.

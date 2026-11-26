---
"@seliseblocks/genesis-os": patch
---

Logic notification links (failed workflow run, failed function run, function build, schedule) now also open in `blocks-os` when `BLOCKS_LOGIC_BASE_URL` points at the console's own origin, as on the dev and stg os deployments. Before, they opened only when the key was unset. A key that points at another host, such as the old logic app, still keeps the link plain.

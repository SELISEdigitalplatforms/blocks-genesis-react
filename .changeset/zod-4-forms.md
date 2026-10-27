---
"@seliseblocks/genesis-os": minor
---

genesis-os now depends on `zod` 4 (`^4.6.7`) and `@hookform/resolvers` `^5.9.2`, so apps no longer get the vulnerable `zod` 3.25.76 through this package. No exported API or form behaviour changes: zod types are not part of the public API, and the project-name and domain forms validate and show the same messages as before. Apps that override `zod` only to move genesis-os to version 4 can drop that override after upgrading.

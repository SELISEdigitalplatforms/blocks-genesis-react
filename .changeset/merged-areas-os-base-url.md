---
"@seliseblocks/genesis-os": minor
---

Logic, localization, data and monitor are served by the os host since blocks-os-net-react. Every place that read
`BLOCKS_LOGIC_BASE_URL` or `BLOCKS_LOCALIZATION_BASE_URL` (project and notification clients, the NotificationHub,
i18n's default `baseUrl`, swagger URLs) now uses the area's key while the app still sets it, and `BLOCKS_OS_BASE_URL`
once it is gone (`getMergedAreaBaseUrl` from `@seliseblocks/genesis-os/lib`). The app switcher shows the Logic,
Localization, Data and Monitor tiles only while their `*_BASE_URL` is set. Nothing changes for an app that still sets
the area keys.

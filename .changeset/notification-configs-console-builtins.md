---
"@seliseblocks/genesis-os": patch
---

`notificationService.getNotificationConfigs` now adds `includeConsoleBuiltIns=true` to its `GET /api/Notification/Gets` request, so `useGetBlocksNotificationConfig` and the notification socket ask os for the root tenant's Console built-in notification configs. A console user working inside a project then also subscribes to methods such as `schema-import`, and the data import dialog can show the import's result. The flag is always sent with the literal value `true`; servers that do not know it ignore it and return the same list as before, and os honours it only for console callers. The hook's signature, query key, response shape and every other notification request are unchanged.

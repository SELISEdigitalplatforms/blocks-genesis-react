---
"@seliseblocks/genesis-os": patch
---

`HttpClient` keeps the text of a thrown `Error` instead of turning it into `{}`. When `fetch` rejects with an `Error` (for example `TypeError: Failed to fetch`, a `DOMException`, or a `SyntaxError` from a success body that is not valid JSON), the rejection is still an `HttpError` with status 500, but `errors` is now `{ general, message }`, both set to the error's text and capped at 500 characters, so `HttpError.message` is no longer `"{}"`. An empty, whitespace-only or non-string message falls back to "Network request failed". Thrown `HttpError`s, plain objects and primitives are handled as before, and `onError` still receives the original error. `getErrorMessage` (and so `showErrorToast`) now lists each distinct text once.

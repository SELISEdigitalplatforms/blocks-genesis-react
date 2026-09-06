---
"@seliseblocks/genesis-os": minor
---

Route the landing page Sign up button through `/api/idp/initiate?flow=signup` so IAM validates the client and redirect URI before returning the signup URL.

The button previously linked to a URL built in the browser, carrying no `clientId` or `redirect_uri`. Those two ride all the way into the activation email, and without them IAM falls back to the tenant's first active OIDC client — so signing up from one project could send the activation link back to a different one. Asking IAM for the URL means the redirect URI in that email is one the backend confirmed is registered.

Requires an IAM release that understands the `flow` parameter. Until then the package refuses to redirect and surfaces an error rather than silently landing people on the login page.

Note for anyone consuming the hook directly: `useSignUpAffordance` no longer returns a `signUpUrl` string. There is no URL to hand out any more — the URL comes from IAM at click time — so it returns `{ canSignUp, isLoading }`, and the new `useSignUpRedirect` performs the navigation. `LoginPage` is wired up already and needs nothing from callers.

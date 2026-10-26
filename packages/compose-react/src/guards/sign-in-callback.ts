/**
 * The sign-in callback route, `/login/callback` in every app. It exchanges the code, which replaces
 * the session cookie, and then leaves with a full page load. The guards around it must leave it
 * alone until then: anything they send in the meantime carries the cookie being replaced.
 *
 * Only this route: other callbacks (GitHub, OAuth connectors) run inside a signed-in app and need
 * the guards as usual.
 */
export const isSignInCallbackPath = (pathname: string): boolean =>
  /^\/login\/callback\/?$/.test(pathname);

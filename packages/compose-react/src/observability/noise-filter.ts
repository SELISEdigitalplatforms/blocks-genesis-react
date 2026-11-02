/**
 * Errors the browser raises that say nothing about a Blocks fault, and that Rollbar should therefore
 * never receive.
 *
 * Each rule matches one exact signature seen in production. A broad rule would hide real bugs, so a
 * `TypeError` is noise only with a known network message, and an `InvalidStateError` only when it is
 * about a view transition.
 */
export type NoiseRule =
  | "network"
  | "view-transition"
  | "extension"
  | "cancelation"
  | "stale-asset"
  | "recaptcha-timeout";

interface RollbarTraceLike {
  frames?: unknown[] | null;
  exception?: { class?: unknown; message?: unknown } | null;
}

/** The parts of a Rollbar item (`item.data`) the rules read. */
export interface RollbarPayloadLike {
  body?: {
    trace?: RollbarTraceLike | null;
    trace_chain?: (RollbarTraceLike | null)[] | null;
    message?: { body?: unknown } | null;
  } | null;
}

const NETWORK_MESSAGES = [
  "NetworkError when attempting to fetch resource.",
  "Load failed",
];

// `AbortError` is listed as the spec lists it, though the network rule, checked first, already
// drops every `AbortError`.
const VIEW_TRANSITION_CLASSES = [
  "InvalidStateError",
  "TimeoutError",
  "AbortError",
];

const EXTENSION_URL_PREFIXES = [
  "chrome-extension://",
  "moz-extension://",
  "safari-extension://",
  "safari-web-extension://",
];

// What a bare `Event` turns into once it has been stringified, by Rollbar or by the app.
const EVENT_MESSAGES = [
  "[object Event]",
  "[object ErrorEvent]",
  '{"isTrusted":true}',
];

const asString = (value: unknown): string | undefined =>
  typeof value === "string" ? value : undefined;

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  if (typeof value !== "object" || value === null) return false;
  const prototype: unknown = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
};

const isEvent = (value: unknown): boolean =>
  typeof Event !== "undefined" && value instanceof Event;

const isExtensionFrame = (frame: unknown): boolean => {
  const filename = (frame as { filename?: unknown } | null)?.filename;
  return (
    typeof filename === "string" &&
    EXTENSION_URL_PREFIXES.some((prefix) => filename.startsWith(prefix))
  );
};

const classify = (
  value: unknown,
  payload: RollbarPayloadLike | undefined,
): NoiseRule | null => {
  const body = payload?.body;
  const trace = body?.trace ?? body?.trace_chain?.[0];
  const raw =
    typeof value === "object" && value !== null
      ? (value as { name?: unknown; message?: unknown })
      : undefined;

  const errorClass =
    asString(raw?.name) ?? asString(trace?.exception?.class) ?? "";
  const message =
    asString(raw?.message) ??
    asString(trace?.exception?.message) ??
    asString(body?.message?.body) ??
    "";
  const frames = trace?.frames ?? [];

  if (
    (errorClass === "TypeError" &&
      (message.startsWith("Failed to fetch") ||
        NETWORK_MESSAGES.includes(message))) ||
    errorClass === "AbortError"
  )
    return "network";

  if (
    VIEW_TRANSITION_CLASSES.includes(errorClass) &&
    message.toLowerCase().includes("transition")
  )
    return "view-transition";

  // Every frame, not any: an extension frame on top of app frames is still the app's stack.
  if (frames.length > 0 && frames.every(isExtensionFrame)) return "extension";

  if (
    (errorClass === "Canceled" && message === "Canceled") ||
    (isPlainObject(value) && value.type === "cancelation")
  )
    return "cancelation";

  if (
    message.startsWith(
      "Failed to execute 'importScripts' on 'WorkerGlobalScope'",
    ) ||
    message === "Object.hasOwn is not a function" ||
    isEvent(value) ||
    EVENT_MESSAGES.includes(message)
  )
    return "stale-asset";

  if (message.startsWith("reCAPTCHA Timeout")) return "recaptcha-timeout";

  return null;
};

/**
 * Names the noise rule `value` matches, or `null` when it should be reported.
 *
 * `value` is the raw thrown value (an `Error`, a `DOMException`, an `Event`, a plain object). The
 * Rollbar payload, when given, fills in the class, message and stack frames the value does not
 * carry. Fails open: if reading either one throws, the item is reported.
 */
export const classifyReportingNoise = (
  value: unknown,
  payload?: RollbarPayloadLike,
): NoiseRule | null => {
  try {
    return classify(value, payload);
  } catch {
    return null;
  }
};

/** True for a browser network failure or an aborted request: nothing the app can fix. */
export const isNetworkFailure = (error: unknown): boolean =>
  classifyReportingNoise(error) === "network";

import Rollbar from "rollbar";
import { getRuntimeEnv } from "@/lib/runtime-env";

/**
 * Payload keys and header names that must never leave the browser.
 *
 * Rollbar scrubs a default set already; these are the platform-specific ones. Getting this wrong
 * ships a tenant's credentials to a third party, which is why it lives here rather than being
 * restated in every app.
 */
const DEFAULT_SCRUB_FIELDS = [
  "x-blocks-key",
  "X-Blocks-Key",
  "Authorization",
  "authorization",
  "access_token",
  "refresh_token",
  "accessToken",
  "refreshToken",
  "password",
  "clientSecret",
  "client_secret",
  "connectionString",
  "secretValue",
];

/**
 * Noise that reaches `window.onerror` but says nothing about the app: browser extensions,
 * cross-origin frames, and the ResizeObserver warning Chrome raises during ordinary layout.
 */
const DEFAULT_IGNORED_MESSAGES = [
  "ResizeObserver loop limit exceeded",
  "ResizeObserver loop completed with undelivered notifications",
  "Script error.",
];

/**
 * Stands in for a real token when none is seeded.
 *
 * `@rollbar/react`'s `Provider` rejects an instance whose `options.accessToken` is falsy -- it
 * throws "`instance` must be a configured instance of Rollbar" from its own constructor, which is
 * above the error boundary, so an unconfigured app renders nothing at all. Reporting is switched
 * off by `enabled`, not by the token: the notifier refuses to send before it reaches a transport
 * and telemetry instrumentation is never installed. A placeholder therefore costs nothing and
 * keeps reporting genuinely optional, which is the point -- no tier should go blank because a
 * secret has not been seeded yet.
 */
export const UNCONFIGURED_ACCESS_TOKEN = "rollbar-reporting-disabled";

export interface RollbarConfigOptions {
  /**
   * The app reporting, e.g. `"blocks-os"`. Pass the same name the app already gives
   * `BlocksAppLayout`, so items can be traced back to a service without a project-id lookup.
   */
  service: string;
  /** Appended to, not replacing, the platform scrub list. */
  extraScrubFields?: string[];
  /** Appended to, not replacing, the default ignore list. */
  extraIgnoredMessages?: string[];
  /** Identifies the build. Required for source-map deobfuscation once maps are uploaded. */
  codeVersion?: string;
}

/**
 * Builds the browser Rollbar configuration from runtime env.
 *
 * Separate from the provider so it can be asserted on directly: most of the risk in this module is
 * in the configuration -- scrubbing, and whether reporting is on at all -- not in Rollbar itself.
 */
export const createRollbarConfig = (
  options: RollbarConfigOptions,
): Rollbar.Configuration => {
  const accessToken = getRuntimeEnv("BLOCKS_ROLLBAR_CLIENT_TOKEN");

  return {
    accessToken: accessToken || UNCONFIGURED_ACCESS_TOKEN,
    // Reporting is opt-in on a seeded token. Unconfigured environments -- developer machines,
    // tests, any tier not yet seeded -- get an inert client rather than a broken one, so the error
    // boundary still behaves exactly as it does in production.
    enabled: accessToken.length > 0,
    environment: getRuntimeEnv("BLOCKS_ROLLBAR_ENV") || "unknown",
    captureUncaught: true,
    captureUnhandledRejections: true,
    scrubFields: [...DEFAULT_SCRUB_FIELDS, ...(options.extraScrubFields ?? [])],
    ignoredMessages: [
      ...DEFAULT_IGNORED_MESSAGES,
      ...(options.extraIgnoredMessages ?? []),
    ],
    payload: {
      // `service` identifies the app, `component` which half of it. Two fields rather than one
      // `blocks-os-client` string, so either can be filtered on without parsing.
      service: options.service,
      component: "client",
      client: {
        javascript: {
          source_map_enabled: Boolean(options.codeVersion),
          code_version: options.codeVersion,
        },
      },
    },
  };
};

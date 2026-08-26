import Rollbar from "rollbar";
import {
  createRollbarConfig,
  type RollbarConfigOptions,
} from "./rollbar.config";

let instance: Rollbar | undefined;

/**
 * The one Rollbar instance for the app.
 *
 * Memoised on first call so that code outside the React tree -- an `HttpClient` built at module
 * scope, for instance -- reports through the same client the provider renders. A second instance
 * would install a second set of window handlers and split the telemetry buffer in two.
 *
 * First call wins: later calls return the existing instance and ignore their options. In practice
 * every call site passes the same service, and load order between a module-scope client and the
 * provider is not something an app should have to reason about.
 *
 * Created lazily, so merely importing this module installs nothing.
 */
export const getRollbar = (options: RollbarConfigOptions): Rollbar =>
  (instance ??= new Rollbar(createRollbarConfig(options)));

import {
  HttpTransportType,
  HubConnection,
  HubConnectionBuilder,
} from "@microsoft/signalr";
import { getRuntimeEnv } from "@/lib/runtime-env";
import { notificationService } from "@/services/notification.service";

const logicOrigin = (): string =>
  getRuntimeEnv("BLOCKS_LOGIC_BASE_URL").trim().replace(/\/$/, "");

// Wait before retry n (0-based); after the list is used up, retry every minute.
const RETRY_DELAYS_MS = [2000, 5000, 15_000, 30_000];
const STEADY_RETRY_MS = 60_000;

// A refresh that was refused ends as HttpError(401): the user is logged out.
const isLoggedOut = (error: unknown): boolean =>
  (error as { status?: number } | null)?.status === 401;

// Any other HTTP status (403, 404, 5xx) means the http client got a response and refreshed the
// login if it needed to: go on and start. Only an error with no status (network) is retried.
const hasHttpStatus = (error: unknown): boolean =>
  typeof (error as { status?: unknown } | null)?.status === "number";

const refreshLoginCall = async (probe: Promise<unknown>): Promise<void> => {
  try {
    await probe;
  } catch (error) {
    if (isLoggedOut(error) || !hasHttpStatus(error)) throw error;
  }
};

export class NotificationListenerService {
  public connection: HubConnection;

  // True from connect() until disconnect(): the app wants the hub up.
  private wanted = false;
  private attempt = 0;
  private timer: ReturnType<typeof setTimeout> | undefined;
  private inFlight: Promise<void> | undefined;

  constructor() {
    this.connection = new HubConnectionBuilder()
      .withUrl(
        `${logicOrigin()}/api/NotificationHub?x-blocks-key=${getRuntimeEnv("BLOCKS_X_BLOCKS_KEY")}`,
        {
          transport: HttpTransportType.WebSockets,
          // One request opens the socket, so it cannot split across Api pods without sticky sessions.
          skipNegotiation: true,
        },
      )
      .withAutomaticReconnect()
      .build();

    // The server closes the hub when the login expires: log in again, then start again.
    this.connection.onclose(() => {
      if (this.wanted) this.recover(true);
    });
  }

  async connect() {
    if (!this.wanted) {
      this.wanted = true;
      this.attempt = 0;
      globalThis.addEventListener("online", this.onWake);
      document.addEventListener("visibilitychange", this.onVisibility);
    }
    // A retry is already waiting: let it keep its backoff.
    if (this.timer === undefined) await this.recover(false);
  }

  async disconnect() {
    this.wanted = false;
    this.stopWatching();
    if (this.connection.state !== "Disconnected") {
      await this.connection.stop();
    }
  }

  private readonly onWake = () => {
    if (this.wanted) this.recover(true);
  };

  private readonly onVisibility = () => {
    if (document.visibilityState === "visible") this.onWake();
  };

  private stopWatching() {
    clearTimeout(this.timer);
    this.timer = undefined;
    globalThis.removeEventListener("online", this.onWake);
    document.removeEventListener("visibilitychange", this.onVisibility);
  }

  // Never two starts at once: callers share the run that is already going.
  private recover(refreshLogin: boolean): Promise<void> {
    this.inFlight ??= this.tryStart(refreshLogin).finally(() => {
      this.inFlight = undefined;
    });
    return this.inFlight;
  }

  private async tryStart(refreshLogin: boolean) {
    clearTimeout(this.timer);
    this.timer = undefined;
    if (!this.wanted || this.connection.state !== "Disconnected") return;
    // Offline: the "online" event tries again (a failed refresh would log the user out).
    if (refreshLogin && navigator.onLine === false) return;

    try {
      // Cheap authenticated GET: the http client refreshes the login on 401.
      if (refreshLogin)
        await refreshLoginCall(notificationService.getNotifications(1, 1));
      if (!this.wanted) return;
      await this.connection.start();
      this.attempt = 0;
      if (!this.wanted) await this.connection.stop();
    } catch (error) {
      if (!this.wanted) return;
      if (isLoggedOut(error)) {
        this.wanted = false;
        this.stopWatching();
        return;
      }
      this.scheduleRetry();
    }
  }

  private scheduleRetry() {
    const delay = RETRY_DELAYS_MS[this.attempt] ?? STEADY_RETRY_MS;
    this.attempt += 1;
    this.timer = setTimeout(() => this.recover(true), delay);
  }
}

export const notificationListenerService = new NotificationListenerService();

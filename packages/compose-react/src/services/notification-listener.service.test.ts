import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => {
  const connection = {
    state: "Disconnected",
    start: vi.fn(),
    stop: vi.fn(),
    onclose: vi.fn(),
  };
  const builder = {
    withUrl: vi.fn().mockReturnThis(),
    withAutomaticReconnect: vi.fn().mockReturnThis(),
    build: vi.fn(() => connection),
  };
  return { connection, builder, getNotifications: vi.fn() };
});

vi.mock("@microsoft/signalr", () => ({
  HttpTransportType: { WebSockets: 1 },
  HubConnection: class {},
  HubConnectionBuilder: vi.fn(function () {
    return h.builder;
  }),
}));

vi.mock("@/lib/runtime-env", () => ({
  getRuntimeEnv: vi.fn(() => "test-value"),
}));

vi.mock("@/services/notification.service", () => ({
  notificationService: { getNotifications: h.getNotifications },
}));

import { NotificationListenerService } from "./notification-listener.service";

const refused = () =>
  Object.assign(new Error("Session expired"), { status: 401 });

// Runs the close handler the service registered on the connection.
const closeConnection = () => {
  h.connection.state = "Disconnected";
  const onClose = h.connection.onclose.mock.calls.at(-1)?.[0] as () => void;
  onClose();
};

describe("NotificationListenerService reconnect", () => {
  let service: NotificationListenerService;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    h.connection.state = "Disconnected";
    h.connection.start.mockImplementation(async () => {
      h.connection.state = "Connected";
    });
    h.connection.stop.mockImplementation(async () => {
      h.connection.state = "Disconnected";
    });
    h.getNotifications.mockResolvedValue({});
    service = new NotificationListenerService();
  });

  afterEach(async () => {
    await service.disconnect();
    vi.useRealTimers();
  });

  it("opens the socket in one request, without negotiate", () => {
    expect(h.builder.withUrl).toHaveBeenCalledWith(
      expect.stringContaining("/api/NotificationHub"),
      expect.objectContaining({ transport: 1, skipNegotiation: true }),
    );
  });

  it("connect() starts the connection without refreshing the login", async () => {
    await service.connect();

    expect(h.connection.start).toHaveBeenCalledTimes(1);
    expect(h.getNotifications).not.toHaveBeenCalled();
  });

  it("refreshes the login and starts again when the connection closes", async () => {
    await service.connect();
    h.connection.start.mockClear();

    closeConnection();
    await vi.advanceTimersByTimeAsync(0);

    expect(h.getNotifications).toHaveBeenCalledTimes(1);
    expect(h.connection.start).toHaveBeenCalledTimes(1);
  });

  it("retries with backoff while the start fails", async () => {
    await service.connect();
    h.connection.start.mockClear();
    h.connection.start.mockRejectedValue(new Error("network"));

    closeConnection();
    await vi.advanceTimersByTimeAsync(0);
    expect(h.connection.start).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(1999);
    expect(h.connection.start).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1);
    expect(h.connection.start).toHaveBeenCalledTimes(2);

    await vi.advanceTimersByTimeAsync(5000);
    expect(h.connection.start).toHaveBeenCalledTimes(3);
    await vi.advanceTimersByTimeAsync(15_000 + 30_000);
    expect(h.connection.start).toHaveBeenCalledTimes(5);
    await vi.advanceTimersByTimeAsync(60_000);
    expect(h.connection.start).toHaveBeenCalledTimes(6);
  });

  it("stops retrying quietly when the refresh is refused", async () => {
    await service.connect();
    h.connection.start.mockClear();
    h.getNotifications.mockRejectedValue(refused());

    closeConnection();
    await vi.advanceTimersByTimeAsync(120_000);

    expect(h.getNotifications).toHaveBeenCalledTimes(1);
    expect(h.connection.start).not.toHaveBeenCalled();
  });

  it("still starts when the refresh GET fails with a status other than 401", async () => {
    await service.connect();
    h.connection.start.mockClear();
    h.getNotifications.mockRejectedValue(
      Object.assign(new Error("Forbidden"), { status: 403 }),
    );

    closeConnection();
    await vi.advanceTimersByTimeAsync(0);

    expect(h.connection.start).toHaveBeenCalledTimes(1);
  });

  it("does not retry after disconnect()", async () => {
    await service.connect();
    h.connection.start.mockClear();
    h.connection.start.mockRejectedValue(new Error("network"));
    closeConnection();
    await vi.advanceTimersByTimeAsync(0);

    await service.disconnect();
    await vi.advanceTimersByTimeAsync(120_000);

    expect(h.connection.start).toHaveBeenCalledTimes(1);
  });

  it("does not reconnect after an intentional disconnect() closes the connection", async () => {
    await service.connect();
    h.connection.start.mockClear();

    await service.disconnect();
    closeConnection();
    await vi.advanceTimersByTimeAsync(0);

    expect(h.getNotifications).not.toHaveBeenCalled();
    expect(h.connection.start).not.toHaveBeenCalled();
  });

  it("never runs two starts in parallel", async () => {
    await service.connect();
    h.connection.start.mockClear();
    let finishStart: () => void = () => {};
    h.connection.start.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          finishStart = () => {
            h.connection.state = "Connected";
            resolve();
          };
        }),
    );

    closeConnection();
    await vi.advanceTimersByTimeAsync(0);
    globalThis.dispatchEvent(new Event("online"));
    await vi.advanceTimersByTimeAsync(0);

    expect(h.connection.start).toHaveBeenCalledTimes(1);
    finishStart();
    await vi.advanceTimersByTimeAsync(0);
  });

  it("tries at once on the online event while disconnected", async () => {
    await service.connect();
    h.connection.start.mockClear();
    h.connection.state = "Disconnected";

    globalThis.dispatchEvent(new Event("online"));
    await vi.advanceTimersByTimeAsync(0);

    expect(h.getNotifications).toHaveBeenCalledTimes(1);
    expect(h.connection.start).toHaveBeenCalledTimes(1);
  });

  it("tries at once when the tab becomes visible while disconnected", async () => {
    await service.connect();
    h.connection.start.mockClear();
    h.connection.state = "Disconnected";

    document.dispatchEvent(new Event("visibilitychange"));
    await vi.advanceTimersByTimeAsync(0);

    expect(h.connection.start).toHaveBeenCalledTimes(1);
  });

  it("ignores the online event while connected", async () => {
    await service.connect();
    h.connection.start.mockClear();

    globalThis.dispatchEvent(new Event("online"));
    await vi.advanceTimersByTimeAsync(0);

    expect(h.connection.start).not.toHaveBeenCalled();
  });

  it("does not listen to the online event after disconnect()", async () => {
    await service.connect();
    await service.disconnect();
    h.connection.start.mockClear();

    globalThis.dispatchEvent(new Event("online"));
    await vi.advanceTimersByTimeAsync(0);

    expect(h.connection.start).not.toHaveBeenCalled();
  });

  it("disconnect() stops a connection that is not disconnected", async () => {
    await service.connect();

    await service.disconnect();

    expect(h.connection.stop).toHaveBeenCalledTimes(1);
  });
});

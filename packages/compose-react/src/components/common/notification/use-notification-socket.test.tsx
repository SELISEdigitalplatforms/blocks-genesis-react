import { renderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useNotificationSocket } from "./use-notification-socket";

const h = vi.hoisted(() => ({
  connect: vi.fn(),
  disconnect: vi.fn(),
  on: vi.fn(),
  getNotificationConfig: vi.fn(),
  configData: undefined as unknown,
}));

vi.mock("@/services/notification-listener.service", () => ({
  notificationListenerService: {
    connect: h.connect,
    disconnect: h.disconnect,
    connection: { on: h.on },
  },
}));
vi.mock("@/services/notification.service", () => ({
  notificationService: { getNotificationConfig: h.getNotificationConfig },
}));
vi.mock("@/hooks/use-notifications", () => ({
  useGetBlocksNotificationConfig: () => ({ data: h.configData }),
}));

let client: QueryClient;
const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={client}>{children}</QueryClientProvider>
);

describe("useNotificationSocket", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    h.configData = undefined;
    client = new QueryClient();
  });

  it("connects on mount and disconnects on unmount", () => {
    const { unmount } = renderHook(() => useNotificationSocket(), { wrapper });

    expect(h.connect).toHaveBeenCalled();

    unmount();
    expect(h.disconnect).toHaveBeenCalled();
  });

  it("registers a listener for each configured notify method", () => {
    h.configData = { configurations: [{ notifyMethod: "OnNotice" }] };

    renderHook(() => useNotificationSocket(), { wrapper });

    expect(h.on).toHaveBeenCalledWith("OnNotice", expect.any(Function));
  });

  it("registers schema-import next to the other configs, once each", () => {
    h.configData = {
      configurations: [
        { notifyMethod: "OnNotice" },
        { notifyMethod: "schema-import" },
      ],
    };

    renderHook(() => useNotificationSocket(), { wrapper });

    expect(h.on).toHaveBeenCalledTimes(2);
    expect(h.on).toHaveBeenNthCalledWith(1, "OnNotice", expect.any(Function));
    expect(h.on).toHaveBeenNthCalledWith(
      2,
      "schema-import",
      expect.any(Function),
    );
  });

  it("passes the schema-import message and its config to the event dispatch", () => {
    const config = { notifyMethod: "schema-import" };
    h.configData = { configurations: [config] };
    const message = JSON.stringify({
      notificationId: "n1",
      configurationName: "schema-import",
      responseKey: "c-1",
      responseValue: "",
      denormalizedPayload: JSON.stringify({
        CorrelationId: "c-1",
        IsSuccess: true,
      }),
    });

    renderHook(() => useNotificationSocket(), { wrapper });
    const handler = h.on.mock.calls[0]?.[1] as (message: string) => void;
    handler(message);

    expect(h.getNotificationConfig).toHaveBeenCalledWith(config, message);
  });

  it("registers only what the server returns when it ignores the flag", () => {
    h.configData = {
      configurations: [{ notifyMethod: "OnNotice" }],
      totalCount: 1,
    };

    renderHook(() => useNotificationSocket(), { wrapper });

    expect(h.on).toHaveBeenCalledTimes(1);
    expect(h.on).toHaveBeenCalledWith("OnNotice", expect.any(Function));
    expect(h.on).not.toHaveBeenCalledWith(
      "schema-import",
      expect.any(Function),
    );
  });

  it("registers no handler while the configs are missing or failed", () => {
    h.configData = undefined;

    renderHook(() => useNotificationSocket(), { wrapper });

    expect(h.on).not.toHaveBeenCalled();
  });

  it("registers no handler for an empty configs list", () => {
    h.configData = { configurations: [] };

    renderHook(() => useNotificationSocket(), { wrapper });

    expect(h.on).not.toHaveBeenCalled();
  });

  it("invalidates the notifications cache on a payload with a title", () => {
    h.configData = { configurations: [{ notifyMethod: "OnNotice" }] };
    const invalidate = vi.spyOn(client, "invalidateQueries");

    renderHook(() => useNotificationSocket(), { wrapper });
    const handler = h.on.mock.calls[0]?.[1] as (message: string) => void;

    handler(
      JSON.stringify({
        denormalizedPayload: JSON.stringify({ title: "Hello" }),
      }),
    );

    expect(h.getNotificationConfig).toHaveBeenCalled();
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["notifications"] });
  });

  it("logs and does not invalidate on an unparseable message", () => {
    h.configData = { configurations: [{ notifyMethod: "OnNotice" }] };
    const invalidate = vi.spyOn(client, "invalidateQueries");
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    renderHook(() => useNotificationSocket(), { wrapper });
    const handler = h.on.mock.calls[0]?.[1] as (message: string) => void;

    handler("not-json");

    expect(errorSpy).toHaveBeenCalled();
    expect(invalidate).not.toHaveBeenCalled();
  });
});

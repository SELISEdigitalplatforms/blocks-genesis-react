import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  useGetBlocksNotificationConfig,
  useGetNotifications,
  useMarkAllAsRead,
  useMarkAsRead,
} from "./use-notifications";

const h = vi.hoisted(() => ({
  getNotifications: vi.fn(),
  markAsRead: vi.fn(),
  markAllNotificationsAsRead: vi.fn(),
  getNotificationConfigs: vi.fn(),
}));

vi.mock("@/services/notification.service", () => ({
  notificationService: {
    getNotifications: h.getNotifications,
    markAsRead: h.markAsRead,
    markAllNotificationsAsRead: h.markAllNotificationsAsRead,
    getNotificationConfigs: h.getNotificationConfigs,
  },
}));

let client: QueryClient;
const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={client}>{children}</QueryClientProvider>
);

describe("use-notifications hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
  });

  it("fetches a page of notifications", async () => {
    h.getNotifications.mockResolvedValue({
      notifications: [],
      totalNotificationsCount: 0,
    });

    const { result } = renderHook(() => useGetNotifications(2, 10), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(h.getNotifications).toHaveBeenCalledWith(2, 10);
  });

  it("marks a single notification as read", async () => {
    h.markAsRead.mockResolvedValue(undefined);

    const { result } = renderHook(() => useMarkAsRead(), { wrapper });
    await result.current.mutateAsync("n1");

    expect(h.markAsRead).toHaveBeenCalled();
    expect(h.markAsRead.mock.calls[0]?.[0]).toBe("n1");
  });

  it("marks all as read and invalidates the notifications cache", async () => {
    h.markAllNotificationsAsRead.mockResolvedValue(undefined);
    const invalidate = vi.spyOn(client, "invalidateQueries");

    const { result } = renderHook(() => useMarkAllAsRead(), { wrapper });
    await result.current.mutateAsync(undefined);

    await waitFor(() =>
      expect(invalidate).toHaveBeenCalledWith({ queryKey: ["notifications"] }),
    );
  });

  it("fetches the notification configs", async () => {
    h.getNotificationConfigs.mockResolvedValue([]);

    const { result } = renderHook(() => useGetBlocksNotificationConfig(), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(h.getNotificationConfigs).toHaveBeenCalledWith(0, 100);
  });
});

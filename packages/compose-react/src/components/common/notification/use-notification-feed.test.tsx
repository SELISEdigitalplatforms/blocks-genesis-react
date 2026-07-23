import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useNotificationFeed } from "./use-notification-feed";

const h = vi.hoisted(() => ({
  getNotifications: vi.fn(),
  markAsReadMutate: vi.fn(),
  markAllMutate: vi.fn(),
}));

vi.mock("@/hooks/use-notifications", () => ({
  useGetNotifications: (...args: unknown[]) => h.getNotifications(...args),
  useMarkAsRead: () => ({ mutate: h.markAsReadMutate }),
  useMarkAllAsRead: () => ({ mutate: h.markAllMutate }),
}));

const wrapper = ({ children }: { children: ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

const feedData = {
  data: {
    notifications: [
      { id: "1", createdTime: "2026-01-01T00:00:00Z", isRead: false },
      { id: "2", createdTime: "2026-02-01T00:00:00Z", isRead: false },
    ],
    totalNotificationsCount: 25,
    unReadNotificationsCount: 3,
  },
  isLoading: false,
  isFetching: false,
};

describe("useNotificationFeed", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    h.getNotifications.mockReturnValue(feedData);
  });

  it("merges the fetched page into the local list sorted newest first", async () => {
    const { result } = renderHook(() => useNotificationFeed(false), {
      wrapper,
    });

    await waitFor(() => expect(result.current.notifications).toHaveLength(2));
    expect(result.current.notifications[0].id).toBe("2");
    expect(result.current.unreadCount).toBe(3);
  });

  it("marks a single notification as read on success", async () => {
    h.markAsReadMutate.mockImplementation(
      (_id: string, opts: { onSuccess: () => void }) => opts.onSuccess(),
    );
    const { result } = renderHook(() => useNotificationFeed(false), {
      wrapper,
    });
    await waitFor(() => expect(result.current.notifications).toHaveLength(2));

    act(() => result.current.handleMarkAsRead("1"));

    expect(h.markAsReadMutate).toHaveBeenCalledWith(
      "1",
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );
    expect(
      result.current.notifications.find((n) => n.id === "1")?.isRead,
    ).toBe(true);
  });

  it("marks every notification as read on success", async () => {
    h.markAllMutate.mockImplementation(
      (_arg: undefined, opts: { onSuccess: () => void }) => opts.onSuccess(),
    );
    const { result } = renderHook(() => useNotificationFeed(false), {
      wrapper,
    });
    await waitFor(() => expect(result.current.notifications).toHaveLength(2));

    act(() => result.current.handleMarkAllAsRead());

    expect(result.current.notifications.every((n) => n.isRead)).toBe(true);
  });

  it("advances the page when scrolled near the bottom", async () => {
    const { result } = renderHook(() => useNotificationFeed(false), {
      wrapper,
    });
    await waitFor(() => expect(result.current.notifications).toHaveLength(2));

    act(() => {
      result.current.listRef.current = {
        scrollTop: 100,
        clientHeight: 100,
        scrollHeight: 205,
      } as HTMLDivElement;
      result.current.handleScroll();
    });

    await waitFor(() =>
      expect(h.getNotifications).toHaveBeenCalledWith(2, 10),
    );
  });

  it("does not advance the page when the list ref is unset", async () => {
    const { result } = renderHook(() => useNotificationFeed(false), {
      wrapper,
    });
    await waitFor(() => expect(result.current.notifications).toHaveLength(2));

    act(() => result.current.handleScroll());

    expect(h.getNotifications).not.toHaveBeenCalledWith(2, 10);
  });

  it("resets and refetches when the popover opens", async () => {
    const { result } = renderHook(() => useNotificationFeed(true), {
      wrapper,
    });

    await waitFor(() => expect(result.current.notifications).toHaveLength(2));
    expect(h.getNotifications).toHaveBeenCalledWith(1, 10);
  });
});

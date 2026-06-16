import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetNotifications,
  useMarkAllAsRead,
  useMarkAsRead,
} from "@/hooks/use-notifications";
import type { INotification } from "@/models";

const PAGE_SIZE = 10;

export function useNotificationFeed(open: boolean) {
  const queryClient = useQueryClient();
  const [pageNumber, setPageNumber] = useState(1);
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const listRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, isFetching } = useGetNotifications(
    pageNumber,
    PAGE_SIZE,
  );
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();

  // Merge incoming page into local list
  useEffect(() => {
    if (!data?.notifications) return;
    setNotifications((prev) => {
      const existingIds = new Set(prev.map((n) => n.id));
      const merged = [
        ...prev,
        ...data.notifications.filter((n) => !existingIds.has(n.id)),
      ];
      merged.sort(
        (a, b) =>
          new Date(b.createdTime || 0).getTime() -
          new Date(a.createdTime || 0).getTime(),
      );
      return merged;
    });
    setHasMore(pageNumber * PAGE_SIZE < (data.totalNotificationsCount ?? 0));
  }, [data, pageNumber]);

  // Reset when popover opens
  useEffect(() => {
    if (!open) return;
    setPageNumber(1);
    setNotifications([]);
    setHasMore(true);
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
  }, [open, queryClient]);

  const handleScroll = useCallback(() => {
    const el = listRef.current;
    if (!el || isLoading || isFetching || !hasMore) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 10) {
      setPageNumber((p) => p + 1);
    }
  }, [isLoading, isFetching, hasMore]);

  const handleMarkAsRead = useCallback(
    (notificationId: string) => {
      markAsRead.mutate(notificationId, {
        onSuccess: () => {
          setNotifications((prev) =>
            prev.map((n) =>
              n.id === notificationId ? { ...n, isRead: true } : n,
            ),
          );
          queryClient.invalidateQueries({ queryKey: ["notifications"] });
        },
      });
    },
    [markAsRead, queryClient],
  );

  const handleMarkAllAsRead = useCallback(() => {
    markAllAsRead.mutate(undefined, {
      onSuccess: () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
      },
    });
  }, [markAllAsRead, queryClient]);

  return {
    notifications,
    isLoading,
    isFetching,
    listRef,
    unreadCount: data?.unReadNotificationsCount ?? 0,
    handleScroll,
    handleMarkAsRead,
    handleMarkAllAsRead,
  };
}

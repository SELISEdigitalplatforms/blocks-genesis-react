import type { RefObject } from "react";
import type { INotification } from "@/models";
import { NotificationItem } from "./notification-item";

interface NotificationListProps {
  notifications: INotification[];
  isLoading: boolean;
  isFetching: boolean;
  listRef: RefObject<HTMLDivElement>;
  onScroll: () => void;
  onMarkAsRead: (id: string) => void;
}

export function NotificationList({
  notifications,
  isLoading,
  isFetching,
  listRef,
  onScroll,
  onMarkAsRead,
}: NotificationListProps) {
  const isEmpty = notifications.length === 0;

  return (
    <div
      className="max-h-[400px] overflow-y-auto"
      ref={listRef}
      onScroll={onScroll}
    >
      {isLoading && isEmpty ? (
        <div className="p-4 text-center text-sm text-muted-foreground" />
      ) : isEmpty ? (
        <div className="p-4 text-center text-sm text-muted-foreground">
          No notifications
        </div>
      ) : (
        notifications.map((notification, idx) => (
          <NotificationItem
            key={notification.id || idx}
            notification={notification}
            onMarkAsRead={onMarkAsRead}
          />
        ))
      )}
      {isFetching && !isEmpty && (
        <div className="p-2 text-center text-xs text-muted-foreground">
          Loading...
        </div>
      )}
    </div>
  );
}

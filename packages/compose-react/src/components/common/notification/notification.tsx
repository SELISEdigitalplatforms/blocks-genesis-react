import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components";
import { useNotificationSocket } from "./use-notification-socket";
import { useNotificationFeed } from "./use-notification-feed";
import { NotificationBell } from "./notification-bell";
import { NotificationHeader } from "./notification-header";
import { NotificationList } from "./notification-list";

export function Notification() {
  const [open, setOpen] = useState(false);

  useNotificationSocket();

  const {
    notifications,
    isLoading,
    isFetching,
    listRef,
    unreadCount,
    handleScroll,
    handleMarkAsRead,
    handleMarkAllAsRead,
  } = useNotificationFeed(open);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div>
          <NotificationBell unreadCount={unreadCount} />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[370px] p-0">
        <NotificationHeader onMarkAllAsRead={handleMarkAllAsRead} />
        <NotificationList
          notifications={notifications}
          isLoading={isLoading}
          isFetching={isFetching}
          listRef={listRef}
          onScroll={handleScroll}
          onMarkAsRead={handleMarkAsRead}
        />
      </PopoverContent>
    </Popover>
  );
}

import { Bell } from "lucide-react";

interface NotificationBellProps {
  unreadCount: number;
}

export function NotificationBell({ unreadCount }: NotificationBellProps) {
  const isOver99 = unreadCount > 99;
  return (
    <div className="relative" data-testid="notification-bell">
      <Bell className="h-5 w-5 cursor-pointer text-muted-foreground transition-colors hover:text-primary" />
      {unreadCount > 0 && (
        <span
          className={`absolute -right-[6px] -top-[8px] flex items-center justify-center rounded-full bg-blue-500 font-medium text-white ${
            isOver99
              ? "h-[18px] w-[18px] text-[8px]"
              : "h-[16px] w-[16px] text-[10px]"
          }`}
        >
          {isOver99 ? "99+" : unreadCount}
        </span>
      )}
    </div>
  );
}

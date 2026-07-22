interface NotificationHeaderProps {
  onMarkAllAsRead: () => void;
}

export function NotificationHeader({
  onMarkAllAsRead,
}: NotificationHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b px-4 py-3">
      <p className="text-base font-semibold text-primary">Notifications</p>
      <button
        onClick={onMarkAllAsRead}
        className="text-xs text-muted-foreground hover:text-primary hover:underline"
      >
        Mark all as read
      </button>
    </div>
  );
}

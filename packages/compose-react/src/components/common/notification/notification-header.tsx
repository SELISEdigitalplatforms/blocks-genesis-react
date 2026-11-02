import { useT } from "@/i18n";
interface NotificationHeaderProps {
  onMarkAllAsRead: () => void;
}

export function NotificationHeader({
  onMarkAllAsRead,
}: NotificationHeaderProps) {
  const { t } = useT("genesis.shared");
  return (
    <div className="flex items-center justify-between border-b px-4 py-3">
      <p className="text-base font-semibold text-primary">
        {t("NOTIFICATION_HEADER.TITLE")}
      </p>
      <button
        onClick={onMarkAllAsRead}
        className="text-xs text-muted-foreground hover:text-primary hover:underline"
      >
        {t("NOTIFICATION_HEADER.MARK_ALL_READ")}
      </button>
    </div>
  );
}

import { useT } from "@/i18n";
import type { IDenormalizedPayload, INotification } from "@/models";
import { formatKBMetaDescription, formatKBTitle } from "./utils";

interface NotificationItemProps {
  notification: INotification;
  onMarkAsRead: (id: string) => void;
  /** The page this notification opens in this app; without one the row is not a link. */
  href?: string | null;
  onOpen?: (notification: INotification, href: string) => void;
}

export function NotificationItem({
  notification,
  onMarkAsRead,
  href,
  onOpen,
}: Readonly<NotificationItemProps>) {
  const { t, language } = useT("genesis.shared");
  let denorm: IDenormalizedPayload = {
    title: "",
    description: "",
    redirectPath: "",
    toastable: false,
    meta: "",
  };

  try {
    denorm = JSON.parse(
      notification.denormalizedPayload,
    ) as IDenormalizedPayload;
  } catch {
    console.error(
      "Failed to parse denormalized payload",
      notification.denormalizedPayload,
    );
  }

  const rowClassName = `flex w-full items-start gap-3 border-b px-4 py-3 text-left last:border-b-0 ${
    notification.isRead ? "" : "bg-muted/60"
  }`;
  const markAsRead = () => {
    if (!notification.isRead) onMarkAsRead(notification.id);
  };
  const content = (
    <div className="min-w-0 flex-1">
      <p className="text-sm font-medium">{formatKBTitle(denorm.title, t)}</p>
      <p className="text-xs text-muted-foreground">
        {formatKBMetaDescription(denorm.meta, denorm.description, t)}
      </p>
      {notification.createdTime && (
        <p className="mt-1 text-[11px] text-muted-foreground">
          {new Date(notification.createdTime).toLocaleString(language)}
        </p>
      )}
    </div>
  );

  if (href && onOpen) {
    return (
      <button
        type="button"
        className={`${rowClassName} cursor-pointer hover:bg-muted`}
        onMouseEnter={markAsRead}
        onClick={() => onOpen(notification, href)}
      >
        {content}
      </button>
    );
  }

  return (
    <div className={rowClassName} onMouseEnter={markAsRead}>
      {content}
    </div>
  );
}

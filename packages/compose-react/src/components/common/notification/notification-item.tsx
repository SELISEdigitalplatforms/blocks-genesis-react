import type { IDenormalizedPayload, INotification } from "@/models";
import { formatKBMetaDescription, formatKBTitle } from "./utils";

interface NotificationItemProps {
  notification: INotification;
  onMarkAsRead: (id: string) => void;
}

export function NotificationItem({
  notification,
  onMarkAsRead,
}: NotificationItemProps) {
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

  return (
    <div
      className={`flex cursor-pointer items-start gap-3 border-b px-4 py-3 last:border-b-0 ${
        !notification.isRead ? "bg-muted/60" : ""
      }`}
      onMouseEnter={() => {
        if (!notification.isRead) onMarkAsRead(notification.id);
      }}
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{formatKBTitle(denorm.title)}</p>
        <p className="text-xs text-muted-foreground">
          {formatKBMetaDescription(denorm.meta, denorm.description)}
        </p>
        {notification.createdTime && (
          <p className="mt-1 text-[11px] text-muted-foreground">
            {new Date(notification.createdTime).toLocaleString()}
          </p>
        )}
      </div>
    </div>
  );
}

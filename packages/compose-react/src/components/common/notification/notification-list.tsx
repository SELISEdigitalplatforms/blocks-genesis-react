import { useT } from "@/i18n";
import type { RefObject } from "react";
import type { INotification } from "@/models";
import { NotificationItem } from "./notification-item";

interface NotificationListProps {
  notifications: INotification[];
  isLoading: boolean;
  isFetching: boolean;
  listRef: RefObject<HTMLDivElement | null>;
  onScroll: () => void;
  onMarkAsRead: (id: string) => void;
  getHref?: (notification: INotification) => string | null;
  onOpen?: (notification: INotification, href: string) => void;
}

export function NotificationList({
  notifications,
  isLoading,
  isFetching,
  listRef,
  onScroll,
  onMarkAsRead,
  getHref,
  onOpen,
}: Readonly<NotificationListProps>) {
  const { t } = useT("genesis.shared");
  const isEmpty = notifications.length === 0;

  const renderNotifications = () => {
    if (isLoading && isEmpty) {
      return <div className="p-4 text-center text-sm text-muted-foreground" />;
    }
    if (isEmpty) {
      return (
        <div className="p-4 text-center text-sm text-muted-foreground">
          {t("NOTIFICATION_LIST.EMPTY")}
        </div>
      );
    }
    return notifications.map((notification, idx) => (
      <NotificationItem
        key={notification.id || idx}
        notification={notification}
        onMarkAsRead={onMarkAsRead}
        href={getHref?.(notification)}
        onOpen={onOpen}
      />
    ));
  };

  return (
    <div
      className="max-h-[400px] overflow-y-auto"
      ref={listRef}
      onScroll={onScroll}
    >
      {renderNotifications()}
      {isFetching && !isEmpty && (
        <div className="p-2 text-center text-xs text-muted-foreground">
          {t("common:LOADING")}
        </div>
      )}
    </div>
  );
}

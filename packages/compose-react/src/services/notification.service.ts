import { notificationClient } from "@/lib/http/instances";
import type { INotification, INotificationConfig } from "@/models";
import {
  NOTIFICATION_ENDPOINTS,
  NOTIFICATION_CONFIG_ENDPOINTS,
} from "@/constants/endpoint.constant";

export class NotificationService {
  private readonly notificationService = notificationClient;

  getNotifications = (
    pageNumber: number,
    pageSize: number,
  ): Promise<{
    unReadNotificationsCount: number;
    totalNotificationsCount: number;
    notifications: INotification[];
  }> => {
    const params = new URLSearchParams({
      page: String(pageNumber - 1),
      pageSize: String(pageSize),
    });
    return this.notificationService.get(
      `${NOTIFICATION_ENDPOINTS.GET_NOTIFICATIONS}?${params}`,
    );
  };

  markAsRead = (
    notificationId: string,
  ): Promise<{ errors: null | unknown; isSuccess: boolean }> => {
    return this.notificationService.post(NOTIFICATION_ENDPOINTS.MARK_AS_READ, {
      id: notificationId,
    });
  };

  markAllNotificationsAsRead = (): Promise<{
    errors: null | unknown;
    isSuccess: boolean;
  }> => {
    return this.notificationService.post(
      NOTIFICATION_ENDPOINTS.MARK_ALL_AS_READ,
      {},
    );
  };

  getNotificationConfig = (
    config: INotificationConfig,
    message: string,
  ): void => {
    let parsedMessage: unknown = message;
    if (typeof message === "string") {
      try {
        parsedMessage = JSON.parse(message);
      } catch {
        parsedMessage = message;
      }
    }
    const notificationEvent = new CustomEvent(config.notifyMethod, {
      detail: {
        method: config.notifyMethod,
        message: parsedMessage,
        timestamp: new Date().toISOString(),
        config: config,
      },
    });
    window.dispatchEvent(notificationEvent);
  };

  getNotificationConfigs = (
    page: number = 0,
    pageSize: number = 10,
    projectKey: string,
  ): Promise<{
    configurations: INotificationConfig[];
    totalCount: number;
    errors: null | unknown;
    isSuccess: boolean;
  }> => {
    const url = `${NOTIFICATION_CONFIG_ENDPOINTS.GET_CONFIGS}?page=${page}&pageSize=${pageSize}&projectKey=${projectKey}`;
    return this.notificationService.get(url);
  };
}

export const notificationService = new NotificationService();

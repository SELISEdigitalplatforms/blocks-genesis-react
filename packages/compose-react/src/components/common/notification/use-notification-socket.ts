import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { notificationListenerService } from "@/services/notification-listener.service";
import { notificationService } from "@/services/notification.service";
import { useGetBlocksNotificationConfig } from "@/hooks/use-notifications";
import type { IDenormalizedPayload } from "@/models";

export function useNotificationSocket() {
  const { data: configData } = useGetBlocksNotificationConfig(0, 100);
  const queryClient = useQueryClient();

  notificationListenerService.connect();

  useEffect(() => {
    notificationListenerService.connect();
    return () => {
      notificationListenerService.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!configData?.configurations) return;

    configData.configurations.forEach((config) => {
      notificationListenerService.connection.on(
        config.notifyMethod,
        (message: string) => {
          notificationService.getNotificationConfig(config, message);
          try {
            const notice =
              typeof message === "string" ? JSON.parse(message) : message;
            const denom = JSON.parse(
              notice.denormalizedPayload,
            ) as IDenormalizedPayload;

            if (denom?.title || denom?.description) {
              queryClient.invalidateQueries({ queryKey: ["notifications"] });
            }
          } catch (error) {
            console.error("Error processing notification message:", error);
          }
        },
      );
    });
  }, [configData, queryClient]);
}

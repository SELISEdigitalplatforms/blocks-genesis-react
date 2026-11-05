import { useCallback } from "react";
import { useNavigate, useParams } from "react-router";
import { useBlocksAppConfigStore } from "@/hooks/use-blocks-app-config-store";
import type { INotification } from "@/models";
import { getNotificationHref } from "./notification-link";

/** The page a notification opens in this app (`getHref`), and the move there (`open`). */
export function useNotificationOpen() {
  const navigate = useNavigate();
  const { itemId } = useParams();
  const app = useBlocksAppConfigStore((state) => state.config.name);

  const getHref = useCallback(
    (notification: INotification) =>
      getNotificationHref(notification.denormalizedPayload, app, itemId),
    [app, itemId],
  );
  const open = useCallback((href: string) => navigate(href), [navigate]);

  return { getHref, open };
}

import { describe, it, expect, vi, beforeEach } from "vitest";

const c = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }));
vi.mock("@/lib/http/instances", () => ({
  notificationClient: c,
  iamClient: c,
  logicClient: c,
}));
vi.mock("@/lib/http", () => ({ logicClient: c, iamClient: c }));
vi.mock("@/lib", () => ({ iamClient: c }));

import { notificationService } from "@/services/notification.service";
import { impersonationService } from "@/services/impersonation.service";
import { serviceRegistryService } from "@/services/service-registry.service";
import { authService } from "@/services/auth.service";
import { organizationService } from "@/services/organization.service";
import { userService } from "@/services/user.service";
import {
  NOTIFICATION_ENDPOINTS,
  IMPERSONATE_ENDPOINTS,
  SERVICE_REGISTRY_ENDPOINTS,
  AUTH_ENDPOINTS,
  ORGANIZATION_ENDPOINTS,
  PROFILE_ENDPOINTS,
} from "@/constants/endpoint.constant";

beforeEach(() => {
  c.get.mockReset().mockResolvedValue("ok");
  c.post.mockReset().mockResolvedValue("ok");
});

describe("NotificationService", () => {
  it("getNotifications requests a zero-based page", async () => {
    await notificationService.getNotifications(1, 20);
    expect(c.get).toHaveBeenCalledWith(
      expect.stringContaining(`${NOTIFICATION_ENDPOINTS.GET_NOTIFICATIONS}?`),
    );
    expect(c.get.mock.calls[0]?.[0]).toContain("page=0");
  });

  it("markAsRead posts the notification id", async () => {
    await notificationService.markAsRead("n1");
    expect(c.post).toHaveBeenCalledWith(NOTIFICATION_ENDPOINTS.MARK_AS_READ, {
      id: "n1",
    });
  });

  it("markAllNotificationsAsRead posts an empty body", async () => {
    await notificationService.markAllNotificationsAsRead();
    expect(c.post).toHaveBeenCalledWith(
      NOTIFICATION_ENDPOINTS.MARK_ALL_AS_READ,
      {},
    );
  });

  it("getNotificationConfigs requests the configs page", async () => {
    await notificationService.getNotificationConfigs(2, 5);
    expect(c.get.mock.calls[0]?.[0]).toContain("page=2");
  });

  it("getNotificationConfig dispatches a window CustomEvent (parsed JSON)", () => {
    const listener = vi.fn();
    window.addEventListener("myMethod", listener);
    notificationService.getNotificationConfig(
      { notifyMethod: "myMethod" } as never,
      JSON.stringify({ a: 1 }),
    );
    notificationService.getNotificationConfig(
      { notifyMethod: "myMethod" } as never,
      "not-json",
    );
    expect(listener).toHaveBeenCalledTimes(2);
    window.removeEventListener("myMethod", listener);
  });
});

describe("ImpersonationService", () => {
  it("startImpersonation posts the request", async () => {
    await impersonationService.startImpersonation({ x: 1 } as never);
    expect(c.post).toHaveBeenCalledWith(IMPERSONATE_ENDPOINTS.IMPERSONATE, {
      x: 1,
    });
  });

  it("stopImpersonation skips token rotation", async () => {
    await impersonationService.stopImpersonation();
    expect(c.post).toHaveBeenCalledWith(
      IMPERSONATE_ENDPOINTS.STOP_IMPERSONATION,
      {},
      undefined,
      { skipTokenRotation: true },
    );
  });

  it("impersonationStatus posts null", async () => {
    await impersonationService.impersonationStatus();
    expect(c.post).toHaveBeenCalledWith(
      IMPERSONATE_ENDPOINTS.IMPERSONATION_STATUS,
      null,
    );
  });
});

describe("other thin services", () => {
  it("serviceRegistry.getAllServices posts the payload", async () => {
    await serviceRegistryService.getAllServices({ p: 1 } as never);
    expect(c.post).toHaveBeenCalledWith(SERVICE_REGISTRY_ENDPOINTS.GET_ALL, {
      p: 1,
    });
  });

  it("authService.logout posts to the logout endpoint", async () => {
    await authService.logout();
    expect(c.post).toHaveBeenCalledWith(AUTH_ENDPOINTS.LOGOUT, {});
  });

  it("organizationService.getMyOrganizations gets the orgs", async () => {
    await organizationService.getMyOrganizations();
    expect(c.get).toHaveBeenCalledWith(
      ORGANIZATION_ENDPOINTS.GET_MY_ORGANIZATIONS,
    );
  });

  it("userService.getUserInfo gets the profile", async () => {
    await userService.getUserInfo();
    expect(c.get).toHaveBeenCalledWith(PROFILE_ENDPOINTS.ME);
  });
});

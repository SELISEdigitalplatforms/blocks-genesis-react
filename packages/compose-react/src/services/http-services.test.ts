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
import type { RuntimeEnvWindow } from "@/lib/runtime-env";
import {
  NOTIFICATION_ENDPOINTS,
  NOTIFICATION_CONFIG_ENDPOINTS,
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
    expect(c.get.mock.calls[0]?.[0]).toContain("pageSize=20");
    expect(c.get.mock.calls[0]?.[0]).not.toContain("includeConsoleBuiltIns");
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

  describe("getNotificationConfigs", () => {
    const configsUrl = (page: number, pageSize: number) =>
      `${NOTIFICATION_CONFIG_ENDPOINTS.GET_CONFIGS}?page=${page}&pageSize=${pageSize}&includeConsoleBuiltIns=true`;

    it("asks for the console built-ins on the bell's configs page", async () => {
      await notificationService.getNotificationConfigs(0, 100);

      expect(c.get).toHaveBeenCalledTimes(1);
      expect(c.get.mock.calls[0]).toEqual([
        "/api/Notification/Gets?page=0&pageSize=100&includeConsoleBuiltIns=true",
      ]);
    });

    it("keeps the default page and size", async () => {
      await notificationService.getNotificationConfigs();

      expect(c.get).toHaveBeenCalledTimes(1);
      expect(c.get.mock.calls[0]).toEqual([configsUrl(0, 10)]);
    });

    it("requests the configs page with the flag for any page and size", async () => {
      await notificationService.getNotificationConfigs(2, 5);

      expect(c.get).toHaveBeenCalledTimes(1);
      expect(c.get.mock.calls[0]).toEqual([
        "/api/Notification/Gets?page=2&pageSize=5&includeConsoleBuiltIns=true",
      ]);
    });

    it("returns the client's response object unchanged", async () => {
      const response = {
        configurations: [
          { notifyMethod: "OnNotice" },
          { notifyMethod: "schema-import" },
        ],
        totalCount: 1,
        errors: null,
        isSuccess: true,
      };
      c.get.mockResolvedValueOnce(response);

      await expect(
        notificationService.getNotificationConfigs(0, 100),
      ).resolves.toBe(response);
      expect(response).toEqual({
        configurations: [
          { notifyMethod: "OnNotice" },
          { notifyMethod: "schema-import" },
        ],
        totalCount: 1,
        errors: null,
        isSuccess: true,
      });
    });

    it("rejects as the client does, without a second request", async () => {
      const failure = new Error("HTTP 500");
      c.get.mockRejectedValueOnce(failure);

      await expect(
        notificationService.getNotificationConfigs(0, 100),
      ).rejects.toBe(failure);
      expect(c.get).toHaveBeenCalledTimes(1);
    });

    it("sends the literal flag once and nothing taken from session or storage", async () => {
      const runtimeEnv = globalThis as RuntimeEnvWindow;
      localStorage.setItem("tenantId", "tenant-a");
      sessionStorage.setItem("access_token", "token-a");
      runtimeEnv.__BLOCKS_ENV__ = { X_BLOCKS_KEY: "key-a" };
      try {
        await notificationService.getNotificationConfigs(0, 100);
        localStorage.setItem("tenantId", "tenant-b");
        sessionStorage.setItem("access_token", "token-b");
        runtimeEnv.__BLOCKS_ENV__ = { X_BLOCKS_KEY: "key-b" };
        await notificationService.getNotificationConfigs(0, 100);
      } finally {
        localStorage.removeItem("tenantId");
        sessionStorage.removeItem("access_token");
        delete runtimeEnv.__BLOCKS_ENV__;
      }

      expect(c.get).toHaveBeenCalledTimes(2);
      const [first, second] = c.get.mock.calls.map((call) => String(call[0]));
      expect(second).toBe(first);
      const params = new URLSearchParams(first?.split("?")[1]);
      expect([...params.keys()]).toEqual([
        "page",
        "pageSize",
        "includeConsoleBuiltIns",
      ]);
      expect(params.getAll("includeConsoleBuiltIns")).toEqual(["true"]);
    });
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

  it("getNotificationConfig dispatches the schema-import event with the parsed message", () => {
    const config = {
      notifyMethod: "schema-import",
      configurationName: "schema-import",
    } as never;
    const denormalizedPayload = JSON.stringify({
      CorrelationId: "c-1",
      IsSuccess: true,
    });
    const listener = vi.fn();
    globalThis.addEventListener("schema-import", listener);
    try {
      notificationService.getNotificationConfig(
        config,
        JSON.stringify({
          notificationId: "n1",
          configurationName: "schema-import",
          responseKey: "c-1",
          responseValue: "",
          denormalizedPayload,
        }),
      );
    } finally {
      globalThis.removeEventListener("schema-import", listener);
    }

    expect(listener).toHaveBeenCalledTimes(1);
    const event = listener.mock.calls[0]?.[0] as CustomEvent;
    expect(event).toBeInstanceOf(CustomEvent);
    expect(event.type).toBe("schema-import");
    expect(event.detail).toEqual({
      method: "schema-import",
      message: {
        notificationId: "n1",
        configurationName: "schema-import",
        responseKey: "c-1",
        responseValue: "",
        denormalizedPayload,
      },
      timestamp: expect.any(String),
      config,
    });
    expect(event.detail.config).toBe(config);
    expect(new Date(event.detail.timestamp).toISOString()).toBe(
      event.detail.timestamp,
    );
  });
});

describe("ImpersonationService", () => {
  // The hooks call these inside the session lock with their own request options; the service passes
  // them through untouched.
  const insideLock = { skipTokenRotation: true, skipSessionCheck: true };

  it("startImpersonation posts the request", async () => {
    await impersonationService.startImpersonation(
      { x: 1 } as never,
      insideLock,
    );
    expect(c.post).toHaveBeenCalledWith(
      IMPERSONATE_ENDPOINTS.IMPERSONATE,
      { x: 1 },
      undefined,
      insideLock,
    );
  });

  it("stopImpersonation posts with the caller's options", async () => {
    await impersonationService.stopImpersonation(insideLock);
    expect(c.post).toHaveBeenCalledWith(
      IMPERSONATE_ENDPOINTS.STOP_IMPERSONATION,
      {},
      undefined,
      insideLock,
    );
  });

  it("impersonationStatus posts null", async () => {
    await impersonationService.impersonationStatus();
    expect(c.post).toHaveBeenCalledWith(
      IMPERSONATE_ENDPOINTS.IMPERSONATION_STATUS,
      null,
      undefined,
      undefined,
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

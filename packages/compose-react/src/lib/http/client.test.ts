import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const h = vi.hoisted(() => ({
  runtimeEnv: {} as Record<string, string>,
  cancelQueries: vi.fn(),
  clear: vi.fn(),
  resetAuthStore: vi.fn(),
  resetProjectStore: vi.fn(),
}));

vi.mock("@/lib/runtime-env", () => ({
  getRuntimeEnv: (key: string) => h.runtimeEnv[key] ?? "",
}));
vi.mock("@/providers/query-client", () => ({
  getQueryClient: () => ({ cancelQueries: h.cancelQueries, clear: h.clear }),
}));
vi.mock("@/store/auth.store", () => ({
  useAuthStore: { getState: () => ({ resetAuthStore: h.resetAuthStore }) },
}));
vi.mock("@/store/project.store", () => ({
  useProjectStore: {
    getState: () => ({ resetProjectStore: h.resetProjectStore }),
  },
}));

import type Rollbar from "rollbar";
import { HttpClient } from "@/lib/http/client";
import { HttpError } from "@/lib/http/error";
import type { HttpRequestFailure } from "@/lib/http/types";
import { createHttpFailureReporter } from "@/observability/report-http-errors";

type ResOpts = {
  status?: number;
  ok?: boolean;
  contentType?: string;
  contentLength?: string;
  json?: unknown;
  text?: string;
  textRejects?: unknown;
  blob?: unknown;
  body?: unknown;
  jsonThrows?: boolean;
};

// `text()` answers like a real body: the given text, else the serialised `json`, else "".
const res = (opts: ResOpts) => {
  const status = opts.status ?? 200;
  const headerValues: Record<string, string | undefined> = {
    "content-type": opts.contentType,
    "content-length": opts.contentLength,
  };
  return {
    status,
    ok: opts.ok ?? (status >= 200 && status < 300),
    headers: {
      get: (key: string) => headerValues[key.toLowerCase()] ?? null,
    },
    json: vi.fn(async () => {
      if (opts.jsonThrows) throw new Error("bad json");
      return opts.json;
    }),
    text: vi.fn(async () => {
      if (opts.textRejects !== undefined) throw opts.textRejects;
      if (opts.text !== undefined) return opts.text;
      return "json" in opts ? JSON.stringify(opts.json) : "";
    }),
    blob: vi.fn(async () => opts.blob),
    body: opts.body ?? null,
  };
};

type MockResponse = ReturnType<typeof res>;

const expectNoBodyRead = (response: MockResponse) => {
  expect(response.text).not.toHaveBeenCalled();
  expect(response.json).not.toHaveBeenCalled();
  expect(response.blob).not.toHaveBeenCalled();
};

const expectOneTextRead = (response: MockResponse) => {
  expect(response.text).toHaveBeenCalledTimes(1);
  expect(response.json).not.toHaveBeenCalled();
  expect(response.blob).not.toHaveBeenCalled();
};

const originalLocation = window.location;
let fetchMock: ReturnType<typeof vi.fn>;

const makeClient = (over: Record<string, unknown> = {}) =>
  new HttpClient({
    baseURL: "https://api.test",
    blocksKey: "tenant-1",
    ...over,
  });

const lastConfig = () =>
  fetchMock.mock.calls[fetchMock.mock.calls.length - 1]![1];

const setLocation = (pathname: string) => {
  const replace = vi.fn();
  Object.defineProperty(window, "location", {
    configurable: true,
    value: { pathname, replace },
  });
  return replace;
};

beforeEach(() => {
  vi.clearAllMocks();
  h.runtimeEnv = {};
  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
  Object.defineProperty(window, "location", {
    configurable: true,
    value: originalLocation,
  });
});

describe("HttpClient request basics", () => {
  it("sends a GET with default headers and returns parsed JSON", async () => {
    fetchMock.mockResolvedValueOnce(
      res({ contentType: "application/json", json: { ok: 1 } }),
    );
    const out = await makeClient().get("/users");
    expect(out).toEqual({ ok: 1 });
    const [url, cfg] = fetchMock.mock.calls[0]!;
    expect(url).toBe("https://api.test/users");
    expect(cfg.method).toBe("GET");
    expect(cfg.credentials).toBe("include");
    const headers = cfg.headers as Headers;
    expect(headers.get("X-Blocks-Key")).toBe("tenant-1");
    expect(headers.get("Accept")).toBe("application/json");
  });

  it("resolves baseURL and blocksKey from functions", async () => {
    fetchMock.mockResolvedValueOnce(
      res({ contentType: "application/json", json: {} }),
    );
    await makeClient({
      baseURL: () => "https://fn.test",
      blocksKey: () => "fn-key",
    }).get("/x");
    const [url, cfg] = fetchMock.mock.calls[0]!;
    expect(url).toBe("https://fn.test/x");
    expect((cfg.headers as Headers).get("X-Blocks-Key")).toBe("fn-key");
  });

  it("omits the blocks key header when skipBlocksKey is set", async () => {
    fetchMock.mockResolvedValueOnce(
      res({ contentType: "application/json", json: {} }),
    );
    await makeClient().get("/x", undefined, { skipBlocksKey: true });
    expect((lastConfig().headers as Headers).get("X-Blocks-Key")).toBeNull();
  });

  it("uses the url as-is when absoluteUrl is set", async () => {
    fetchMock.mockResolvedValueOnce(
      res({ contentType: "application/json", json: {} }),
    );
    await makeClient().get("https://abs.test/y", undefined, {
      absoluteUrl: true,
    });
    expect(fetchMock.mock.calls[0]?.[0]).toBe("https://abs.test/y");
  });

  it("omits credentials when withCredentials is false", async () => {
    fetchMock.mockResolvedValueOnce(
      res({ contentType: "application/json", json: {} }),
    );
    await makeClient().get("/x", undefined, { withCredentials: false });
    expect(lastConfig().credentials).toBe("omit");
  });

  it("merges header inputs given as Headers, arrays, or objects", async () => {
    fetchMock.mockResolvedValue(
      res({ contentType: "application/json", json: {} }),
    );
    const client = makeClient();
    await client.get("/a", new Headers({ "X-A": "1" }));
    expect((lastConfig().headers as Headers).get("X-A")).toBe("1");
    await client.get("/b", [["X-B", "2"]]);
    expect((lastConfig().headers as Headers).get("X-B")).toBe("2");
    await client.get("/c", { "X-C": "3" });
    expect((lastConfig().headers as Headers).get("X-C")).toBe("3");
  });
});

describe("HttpClient body handling", () => {
  beforeEach(() =>
    fetchMock.mockResolvedValue(
      res({ contentType: "application/json", json: {} }),
    ),
  );

  it("JSON-stringifies plain object bodies", async () => {
    await makeClient().post("/x", { a: 1 });
    expect(lastConfig().body).toBe(JSON.stringify({ a: 1 }));
    expect((lastConfig().headers as Headers).get("Content-Type")).toBe(
      "application/json",
    );
  });

  it("passes string bodies through unchanged", async () => {
    await makeClient().post("/x", "raw");
    expect(lastConfig().body).toBe("raw");
  });

  it("sends FormData without a JSON content type", async () => {
    const fd = new FormData();
    fd.append("f", "v");
    await makeClient().post("/x", fd);
    expect(lastConfig().body).toBe(fd);
    expect((lastConfig().headers as Headers).get("Content-Type")).toBeNull();
  });

  it("sends URLSearchParams without a JSON content type", async () => {
    const params = new URLSearchParams({ a: "1" });
    await makeClient().post("/x", params);
    expect(lastConfig().body).toBe(params);
  });

  it("sends an undefined body for null input", async () => {
    await makeClient().post("/x", null);
    expect(lastConfig().body).toBeUndefined();
  });
});

describe("HttpClient response decoding", () => {
  it("returns a success envelope when there is no content type", async () => {
    fetchMock.mockResolvedValueOnce(res({ status: 204 }));
    expect(await makeClient().get("/x")).toEqual({
      success: true,
      status: 204,
    });
  });

  it("throws on an unexpected HTML response", async () => {
    fetchMock.mockResolvedValueOnce(res({ contentType: "text/html" }));
    await expect(makeClient().get("/x")).rejects.toMatchObject({
      status: 200,
      errors: { general: "Unexpected HTML response from server" },
    });
  });

  it("returns text for text/* responses", async () => {
    fetchMock.mockResolvedValueOnce(
      res({ contentType: "text/plain", text: "hello" }),
    );
    expect(await makeClient().get("/x")).toBe("hello");
  });

  it("returns a blob for binary responses", async () => {
    const blob = new Blob(["x"]);
    fetchMock.mockResolvedValueOnce(
      res({ contentType: "application/pdf", blob }),
    );
    expect(await makeClient().get("/x")).toBe(blob);
  });

  it("returns a blob for octet-stream responses", async () => {
    const blob = new Blob(["y"]);
    fetchMock.mockResolvedValueOnce(
      res({ contentType: "application/octet-stream", blob }),
    );
    expect(await makeClient().get("/x")).toBe(blob);
  });
});

describe("HttpClient error responses", () => {
  it("throws HttpError carrying server errors on a non-ok response", async () => {
    fetchMock.mockResolvedValueOnce(
      res({
        status: 400,
        contentType: "application/json",
        json: { errors: { name: "required" } },
      }),
    );
    await expect(makeClient().get("/x")).rejects.toMatchObject({
      status: 400,
      errors: { name: "required" },
    });
  });

  it("uses the raw error body when it has no errors field", async () => {
    fetchMock.mockResolvedValueOnce(
      res({
        status: 500,
        contentType: "application/json",
        json: { message: "boom" },
      }),
    );
    await expect(makeClient().get("/x")).rejects.toMatchObject({
      status: 500,
      errors: { message: "boom" },
    });
  });

  it("wraps a thrown object as a 500 HttpError", async () => {
    fetchMock.mockRejectedValueOnce({ code: "ENET" });
    await expect(makeClient().get("/x")).rejects.toMatchObject({
      status: 500,
      errors: { code: "ENET" },
    });
  });

  it("wraps a thrown primitive as a generic 500 HttpError", async () => {
    fetchMock.mockRejectedValueOnce("boom");
    await expect(makeClient().get("/x")).rejects.toMatchObject({
      status: 500,
      errors: { general: "Something went wrong" },
    });
  });
});

describe("HttpClient method delegation", () => {
  beforeEach(() =>
    fetchMock.mockResolvedValue(
      res({ contentType: "application/json", json: {} }),
    ),
  );

  it("issues PUT, PATCH and DELETE with the right verb", async () => {
    const client = makeClient();
    await client.put("/x", {});
    expect(lastConfig().method).toBe("PUT");
    await client.patch("/x", {});
    expect(lastConfig().method).toBe("PATCH");
    await client.delete("/x");
    expect(lastConfig().method).toBe("DELETE");
  });
});

describe("HttpClient token refresh", () => {
  it("refreshes then retries the request on a 401", async () => {
    h.runtimeEnv = {
      BLOCKS_OIDC_CLIENT_ID: "cid",
      BLOCKS_IAM_BASE_URL: "https://iam.test",
    };
    const onTokenRefresh = vi.fn().mockResolvedValue({});
    fetchMock
      .mockResolvedValueOnce(res({ status: 401 }))
      .mockResolvedValueOnce(res({ status: 200 }))
      .mockResolvedValueOnce(
        res({ contentType: "application/json", json: { ok: 2 } }),
      );
    const out = await makeClient({ onTokenRefresh }).get("/x");
    expect(out).toEqual({ ok: 2 });
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(onTokenRefresh).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[1]?.[0]).toContain("/api/oidc/token");
  });

  it("resets state and redirects to login when refresh fails", async () => {
    const replace = setLocation("/dashboard");
    const onUnauthorized = vi.fn();
    fetchMock.mockResolvedValueOnce(res({ status: 401 }));
    await expect(
      makeClient({ onUnauthorized }).get("/x"),
    ).rejects.toMatchObject({ status: 401 });
    expect(h.resetAuthStore).toHaveBeenCalledTimes(1);
    expect(h.resetProjectStore).toHaveBeenCalledTimes(1);
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
    expect(replace).toHaveBeenCalledWith("/login");
  });

  it("does not redirect when auto-redirect is disabled", async () => {
    const replace = setLocation("/dashboard");
    fetchMock.mockResolvedValueOnce(res({ status: 401 }));
    await expect(
      makeClient({ autoRedirectOnAuthFailure: false }).get("/x"),
    ).rejects.toMatchObject({ status: 401 });
    expect(replace).not.toHaveBeenCalled();
  });

  it("does not redirect from an excluded path", async () => {
    const replace = setLocation("/login");
    fetchMock.mockResolvedValueOnce(res({ status: 401 }));
    await expect(makeClient().get("/x")).rejects.toMatchObject({
      status: 401,
    });
    expect(replace).not.toHaveBeenCalled();
  });

  it("skips rotation and surfaces the 401 body when skipTokenRotation is set", async () => {
    fetchMock.mockResolvedValueOnce(
      res({
        status: 401,
        contentType: "application/json",
        json: { errors: { general: "nope" } },
      }),
    );
    await expect(
      makeClient().get("/x", undefined, { skipTokenRotation: true }),
    ).rejects.toMatchObject({ status: 401, errors: { general: "nope" } });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe("HttpClient after a refresh moves the session", () => {
  const refreshEnv = {
    BLOCKS_OIDC_CLIENT_ID: "cid",
    BLOCKS_IAM_BASE_URL: "https://iam.test",
  };
  let unregister: () => void = () => undefined;

  const guard = (
    expected: string | null,
    confirmed: () => Promise<string | null>,
  ) => {
    const confirmTenant = vi.fn(confirmed);
    unregister = HttpClient.setSessionGuard({
      expectedTenant: () => expected,
      confirmTenant,
    });
    return confirmTenant;
  };

  beforeEach(() => {
    h.runtimeEnv = refreshEnv;
  });

  afterEach(() => unregister());

  it("does not send the request again in another tenant", async () => {
    const confirmTenant = guard("t1", async () => "t2");
    fetchMock
      .mockResolvedValueOnce(res({ status: 401 }))
      .mockResolvedValueOnce(res({ status: 200 }));

    await expect(makeClient().get("/repos")).rejects.toMatchObject({
      status: 409,
    });
    // The 401, then the refresh -- and no retry answered with the other tenant's data.
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(confirmTenant).toHaveBeenCalledTimes(1);
  });

  it("retries when the session is still in the tenant the page expects", async () => {
    guard("t1", async () => "T1");
    fetchMock
      .mockResolvedValueOnce(res({ status: 401 }))
      .mockResolvedValueOnce(res({ status: 200 }))
      .mockResolvedValueOnce(
        res({ contentType: "application/json", json: { ok: 3 } }),
      );

    await expect(makeClient().get("/repos")).resolves.toEqual({ ok: 3 });
  });

  it("retries when the tenant could not be confirmed", async () => {
    guard("t1", async () => null);
    fetchMock
      .mockResolvedValueOnce(res({ status: 401 }))
      .mockResolvedValueOnce(res({ status: 200 }))
      .mockResolvedValueOnce(
        res({ contentType: "application/json", json: { ok: 4 } }),
      );

    await expect(makeClient().get("/repos")).resolves.toEqual({ ok: 4 });
  });

  it("retries a request that opted out of the check", async () => {
    guard("t1", async () => "t2");
    fetchMock
      .mockResolvedValueOnce(res({ status: 401 }))
      .mockResolvedValueOnce(res({ status: 200 }))
      .mockResolvedValueOnce(
        res({ contentType: "application/json", json: { ok: 5 } }),
      );

    await expect(
      makeClient().post("/status", null, undefined, { skipSessionCheck: true }),
    ).resolves.toEqual({ ok: 5 });
  });

  it("does not send a stream again in another tenant", async () => {
    guard("t1", async () => "t2");
    fetchMock
      .mockResolvedValueOnce(res({ status: 401 }))
      .mockResolvedValueOnce(res({ status: 200 }));

    await expect(makeClient().stream("/chat", {})).rejects.toMatchObject({
      status: 409,
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("checks once for all the requests waiting on the same refresh", async () => {
    const confirmTenant = guard("t1", async () => "t1");
    fetchMock.mockImplementation(async (url: string) =>
      url.includes("/api/oidc/token")
        ? res({ status: 200 })
        : fetchMock.mock.calls.filter(([u]) => u === url).length === 1
          ? res({ status: 401 })
          : res({ contentType: "application/json", json: { url } }),
    );

    const client = makeClient();
    await Promise.all([client.get("/a"), client.get("/b")]);

    expect(confirmTenant).toHaveBeenCalledTimes(1);
  });

  it("does not sign out when the refresh token was replaced but the cookie works", async () => {
    // IAM refuses a refresh token that opening, leaving or switching a project replaced. Another tab
    // may already have put a working token in the shared cookie.
    const replace = setLocation("/dashboard");
    guard("t1", async () => "t1");
    fetchMock
      .mockResolvedValueOnce(res({ status: 401 }))
      .mockResolvedValueOnce(
        res({
          status: 400,
          json: {
            error: "invalid_grant",
            error_description: "session_changed",
          },
        }),
      )
      .mockResolvedValueOnce(
        res({ contentType: "application/json", json: { ok: 6 } }),
      );

    await expect(makeClient().get("/repos")).resolves.toEqual({ ok: 6 });
    expect(replace).not.toHaveBeenCalled();
    expect(h.resetAuthStore).not.toHaveBeenCalled();
  });

  it("signs out when the refresh token was replaced and nothing in the cookie works", async () => {
    const replace = setLocation("/dashboard");
    guard("t1", async () => {
      throw new Error("401");
    });
    fetchMock
      .mockResolvedValueOnce(res({ status: 401 }))
      .mockResolvedValueOnce(
        res({ status: 400, json: { error: "session_changed" } }),
      );

    await expect(makeClient().get("/repos")).rejects.toMatchObject({
      status: 401,
    });
    expect(replace).toHaveBeenCalledWith("/login");
  });

  it("signs out on any other refused refresh, as before", async () => {
    const replace = setLocation("/dashboard");
    const confirmTenant = guard("t1", async () => "t1");
    fetchMock
      .mockResolvedValueOnce(res({ status: 401 }))
      .mockResolvedValueOnce(
        res({ status: 400, json: { error: "invalid_grant" } }),
      );

    await expect(makeClient().get("/repos")).rejects.toMatchObject({
      status: 401,
    });
    expect(replace).toHaveBeenCalledWith("/login");
    expect(confirmTenant).not.toHaveBeenCalled();
  });
});

describe("HttpClient session lock", () => {
  it("refreshes from inside the lock without waiting for it", async () => {
    h.runtimeEnv = {
      BLOCKS_OIDC_CLIENT_ID: "cid",
      BLOCKS_IAM_BASE_URL: "https://iam.test",
    };
    fetchMock.mockResolvedValueOnce(res({ status: 200 }));
    const client = makeClient();

    await expect(
      client.withSessionLock(() => client.refreshWithinSessionLock()),
    ).resolves.toBeUndefined();
    expect(fetchMock.mock.calls[0]?.[0]).toContain("/api/oidc/token");
  });

  it("makes a refresh wait for an impersonation change already holding the lock", async () => {
    h.runtimeEnv = {
      BLOCKS_OIDC_CLIENT_ID: "cid",
      BLOCKS_IAM_BASE_URL: "https://iam.test",
    };
    const order: string[] = [];
    let finishChange: () => void = () => undefined;
    fetchMock.mockImplementation(async (url: string) => {
      if (url.includes("/api/oidc/token")) {
        order.push("refresh");
        return res({ status: 200 });
      }
      if (order.includes("refresh")) {
        return res({ contentType: "application/json", json: {} });
      }
      return res({ status: 401 });
    });
    const client = makeClient();

    const change = client.withSessionLock(
      () =>
        new Promise<void>((resolve) => {
          finishChange = () => {
            order.push("change");
            resolve();
          };
        }),
    );
    const request = client.get("/x");
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(order).toEqual([]);

    finishChange();
    await change;
    await request;

    expect(order).toEqual(["change", "refresh"]);
  });
});

describe("HttpClient stream", () => {
  it("returns the response body on success", async () => {
    const body = {} as ReadableStream<Uint8Array>;
    fetchMock.mockResolvedValueOnce(res({ status: 200, body }));
    const out = await makeClient().stream("/x", { data: 1 });
    expect(out).toBe(body);
    expect(lastConfig().method).toBe("POST");
    expect(lastConfig().body).toBe(JSON.stringify({ data: 1 }));
  });

  it("throws when the stream response has no body", async () => {
    fetchMock.mockResolvedValueOnce(res({ status: 200, body: null }));
    await expect(makeClient().stream("/x", {})).rejects.toMatchObject({
      errors: { general: "Response body is not readable" },
    });
  });

  it("throws HttpError on a non-ok stream response", async () => {
    fetchMock.mockResolvedValueOnce(
      res({
        status: 500,
        contentType: "application/json",
        json: { errors: { x: "y" } },
      }),
    );
    await expect(makeClient().stream("/x", {})).rejects.toMatchObject({
      status: 500,
      errors: { x: "y" },
    });
  });

  it("refreshes then retries the stream on a 401", async () => {
    h.runtimeEnv = {
      BLOCKS_OIDC_CLIENT_ID: "cid",
      BLOCKS_IAM_BASE_URL: "https://iam.test",
    };
    const body = {} as ReadableStream<Uint8Array>;
    fetchMock
      .mockResolvedValueOnce(res({ status: 401 }))
      .mockResolvedValueOnce(res({ status: 200 }))
      .mockResolvedValueOnce(res({ status: 200, body }));
    const out = await makeClient().stream("/x", {});
    expect(out).toBe(body);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("wraps a thrown object as a 500 HttpError", async () => {
    fetchMock.mockRejectedValueOnce({ code: "ENET" });
    await expect(makeClient().stream("/x", {})).rejects.toMatchObject({
      status: 500,
      errors: { code: "ENET" },
    });
  });
});

describe("HttpClient onError", () => {
  it("reports a transport failure as transport, with the original error intact", async () => {
    const onError = vi.fn();
    fetchMock.mockRejectedValueOnce(new TypeError("Failed to fetch"));

    await expect(makeClient({ onError }).get("/thing")).rejects.toBeTruthy();

    expect(onError).toHaveBeenCalledTimes(1);
    const failure = onError.mock.calls[0]![0];
    expect(failure).toMatchObject({
      url: "https://api.test/thing",
      method: "GET",
      transport: true,
    });
    // The whole point of the hook: the pre-normalisation error is still available here, even
    // though the caller only ever sees an HttpError(500).
    expect(failure.error).toBeInstanceOf(TypeError);
    expect(failure.normalized.status).toBe(500);
  });

  it("reports a server response as not transport", async () => {
    const onError = vi.fn();
    fetchMock.mockResolvedValueOnce(
      res({ status: 404, contentType: "application/json", json: {} }),
    );

    await expect(makeClient({ onError }).get("/thing")).rejects.toBeTruthy();

    expect(onError.mock.calls[0]![0]).toMatchObject({
      transport: false,
      method: "GET",
    });
  });

  it("reports stream failures too", async () => {
    const onError = vi.fn();
    fetchMock.mockRejectedValueOnce(new TypeError("Failed to fetch"));

    await expect(
      makeClient({ onError }).stream("/stream", {}),
    ).rejects.toBeTruthy();

    expect(onError.mock.calls[0]![0]).toMatchObject({
      method: "POST",
      transport: true,
    });
  });

  it("never lets a throwing reporter change what the caller sees", async () => {
    const onError = vi.fn(() => {
      throw new Error("reporter is broken");
    });
    fetchMock.mockRejectedValueOnce(new TypeError("Failed to fetch"));

    await expect(makeClient({ onError }).get("/thing")).rejects.toMatchObject({
      status: 500,
    });
  });

  it("is optional", async () => {
    fetchMock.mockRejectedValueOnce(new TypeError("Failed to fetch"));

    await expect(makeClient().get("/thing")).rejects.toMatchObject({
      status: 500,
      errors: { general: "Failed to fetch" },
    });
  });
});

describe("HttpClient success responses without data", () => {
  const envelope = (status: number) => ({ success: true, status });

  const getWith = async (response: MockResponse, onError = vi.fn()) => {
    fetchMock.mockResolvedValueOnce(response);
    const out = await makeClient({ onError }).get("/x");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(onError).not.toHaveBeenCalled();
    return out;
  };

  it.each(["application/json", "application/json; charset=utf-8"])(
    "resolves a 204 with %s to the envelope without reading the body (E1)",
    async (contentType) => {
      const response = res({ status: 204, contentType });
      expect(await getWith(response)).toEqual(envelope(204));
      expectNoBodyRead(response);
    },
  );

  it("resolves a 205 without a content type to the envelope (E2)", async () => {
    const response = res({ status: 205 });
    expect(await getWith(response)).toEqual(envelope(205));
    expectNoBodyRead(response);
  });

  it("resolves a 205 with a JSON content type without reading the body", async () => {
    const response = res({ status: 205, contentType: "application/json" });
    expect(await getWith(response)).toEqual(envelope(205));
    expectNoBodyRead(response);
  });

  it.each([
    [204, "text/html"],
    [205, "text/html; charset=utf-8"],
    [204, "text/plain"],
    [204, "image/png"],
    [205, "application/octet-stream"],
    [204, "application/pdf"],
  ])(
    "resolves a %i with %s to the envelope before looking at the content type (E10)",
    async (status, contentType) => {
      const response = res({
        status,
        contentType,
        text: "ignored",
        blob: new Blob(["ignored"]),
      });
      expect(await getWith(response)).toEqual(envelope(status));
      expectNoBodyRead(response);
    },
  );

  it("still resolves a 200 without a content type to the envelope", async () => {
    const response = res({ status: 200 });
    expect(await getWith(response)).toEqual(envelope(200));
    expectNoBodyRead(response);
  });

  it("resolves a JSON response with content-length 0 without reading the body (E3)", async () => {
    const response = res({
      contentType: "application/json",
      contentLength: "0",
    });
    expect(await getWith(response)).toEqual(envelope(200));
    expectNoBodyRead(response);
  });

  it("reads a JSON body whose content-length is not 0", async () => {
    const response = res({
      contentType: "application/json",
      contentLength: "8",
      json: { ok: 1 },
    });
    expect(await getWith(response)).toEqual({ ok: 1 });
    expectOneTextRead(response);
  });

  it("resolves an empty JSON body without content-length after one text() read", async () => {
    const response = res({ contentType: "application/json", text: "" });
    expect(await getWith(response)).toEqual(envelope(200));
    expectOneTextRead(response);
  });

  it("resolves a whitespace-only JSON body to the envelope (E4)", async () => {
    const response = res({ contentType: "application/json", text: "  \n" });
    expect(await getWith(response)).toEqual(envelope(200));
    expectOneTextRead(response);
  });

  it("treats any other content type as JSON, so an empty body is no data", async () => {
    const response = res({ contentType: "application/problem+json", text: "" });
    expect(await getWith(response)).toEqual(envelope(200));
    expectOneTextRead(response);
  });

  it("parses a JSON body from text() and never calls json() (E5)", async () => {
    const response = res({
      status: 201,
      contentType: "application/json",
      text: '{"id":"a1"}',
    });
    fetchMock.mockResolvedValueOnce(response);
    const onError = vi.fn();
    expect(await makeClient({ onError }).post("/x", {})).toEqual({ id: "a1" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(onError).not.toHaveBeenCalled();
    expectOneTextRead(response);
  });

  it.each([
    ["null", null],
    ["[]", []],
    [" [1,2] ", [1, 2]],
  ])("resolves the JSON body %s to its parsed value", async (text, value) => {
    const response = res({ contentType: "application/json", text });
    expect(await getWith(response)).toEqual(value);
    expectOneTextRead(response);
  });

  it("keeps an empty text/plain body as an empty string (E11)", async () => {
    const response = res({ contentType: "text/plain", text: "" });
    expect(await getWith(response)).toBe("");
    expect(response.text).toHaveBeenCalledTimes(1);
  });

  it("keeps returning a blob for a binary 200", async () => {
    const blob = new Blob(["z"]);
    const response = res({ contentType: "image/png", blob });
    expect(await getWith(response)).toBe(blob);
    expect(response.blob).toHaveBeenCalledTimes(1);
    expect(response.text).not.toHaveBeenCalled();
  });

  it.each(["post", "put", "patch", "delete"] as const)(
    "resolves a 204 JSON answer to %s to the same envelope as get",
    async (verb) => {
      const response = res({ status: 204, contentType: "application/json" });
      fetchMock.mockResolvedValueOnce(response);
      const onError = vi.fn();
      const client = makeClient({ onError });
      const out =
        verb === "delete"
          ? await client.delete("/x")
          : await client[verb]("/x", {});
      expect(out).toEqual(envelope(204));
      expect(lastConfig().method).toBe(verb.toUpperCase());
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(onError).not.toHaveBeenCalled();
      expectNoBodyRead(response);
    },
  );

  it("gives a value that DTO-field narrowing reads as none", async () => {
    const result = await getWith(
      res({ status: 204, contentType: "application/json" }),
    );
    // The blocks-studio pattern for "no record".
    const narrowed =
      result && typeof result === "object" && "id" in result ? result : null;
    expect(narrowed).toBeNull();
  });
});

describe("HttpClient success responses that fail to decode", () => {
  // An onError that records every call and also runs the real Rollbar reporter.
  const spyingReporter = () => {
    const rollbar = { error: vi.fn() };
    const reporter = createHttpFailureReporter(rollbar as unknown as Rollbar);
    const onError = vi.fn((failure: HttpRequestFailure) => reporter(failure));
    return { onError, rollbar };
  };

  it("rejects invalid JSON with an HttpError and reports it once as transport (E6)", async () => {
    const onError = vi.fn();
    const response = res({ contentType: "application/json", text: "not json" });
    fetchMock.mockResolvedValueOnce(response);

    const rejection = await makeClient({ onError })
      .get("/thing")
      .catch((e: unknown) => e);

    expect(rejection).toBeInstanceOf(HttpError);
    expect(rejection).not.toBeInstanceOf(SyntaxError);
    expect(rejection).toMatchObject({ status: 500 });
    expect(onError).toHaveBeenCalledTimes(1);
    const failure = onError.mock.calls[0]![0];
    expect(failure).toMatchObject({
      url: "https://api.test/thing",
      method: "GET",
      transport: true,
    });
    expect(failure.error).toBeInstanceOf(SyntaxError);
    expect(failure.normalized).toBe(rejection);
    // A SyntaxError is an Error, so its text is kept instead of the empty `{}` (#72).
    const parseText = (failure.error as SyntaxError).message;
    expect(parseText).not.toBe("");
    expect((rejection as HttpError).errors).toEqual({
      general: parseText,
      message: parseText,
    });
    expectOneTextRead(response);
  });

  it("reports invalid JSON to Rollbar once through createHttpFailureReporter", async () => {
    const rollbar = { error: vi.fn() };
    const onError = createHttpFailureReporter(rollbar as unknown as Rollbar);
    fetchMock.mockResolvedValueOnce(
      res({ contentType: "application/json", text: "not json" }),
    );

    await expect(makeClient({ onError }).get("/thing")).rejects.toBeInstanceOf(
      HttpError,
    );

    expect(rollbar.error).toHaveBeenCalledTimes(1);
    const [error, context] = rollbar.error.mock.calls[0]!;
    expect(error).toBeInstanceOf(SyntaxError);
    expect(context).toEqual({
      source: "http-client",
      url: "https://api.test/thing",
      method: "GET",
    });
  });

  it("rejects an HTML success with the same HttpError and reports it as not transport (E7)", async () => {
    const { onError, rollbar } = spyingReporter();
    const response = res({ contentType: "text/html", text: "<html></html>" });
    fetchMock.mockResolvedValueOnce(response);

    const rejection = await makeClient({ onError })
      .get("/x")
      .catch((e: unknown) => e);

    expect(rejection).toBeInstanceOf(HttpError);
    expect(rejection).toMatchObject({
      status: 200,
      errors: { general: "Unexpected HTML response from server" },
    });
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0]![0]).toMatchObject({
      transport: false,
      normalized: rejection,
    });
    expect(rollbar.error).not.toHaveBeenCalled();
    expectNoBodyRead(response);
  });

  it("rejects an aborted body read with an HttpError(500) that the reporter skips", async () => {
    const { onError, rollbar } = spyingReporter();
    const abort = new DOMException("The operation was aborted.", "AbortError");
    fetchMock.mockResolvedValueOnce(
      res({ contentType: "application/json", textRejects: abort }),
    );

    const rejection = await makeClient({ onError })
      .get("/x")
      .catch((e: unknown) => e);

    expect(rejection).toBeInstanceOf(HttpError);
    expect(rejection).toMatchObject({ status: 500 });
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0]![0]).toMatchObject({
      transport: true,
      error: abort,
      normalized: rejection,
    });
    expect(rollbar.error).not.toHaveBeenCalled();
  });

  it("reports a body read failure that is not a network failure", async () => {
    const rollbar = { error: vi.fn() };
    const onError = createHttpFailureReporter(rollbar as unknown as Rollbar);
    const broken = new Error("body stream already read");
    fetchMock.mockResolvedValueOnce(
      res({ contentType: "application/json", textRejects: broken }),
    );

    await expect(makeClient({ onError }).get("/x")).rejects.toMatchObject({
      status: 500,
    });

    expect(rollbar.error).toHaveBeenCalledTimes(1);
    expect(rollbar.error.mock.calls[0]![0]).toBe(broken);
  });

  it("still rejects with the same HttpError when onError throws on a decode failure", async () => {
    const onError = vi.fn(() => {
      throw new Error("reporter is broken");
    });
    fetchMock.mockResolvedValueOnce(
      res({ contentType: "application/json", text: "not json" }),
    );

    const rejection = await makeClient({ onError })
      .get("/x")
      .catch((e: unknown) => e);

    expect(rejection).toBeInstanceOf(HttpError);
    expect(rejection).toMatchObject({ status: 500 });
    expect(onError).toHaveBeenCalledTimes(1);
  });

  it.each([404, 500])(
    "keeps rejecting a %i with an empty JSON body instead of resolving the envelope",
    async (status) => {
      const onError = vi.fn();
      const response = res({
        status,
        contentType: "application/json",
        jsonThrows: true,
      });
      fetchMock.mockResolvedValueOnce(response);

      const rejection = await makeClient({ onError })
        .get("/x")
        .catch((e: unknown) => e);

      expect(rejection).toBeInstanceOf(HttpError);
      expect(rejection).toMatchObject({ status, errors: {} });
      expect(rejection).not.toMatchObject({ success: true });
      expect(onError).toHaveBeenCalledTimes(1);
      expect(onError.mock.calls[0]![0]).toMatchObject({ transport: false });
      expect(response.text).not.toHaveBeenCalled();
    },
  );
});

describe("HttpClient decoding after a token refresh", () => {
  beforeEach(() => {
    h.runtimeEnv = {
      BLOCKS_OIDC_CLIENT_ID: "cid",
      BLOCKS_IAM_BASE_URL: "https://iam.test",
    };
  });

  const refreshThen = (retry: MockResponse) =>
    fetchMock
      .mockResolvedValueOnce(res({ status: 401 }))
      .mockResolvedValueOnce(res({ status: 200 }))
      .mockResolvedValueOnce(retry);

  it("resolves a retried 204 JSON answer to the envelope without onError (E8)", async () => {
    const onError = vi.fn();
    const retry = res({ status: 204, contentType: "application/json" });
    refreshThen(retry);

    const out = await makeClient({
      onError,
      onTokenRefresh: vi.fn().mockResolvedValue({}),
    }).get("/x");

    expect(out).toEqual({ success: true, status: 204 });
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(onError).not.toHaveBeenCalled();
    expectNoBodyRead(retry);
  });

  it("calls onError once when the retried answer is invalid JSON (E9)", async () => {
    const onError = vi.fn();
    refreshThen(res({ contentType: "application/json", text: "not json" }));

    const rejection = await makeClient({
      onError,
      onTokenRefresh: vi.fn().mockResolvedValue({}),
    })
      .get("/x")
      .catch((e: unknown) => e);

    expect(rejection).toBeInstanceOf(HttpError);
    expect(rejection).toMatchObject({ status: 500 });
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0]![0]).toMatchObject({
      transport: true,
      normalized: rejection,
    });
    expect(onError.mock.calls[0]![0].error).toBeInstanceOf(SyntaxError);
  });

  it("calls onError once when the retried answer is not ok", async () => {
    const onError = vi.fn();
    refreshThen(
      res({
        status: 500,
        contentType: "application/json",
        json: { errors: { general: "boom" } },
      }),
    );

    await expect(
      makeClient({
        onError,
        onTokenRefresh: vi.fn().mockResolvedValue({}),
      }).get("/x"),
    ).rejects.toMatchObject({ status: 500, errors: { general: "boom" } });

    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0]![0]).toMatchObject({ transport: false });
  });
});

describe("HttpClient keeps the text of a thrown Error (#72)", () => {
  const rejectionOf = async (thrown: unknown, call = "get") => {
    fetchMock.mockRejectedValueOnce(thrown);
    const client = makeClient();
    const pending =
      call === "stream" ? client.stream("/x", {}) : client.get("/x");
    return (await pending.catch((e: unknown) => e)) as HttpError;
  };

  it("turns TypeError: Failed to fetch into general and message with status 500 (H1, H2, H3, C7, C8)", async () => {
    const rejection = await rejectionOf(new TypeError("Failed to fetch"));

    expect(rejection).toBeInstanceOf(HttpError);
    expect(rejection.status).toBe(500);
    expect(rejection.errors).toEqual({
      general: "Failed to fetch",
      message: "Failed to fetch",
    });
    expect(rejection.message).toContain("Failed to fetch");
    expect(JSON.stringify(rejection.errors)).not.toBe("{}");
  });

  it("keeps the exact Firefox network error text (H4)", async () => {
    const text = "NetworkError when attempting to fetch resource.";
    const rejection = await rejectionOf(new TypeError(text));

    expect(rejection.errors.general).toBe(text);
    expect(rejection.errors.message).toBe(text);
  });

  it("treats a DOMException as an Error (H5)", async () => {
    const rejection = await rejectionOf(
      new DOMException("The user aborted a request.", "AbortError"),
    );

    expect(rejection).toMatchObject({
      status: 500,
      errors: {
        general: "The user aborted a request.",
        message: "The user aborted a request.",
      },
    });
  });

  it("normalises stream() transport failures the same way (H11)", async () => {
    const rejection = await rejectionOf(
      new TypeError("Failed to fetch"),
      "stream",
    );

    expect(rejection).toMatchObject({
      status: 500,
      errors: { general: "Failed to fetch", message: "Failed to fetch" },
    });
  });

  it.each([
    ["an empty", ""],
    ["a whitespace-only", "   "],
  ])(
    "falls back to Network request failed for %s message (C1)",
    async (_label, text) => {
      const rejection = await rejectionOf(new Error(text));

      expect(rejection.errors).toEqual({
        general: "Network request failed",
        message: "Network request failed",
      });
      expect(rejection.message).toBe(
        '{"general":"Network request failed","message":"Network request failed"}',
      );
    },
  );

  it("falls back without throwing when message is not a string (C2)", async () => {
    const tampered = Object.assign(new Error("x"), { message: 42 });

    const rejection = await rejectionOf(tampered);

    expect(rejection).toMatchObject({
      status: 500,
      errors: { general: "Network request failed" },
    });
  });

  it("falls back without throwing when reading message throws (C2)", async () => {
    const tampered = new Error("x");
    Object.defineProperty(tampered, "message", {
      get() {
        throw new Error("no message for you");
      },
    });

    const rejection = await rejectionOf(tampered);

    expect(rejection.errors.general).toBe("Network request failed");
  });

  it("caps both keys at 500 characters (C3)", async () => {
    const rejection = await rejectionOf(new Error("a".repeat(600)));

    expect(rejection.errors.general).toBe("a".repeat(500));
    expect(rejection.errors.message).toBe("a".repeat(500));
  });

  it("copies no other property of the original error into errors (C4)", async () => {
    const thrown = Object.assign(new TypeError("Failed to fetch"), {
      code: "ENET",
      token: "secret-value",
    });

    const rejection = await rejectionOf(thrown);

    expect(Object.keys(rejection.errors).sort()).toEqual([
      "general",
      "message",
    ]);
    expect(rejection.message).not.toContain("secret-value");
    expect(rejection.message).not.toContain("stack");
  });

  it("hands the new normalized error and the original error to onError (H9, H10)", async () => {
    const onError = vi.fn();
    const thrown = new TypeError("Failed to fetch");
    fetchMock.mockRejectedValueOnce(thrown);

    const rejection = await makeClient({ onError })
      .get("/x")
      .catch((e: unknown) => e);

    expect(onError).toHaveBeenCalledTimes(1);
    const failure = onError.mock.calls[0]![0] as HttpRequestFailure;
    expect(failure.error).toBe(thrown);
    expect(failure.transport).toBe(true);
    expect(failure.normalized).toBe(rejection);
    expect(failure.normalized.errors.general).toBe("Failed to fetch");
  });

  it("still rejects with the normalized error when onError throws (C5)", async () => {
    const onError = vi.fn(() => {
      throw new Error("reporter is broken");
    });
    fetchMock.mockRejectedValueOnce(new TypeError("Failed to fetch"));

    await expect(makeClient({ onError }).get("/x")).rejects.toMatchObject({
      status: 500,
      errors: { general: "Failed to fetch", message: "Failed to fetch" },
    });
  });

  it("normalises a retried request's transport failure once, without double wrapping (C6)", async () => {
    h.runtimeEnv = {
      BLOCKS_OIDC_CLIENT_ID: "cid",
      BLOCKS_IAM_BASE_URL: "https://iam.test",
    };
    const onError = vi.fn();
    fetchMock
      .mockResolvedValueOnce(res({ status: 401 }))
      .mockResolvedValueOnce(res({ status: 200 }))
      .mockRejectedValueOnce(new TypeError("Failed to fetch"));

    const rejection = await makeClient({
      onError,
      onTokenRefresh: vi.fn().mockResolvedValue({}),
    })
      .get("/x")
      .catch((e: unknown) => e);

    expect(rejection).toBeInstanceOf(HttpError);
    expect(rejection).toMatchObject({
      status: 500,
      errors: { general: "Failed to fetch", message: "Failed to fetch" },
    });
    expect(fetchMock).toHaveBeenCalledTimes(3);
    // The retry runs its own failRequest and its rejection is returned as is, so the failure is
    // normalised and reported exactly once.
    expect(onError).toHaveBeenCalledTimes(1);
    const failure = onError.mock.calls[0]![0] as HttpRequestFailure;
    expect(failure.transport).toBe(true);
    expect(failure.error).toBeInstanceOf(TypeError);
    expect(failure.normalized).toBe(rejection);
  });
});

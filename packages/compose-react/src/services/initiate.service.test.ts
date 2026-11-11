import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const h = vi.hoisted(() => ({ env: {} as Record<string, string> }));
vi.mock("@/lib", () => ({ getRuntimeEnv: (key: string) => h.env[key] ?? "" }));

import { HttpError } from "@/lib/http/error";
import { InitiateError, initiateService } from "@/services/initiate.service";

const params = { clientId: "c", redirectUri: "r", forwardedTo: "f" };

/** A non-2xx response whose body is `body`, read the way `fetch` would. */
const rejection = (status: number, body: string) => ({
  ok: false,
  status,
  json: async () => JSON.parse(body) as unknown,
});

const failure = async (response: unknown) => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response));
  return initiateService.fetchRedirectUrl(params).catch((e: unknown) => e);
};

beforeEach(() => {
  h.env = { BLOCKS_X_BLOCKS_KEY: "key", userBaseUrl: "https://iam.test" };
});
afterEach(() => vi.unstubAllGlobals());

describe("InitiateService.fetchRedirectUrl", () => {
  // H1, §7 #5
  it("returns the redirect_uri on a successful response", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ redirect_uri: "https://go.test" }),
    });
    vi.stubGlobal("fetch", fetchMock);
    await expect(initiateService.fetchRedirectUrl(params)).resolves.toBe(
      "https://go.test",
    );
    expect(fetchMock.mock.calls[0]?.[0]).toContain("https://iam.test");
  });

  it("throws on a non-ok response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 500 }),
    );
    await expect(initiateService.fetchRedirectUrl(params)).rejects.toThrow(
      /HTTP 500/,
    );
  });

  // H2-H5, §7 #1: an HttpError, so the query reporter leaves it to IAM.
  it("rejects a 400 with an InitiateError carrying IAM's error and description", async () => {
    const error = await failure(
      rejection(
        400,
        '{"error":"invalid_redirect_uri","error_description":"redirectUri is not registered for this client"}',
      ),
    );

    expect(error).toBeInstanceOf(InitiateError);
    expect(error).toBeInstanceOf(HttpError);
    expect(error).toMatchObject({
      name: "InitiateError",
      status: 400,
      code: "invalid_redirect_uri",
      description: "redirectUri is not registered for this client",
      message: "Initiate request failed — HTTP 400 (invalid_redirect_uri)",
      errors: {
        general: "Initiate request failed — HTTP 400",
        code: "invalid_redirect_uri",
      },
    });
  });

  // §7 #2
  it("keeps the code of an invalid_client rejection", async () => {
    const error = await failure(
      rejection(
        400,
        '{"error":"invalid_client","error_description":"ClientId not found or inactive"}',
      ),
    );

    expect(error).toMatchObject({ status: 400, code: "invalid_client" });
  });

  // §7 #3, C1
  it("rejects a non-JSON body with the status alone, not a parse error", async () => {
    const error = await failure(
      rejection(400, "<html><body>Bad Request</body></html>"),
    );

    expect(error).toBeInstanceOf(InitiateError);
    expect(error).toMatchObject({
      status: 400,
      code: null,
      description: null,
      message: "Initiate request failed — HTTP 400",
      errors: { general: "Initiate request failed — HTTP 400" },
    });
    expect((error as InitiateError).errors).not.toHaveProperty("code");
  });

  // C2: an empty body, and a response with no body reader at all.
  it.each([
    ["an empty body", rejection(403, "")],
    ["no body", { ok: false, status: 403 }],
  ])("rejects %s with the status and no code", async (_, response) => {
    const error = await failure(response);

    expect(error).toBeInstanceOf(InitiateError);
    expect(error).toMatchObject({ status: 403, code: null, description: null });
  });

  it("ignores error fields that are not text", async () => {
    const error = await failure(
      rejection(400, '{"error":42,"error_description":{"a":1}}'),
    );

    expect(error).toMatchObject({ code: null, description: null });
  });

  // C3
  it("cuts an error_description longer than 300 characters to 300", async () => {
    const long = "x".repeat(301);
    const error = await failure(
      rejection(400, JSON.stringify({ error_description: long })),
    );

    expect((error as InitiateError).description).toBe("x".repeat(300));
  });

  // C5
  it("rejects a 5xx with an InitiateError carrying that status", async () => {
    const error = await failure(
      rejection(
        500,
        '{"error":"server_error","error_description":"Failed to start authentication flow"}',
      ),
    );

    expect(error).toBeInstanceOf(InitiateError);
    expect(error).toMatchObject({
      status: 500,
      code: "server_error",
      message: "Initiate request failed — HTTP 500 (server_error)",
    });
  });

  // C4, §7 #4, A3: no URL in a 2xx is a bad upstream answer, handled like an HTTP failure.
  it.each([
    ["an empty object", {}],
    ["null", null],
    ["a redirect_uri that is not text", { redirect_uri: { href: "x" } }],
  ])("rejects a 2xx with %s as a 502 InitiateError", async (_, body) => {
    const error = await failure({ ok: true, json: async () => body });

    expect(error).toBeInstanceOf(InitiateError);
    expect(error).toMatchObject({
      status: 502,
      code: null,
      description: null,
      message: "No redirect_uri in initiate response",
    });
  });

  // C10: the error keeps nothing from the request.
  it("copies no blocks key, query string or header value into the error", async () => {
    h.env = {
      BLOCKS_X_BLOCKS_KEY: "blocks-key-value-7f3a",
      userBaseUrl: "https://iam.test",
    };
    const error = (await failure(
      rejection(
        400,
        '{"error":"invalid_client","error_description":"ClientId not found or inactive"}',
      ),
    )) as InitiateError;

    const exposed = JSON.stringify([
      error.message,
      error.errors,
      error.description,
    ]);
    expect(exposed).not.toContain("blocks-key-value-7f3a");
    expect(exposed).not.toContain("x-blocks-key");
    expect(exposed).not.toContain("redirectUri=");
    expect(exposed).not.toContain("clientId=");
    expect(exposed).not.toContain("application/json");
  });

  // C6/C7: an abort while the error body is read stays an abort.
  it("rethrows an abort that interrupts reading the error body", async () => {
    const controller = new AbortController();
    const abort = new DOMException("The operation was aborted.", "AbortError");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => {
          controller.abort();
          throw abort;
        },
      }),
    );

    await expect(
      initiateService.fetchRedirectUrl(params, controller.signal),
    ).rejects.toBe(abort);
  });

  // C6, §7 #6
  it("lets a network failure propagate as the browser's own error", async () => {
    const networkError = new TypeError("Failed to fetch");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(networkError));

    await expect(initiateService.fetchRedirectUrl(params)).rejects.toBe(
      networkError,
    );
  });

  it("omits the blocks-key header when the key is absent", async () => {
    h.env = { userBaseUrl: "https://iam.test" };
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ redirect_uri: "https://go.test" }),
    });
    vi.stubGlobal("fetch", fetchMock);
    await initiateService.fetchRedirectUrl(params);
    const headers = fetchMock.mock.calls[0]?.[1].headers;
    expect(headers["X-Blocks-Key"]).toBeUndefined();
  });
});

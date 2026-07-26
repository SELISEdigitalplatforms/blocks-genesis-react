import { describe, it, expect, afterEach } from "vitest";
import {
  isValidDomain,
  isValidSubdomain,
  getDomain,
  getSubdomain,
  getProjectBlocksApiUrl,
} from "@/utils/domain";

type ProcessLike = { process?: { env: Record<string, string | undefined> } };

describe("isValidDomain", () => {
  it("accepts a protocol-prefixed domain", () => {
    expect(isValidDomain("https://example.com")).toBe(true);
  });

  it("rejects a bare hostname", () => {
    expect(isValidDomain("example.com")).toBe(false);
  });
});

describe("isValidSubdomain", () => {
  it("accepts a protocol-prefixed host", () => {
    expect(isValidSubdomain("https://foo.example.com")).toBe(true);
  });

  it("rejects an empty value", () => {
    expect(isValidSubdomain("")).toBe(false);
  });
});

describe("getDomain", () => {
  it("returns the registrable domain", () => {
    expect(getDomain("https://foo.example.com")).toBe("example.com");
  });

  it("returns empty for an invalid domain", () => {
    expect(getDomain("nope")).toBe("");
  });
});

describe("getSubdomain", () => {
  it("returns the subdomain with its protocol", () => {
    expect(getSubdomain("https://foo.example.com")).toBe("https://foo");
  });

  it("returns empty when there is no subdomain", () => {
    expect(getSubdomain("https://example.com")).toBe("");
  });

  it("returns empty for an invalid url", () => {
    expect(getSubdomain("nope")).toBe("");
  });

  it("returns empty for an empty string", () => {
    expect(getSubdomain("")).toBe("");
  });
});

describe("getProjectBlocksApiUrl", () => {
  const win = window as unknown as ProcessLike;
  const originalProcess = win.process;
  afterEach(() => {
    win.process = originalProcess;
  });

  it("returns empty when no project is given", () => {
    expect(getProjectBlocksApiUrl()).toBe("");
  });

  it("returns empty when the base URL env is absent", () => {
    win.process = { env: {} };
    expect(getProjectBlocksApiUrl({ customDomain: "" } as never)).toBe("");
  });

  it("returns the configured base URL without a custom domain", () => {
    win.process = { env: { BLOCKS_PUBLIC_API_BASE_URL: "api.base" } };
    expect(getProjectBlocksApiUrl({ customDomain: "" } as never)).toBe(
      "api.base",
    );
  });

  it("derives the API host from a custom domain", () => {
    win.process = { env: { BLOCKS_PUBLIC_API_BASE_URL: "api.base" } };
    expect(
      getProjectBlocksApiUrl({
        customDomain: "https://foo.example.com",
      } as never),
    ).toBe("blocksapi.example.com");
  });
});

import { describe, it, expect } from "vitest";
import { parseSwaggerDocument } from "@/pages/dashboard/dashboard-overview-sections/use-swagger-endpoints";
import {
  buildCurlCommand,
  groupEndpointsByTag,
} from "@/pages/dashboard/dashboard-overview-sections/core-api/util";

describe("parseSwaggerDocument", () => {
  it("resolves the base URL from OpenAPI servers and keeps the summary", () => {
    const result = parseSwaggerDocument(
      {
        servers: [{ url: "https://api.test/" }],
        paths: { "/users": { get: { summary: "List users", tags: ["Iam"] } } },
      } as never,
      "https://ignored.test/swagger.json",
    );
    expect(result).toEqual([
      {
        itemId: "GET:/users",
        method: "GET",
        summary: "List users",
        path: "https://api.test/users",
        tag: "Iam",
      },
    ]);
  });

  it("resolves a Swagger 2.0 host/scheme/basePath and falls back to operationId", () => {
    const [endpoint] = parseSwaggerDocument(
      {
        host: "api.test",
        schemes: ["https"],
        basePath: "/v1",
        paths: { "/x": { post: { operationId: "CreateX" } } },
      } as never,
      "https://ignored.test/swagger.json",
    );
    expect(endpoint?.path).toBe("https://api.test/v1/x");
    expect(endpoint?.summary).toBe("CreateX");
    expect(endpoint?.method).toBe("POST");
  });

  it("uses an explicit runtime base URL when provided", () => {
    const [endpoint] = parseSwaggerDocument(
      { paths: { "/y": { get: {} } } } as never,
      "https://ignored.test/swagger.json",
      "BLOCKS_OS_BASE_URL" as never,
    );
    expect(endpoint?.path).toBe("https://test.local/y");
    expect(endpoint?.summary).toBe("y");
  });

  it("falls back to the swagger URL origin and humanizes camel-case paths", () => {
    const [endpoint] = parseSwaggerDocument(
      { paths: { "/GetUsers/{id}": { get: {} } } } as never,
      "https://origin.test/swagger.json",
    );
    expect(endpoint?.path).toBe("https://origin.test/GetUsers/{id}");
    expect(endpoint?.summary).toBe("Get Users");
  });

  it("returns an empty list when there are no paths", () => {
    expect(parseSwaggerDocument({} as never, "not a url")).toEqual([]);
  });
});

describe("buildCurlCommand", () => {
  it("builds a bodyless curl for GET", () => {
    const curl = buildCurlCommand(
      { method: "GET", path: "https://api.test/x" } as never,
      "key-123",
    );
    expect(curl).toContain("curl -X GET 'https://api.test/x'");
    expect(curl).toContain("X-Blocks-Key: key-123");
    expect(curl).not.toContain("-d '{}'");
  });

  it("adds a JSON body for POST and defaults the key from runtime env", () => {
    const curl = buildCurlCommand({
      method: "POST",
      path: "https://api.test/x",
    } as never);
    expect(curl).toContain("Content-Type: application/json");
    expect(curl).toContain("-d '{}'");
    expect(curl).toContain("X-Blocks-Key: https://test.local");
  });

  it("defaults the method to GET when absent", () => {
    const curl = buildCurlCommand({ path: "https://api.test/x" } as never);
    expect(curl).toContain("curl -X GET");
  });
});

describe("groupEndpointsByTag", () => {
  it("groups endpoints by tag preserving first-appearance order", () => {
    const groups = groupEndpointsByTag([
      { tag: "Iam" },
      { tag: "Mfa" },
      { tag: "Iam" },
      {},
    ] as never);
    expect(groups.map((g) => g.tag)).toEqual(["Iam", "Mfa", "Other"]);
    expect(groups[0]?.endpoints).toHaveLength(2);
  });
});

import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";

import { getQueryClient } from "./query-client";

describe("getQueryClient", () => {
  it("returns a QueryClient with the kit defaults", () => {
    const client = getQueryClient();
    expect(client).toBeInstanceOf(QueryClient);
    expect(client.getDefaultOptions().queries?.staleTime).toBe(60 * 1000);
    expect(client.getDefaultOptions().queries?.retry).toBe(1);
  });

  it("returns the same singleton on every call", () => {
    expect(getQueryClient()).toBe(getQueryClient());
  });
});

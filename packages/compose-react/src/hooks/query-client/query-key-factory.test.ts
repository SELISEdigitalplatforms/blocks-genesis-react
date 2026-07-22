import { describe, it, expect } from "vitest";
import { createQueryKeyFactory } from "@/hooks/query-client/query-key-factory";

describe("createQueryKeyFactory", () => {
  it("namespaces every key and exposes builder helpers", () => {
    const userKeys = createQueryKeyFactory("user", (key) => ({
      current: () => key("current"),
      detail: (id: string) => key("detail", id),
    }));
    expect(userKeys.all()).toEqual(["user"]);
    expect(userKeys.current()).toEqual(["user", "current"]);
    expect(userKeys.detail("42")).toEqual(["user", "detail", "42"]);
    expect(userKeys.key("raw")).toEqual(["user", "raw"]);
  });
});

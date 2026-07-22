import { afterEach, describe, expect, it, vi } from "vitest";
import {
  formatKBMetaDescription,
  formatKBTitle,
  getKBMetaInfo,
} from "./utils";

describe("notification utils", () => {
  afterEach(() => vi.restoreAllMocks());

  describe("formatKBTitle", () => {
    it("returns a placeholder for an empty title", () => {
      expect(formatKBTitle("")).toBe("No Title");
    });

    it("maps the known agent status key to a friendly title", () => {
      expect(formatKBTitle("agent_kb_processing_status")).toBe(
        "AI Agent Knowledge Update Status",
      );
    });

    it("title-cases snake_case titles", () => {
      expect(formatKBTitle("hello_world")).toBe("Hello World");
    });
  });

  describe("getKBMetaInfo", () => {
    it("parses a JSON string into an object", () => {
      expect(getKBMetaInfo('{"kb_id":"x","status":"done"}')).toEqual({
        kb_id: "x",
        status: "done",
      });
    });

    it("returns an object meta unchanged", () => {
      const meta = { kb_id: "y", status: "queued" };
      expect(getKBMetaInfo(meta)).toBe(meta);
    });

    it("returns an empty object and logs on invalid JSON", () => {
      const spy = vi.spyOn(console, "error").mockImplementation(() => {});
      expect(getKBMetaInfo("not-json")).toEqual({});
      expect(spy).toHaveBeenCalled();
    });
  });

  describe("formatKBMetaDescription", () => {
    it("combines status and kb id when both are present", () => {
      expect(
        formatKBMetaDescription('{"kb_id":"abc-def","status":"done"}'),
      ).toBe("Status: Done | KB Id: abc");
    });

    it("returns just the status when only status is present", () => {
      expect(formatKBMetaDescription('{"status":"done"}')).toBe("Status: Done");
    });

    it("returns just the kb id when only kb id is present", () => {
      expect(formatKBMetaDescription('{"kb_id":"abc-def"}')).toBe("KB Id: abc");
    });

    it("falls back to the provided description when meta is empty", () => {
      expect(formatKBMetaDescription("", "A description")).toBe(
        "A description",
      );
    });

    it("falls back to a placeholder when nothing is available", () => {
      expect(formatKBMetaDescription("")).toBe("No Description");
    });
  });
});

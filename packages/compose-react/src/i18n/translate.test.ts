import { describe, expect, it } from "vitest";
import { interpolate, MISSING_VALUE, translate } from "./translate";

const en = {
  SIGN_IN: "Sign in",
  HELLO: "Hello {{name}}",
  ITEMS_one: "{{count}} item",
  ITEMS_other: "{{count}} items",
};
const de = {
  SIGN_IN: "Anmelden",
  HELLO: MISSING_VALUE,
  ITEMS_other: "{{count}} Einträge",
};

describe("translate", () => {
  it("uses the chosen language first", () => {
    const sources = [
      { language: "de", dictionary: de },
      { language: "en", dictionary: en },
    ];
    expect(translate(sources, "SIGN_IN")).toBe("Anmelden");
  });

  it("falls back to English when the value is missing or marked missing", () => {
    const sources = [
      { language: "de", dictionary: de },
      { language: "en", dictionary: en },
    ];
    expect(translate(sources, "HELLO", { name: "Ada" })).toBe("Hello Ada");
  });

  it("falls back to English when the language is not loaded", () => {
    const sources = [{ language: "de" }, { language: "en", dictionary: en }];
    expect(translate(sources, "SIGN_IN")).toBe("Sign in");
  });

  it("picks plural forms by count", () => {
    const sources = [{ language: "en", dictionary: en }];
    expect(translate(sources, "ITEMS", { count: 1 })).toBe("1 item");
    expect(translate(sources, "ITEMS", { count: 3 })).toBe("3 items");
  });

  it("uses the other form when a language lacks the exact form", () => {
    const sources = [
      { language: "de", dictionary: de },
      { language: "en", dictionary: en },
    ];
    expect(translate(sources, "ITEMS", { count: 1 })).toBe("1 Einträge");
  });

  it("fills values into the German text", () => {
    const sources = [
      {
        language: "de",
        dictionary: { DELETED: "{{count}} Einträge von {{name}} gelöscht" },
      },
      {
        language: "en",
        dictionary: { DELETED: "Deleted {{count}} items of {{name}}" },
      },
    ];
    expect(translate(sources, "DELETED", { count: 3, name: "Ada" })).toBe(
      "3 Einträge von Ada gelöscht",
    );
  });

  it("uses English when the German text lost or renamed a placeholder", () => {
    const sources = [
      {
        language: "de",
        dictionary: { DELETED: "{{Anzahl}} Einträge gelöscht" },
      },
      { language: "en", dictionary: { DELETED: "Deleted {{count}} items" } },
    ];
    expect(translate(sources, "DELETED", { count: 3 })).toBe("Deleted 3 items");
  });

  it("returns the key when no source has it", () => {
    expect(translate([{ language: "en", dictionary: en }], "UNKNOWN")).toBe(
      "UNKNOWN",
    );
  });
});

describe("interpolate", () => {
  it("keeps unknown placeholders", () => {
    expect(interpolate("{{a}} and {{ b }}", { b: 2 })).toBe("{{a}} and 2");
  });

  it("does not read inherited properties", () => {
    expect(interpolate("{{toString}}", {})).toBe("{{toString}}");
  });
});

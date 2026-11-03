import { Linter } from "eslint";
import { describe, expect, it } from "vitest";
import { hardcodedTextExemptFiles, noHardcodedTextRule } from "./index";

const lint = (code: string) =>
  new Linter({ configType: "flat" })
    .verify(code, {
      languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
      rules: { "no-restricted-syntax": noHardcodedTextRule as never },
    })
    .map((m) => m.message);

describe("noHardcodedTextRule", () => {
  it("flags visible JSX text", () => {
    expect(lint("const a = <p>Save changes</p>;")).toHaveLength(1);
  });

  it("flags string placeholder, title, alt and aria-label values", () => {
    expect(
      lint(
        'const a = <div><input placeholder="Search" /><img alt="Logo" /><b title="Hint" /><i aria-label="Close" /></div>;',
      ),
    ).toHaveLength(4);
    expect(
      lint("const a = <input placeholder={`Search here`} />;"),
    ).toHaveLength(1);
  });

  it("allows i18n calls, acronyms, symbols and other attributes", () => {
    expect(
      lint(
        'const a = <div className="flex" data-id="row"><p>{t("SAVE")}</p><span>SAST</span><span>· 3</span><input placeholder={t("SEARCH")} /></div>;',
      ),
    ).toHaveLength(0);
  });

  it("exempts tests, stories and test helpers", () => {
    expect(hardcodedTextExemptFiles).toEqual(
      expect.arrayContaining([
        "**/*.test.{ts,tsx}",
        "**/*.stories.{ts,tsx}",
        "**/test-utils/**",
      ]),
    );
  });
});

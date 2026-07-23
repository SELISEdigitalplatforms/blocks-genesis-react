import { describe, it, expect, beforeEach } from "vitest";
import { useLanguageViewStore } from "@/store/language-view.store";

describe("useLanguageViewStore", () => {
  beforeEach(() => useLanguageViewStore.getState().resetSelectedLanguages());

  it("starts with empty selections", () => {
    const state = useLanguageViewStore.getState();
    expect(state.selectedLanguages).toEqual([]);
    expect(state.selectedOptionalColumns).toEqual([]);
  });

  it("setSelectedLanguages replaces the list", () => {
    useLanguageViewStore.getState().setSelectedLanguages(["en", "fr"]);
    expect(useLanguageViewStore.getState().selectedLanguages).toEqual([
      "en",
      "fr",
    ]);
  });

  it("toggleLanguage adds then removes a language", () => {
    useLanguageViewStore.getState().toggleLanguage("en");
    expect(useLanguageViewStore.getState().selectedLanguages).toContain("en");
    useLanguageViewStore.getState().toggleLanguage("en");
    expect(useLanguageViewStore.getState().selectedLanguages).not.toContain(
      "en",
    );
  });

  it("setSelectedOptionalColumns replaces the column list", () => {
    useLanguageViewStore.getState().setSelectedOptionalColumns(["a"]);
    expect(useLanguageViewStore.getState().selectedOptionalColumns).toEqual([
      "a",
    ]);
  });

  it("toggleOptionalColumn adds then removes a column", () => {
    useLanguageViewStore.getState().toggleOptionalColumn("a");
    expect(useLanguageViewStore.getState().selectedOptionalColumns).toContain(
      "a",
    );
    useLanguageViewStore.getState().toggleOptionalColumn("a");
    expect(
      useLanguageViewStore.getState().selectedOptionalColumns,
    ).not.toContain("a");
  });

  it("resetSelectedLanguages clears both lists", () => {
    useLanguageViewStore.getState().setSelectedLanguages(["en"]);
    useLanguageViewStore.getState().setSelectedOptionalColumns(["a"]);
    useLanguageViewStore.getState().resetSelectedLanguages();
    expect(useLanguageViewStore.getState().selectedLanguages).toEqual([]);
    expect(useLanguageViewStore.getState().selectedOptionalColumns).toEqual([]);
  });
});

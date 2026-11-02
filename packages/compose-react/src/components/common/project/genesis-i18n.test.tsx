import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useI18nStore } from "@/i18n";
import { useAppSettingsStore } from "@/store/app-settings.store";
import { ArchiveProject } from "../archive-project";

vi.mock("@/hooks/use-project", () => ({
  useDisableProject: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));
vi.mock("react-router", () => ({ useNavigate: () => vi.fn() }));

describe("genesis German text", () => {
  afterEach(() => {
    act(() => useAppSettingsStore.getState().setSettings({ language: "en" }));
  });

  it("shows the German button text once a German dictionary is loaded", () => {
    useI18nStore.getState().setRemote("de", "common", { DELETE: "Löschen" });
    act(() => useAppSettingsStore.getState().setSettings({ language: "de" }));
    render(<ArchiveProject />);
    expect(screen.getByText("Löschen")).toBeInTheDocument();
  });
});

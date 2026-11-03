import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useI18nStore } from "@/i18n";
import { useAppSettingsStore } from "@/store/app-settings.store";
import { ArchiveProject } from "../archive-project";

vi.mock("@/hooks/use-project", () => ({
  useDisableProject: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));
vi.mock("react-router", () => ({ useNavigate: () => vi.fn() }));

describe("genesis text in another language", () => {
  afterEach(() => {
    act(() => useAppSettingsStore.getState().setSettings({ language: "en" }));
  });

  it("shows the other-language button text once its dictionary is loaded", () => {
    useI18nStore
      .getState()
      .setRemote("xx", "common", { DELETE: "[xx] Delete" });
    act(() => useAppSettingsStore.getState().setSettings({ language: "xx" }));
    render(<ArchiveProject />);
    expect(screen.getByText("[xx] Delete")).toBeInTheDocument();
  });
});

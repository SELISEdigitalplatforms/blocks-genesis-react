import { beforeEach, describe, expect, it, vi } from "vitest";
import { showErrorToast, showInfoToast, showSuccessToast } from "./index";

const h = vi.hoisted(() => ({
  toast: vi.fn(),
  handleErrorMessages: vi.fn(),
}));

vi.mock("@/hooks/use-toast", () => ({ toast: h.toast }));
vi.mock("@/utils/error", () => ({
  handleErrorMessages: h.handleErrorMessages,
}));

describe("toast helpers", () => {
  beforeEach(() => vi.clearAllMocks());

  it("shows a success toast with the default title", () => {
    showSuccessToast({ description: "Saved" });

    expect(h.toast).toHaveBeenCalledWith({
      variant: "success",
      title: "Success",
      description: "Saved",
    });
  });

  it("shows an info toast with a custom title", () => {
    showInfoToast({ title: "Heads up", description: "Note" });

    expect(h.toast).toHaveBeenCalledWith({
      variant: "info",
      title: "Heads up",
      description: "Note",
    });
  });

  it("shows an error toast with a single string message", () => {
    h.handleErrorMessages.mockReturnValue("Something failed");

    showErrorToast({ errors: new Error("x") });

    expect(h.toast).toHaveBeenCalledWith(
      expect.objectContaining({
        variant: "destructive",
        title: "Failed",
        description: "Something failed",
      }),
    );
  });

  it("renders multiple error messages as separate nodes", () => {
    h.handleErrorMessages.mockReturnValue(["first", "second"]);

    showErrorToast({ errors: {}, customMessages: { code: "msg" } });

    expect(h.handleErrorMessages).toHaveBeenCalledWith({}, { code: "msg" });
    const call = h.toast.mock.calls[0]?.[0];
    expect(Array.isArray(call.description)).toBe(true);
    expect(call.description).toHaveLength(2);
  });
});

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CnameValidatorProject } from "./validator-project";

const h = vi.hoisted(() => ({
  mutateAsync: vi.fn(),
  isPending: false,
  showSuccess: vi.fn(),
  showError: vi.fn(),
}));

vi.mock("@/hooks/use-project", () => ({
  useValidateCNameProject: () => ({
    mutateAsync: h.mutateAsync,
    isPending: h.isPending,
  }),
}));
vi.mock("@/utils/toast", () => ({
  showSuccessToast: h.showSuccess,
  showErrorToast: h.showError,
}));

const renderValidator = (isDomainVerified = false) =>
  render(
    <CnameValidatorProject
      isDomainVerified={isDomainVerified}
      cookieDomain="example.com"
    />,
  );

describe("CnameValidatorProject", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    h.isPending = false;
  });

  it("renders the lookup button", () => {
    renderValidator();

    expect(
      screen.getByRole("button", { name: "CNAME Lookup" }),
    ).toBeInTheDocument();
  });

  it("disables the button when the domain is already verified", () => {
    renderValidator(true);

    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("validates and shows a success toast", async () => {
    h.mutateAsync.mockResolvedValue({ isSuccess: true });
    renderValidator();

    fireEvent.click(screen.getByRole("button"));

    await waitFor(() => expect(h.showSuccess).toHaveBeenCalled());
  });

  it("shows an error toast with the fallback message when validation fails", async () => {
    h.mutateAsync.mockResolvedValue(undefined);
    renderValidator();

    fireEvent.click(screen.getByRole("button"));

    await waitFor(() =>
      expect(h.showError).toHaveBeenCalledWith({
        errors:
          "Could not verify the domain. Please make sure it is valid and try again.",
      }),
    );
  });

  it("shows an error toast when the mutation throws with errors", async () => {
    h.mutateAsync.mockRejectedValue({ errors: ["boom"] });
    renderValidator();

    fireEvent.click(screen.getByRole("button"));

    await waitFor(() =>
      expect(h.showError).toHaveBeenCalledWith({ errors: ["boom"] }),
    );
  });
});

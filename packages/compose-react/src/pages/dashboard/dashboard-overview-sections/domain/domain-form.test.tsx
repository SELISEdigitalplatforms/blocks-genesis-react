import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

const mutateAsync = vi.fn();
vi.mock("@/hooks/use-project", () => ({
  useUpdateProject: () => ({ mutateAsync, isPending: false }),
}));
vi.mock("@/utils/toast", () => ({
  showSuccessToast: vi.fn(),
  showErrorToast: vi.fn(),
}));

import { Dialog } from "@/components/core/dialog";
import { DomainForm } from "@/pages/dashboard/dashboard-overview-sections/domain/domain-form";

const renderForm = (props: Record<string, unknown> = {}) =>
  render(
    <Dialog open>
      <DomainForm onAfterSubmit={vi.fn()} {...(props as never)} />
    </Dialog>,
  );

beforeEach(() => {
  mutateAsync.mockReset().mockResolvedValue({ isSuccess: true });
});

describe("DomainForm", () => {
  it("renders in add mode with an Add button", () => {
    renderForm();
    expect(screen.getByRole("button", { name: "Add" })).toBeInTheDocument();
    expect(screen.getByText("Domain")).toBeInTheDocument();
    expect(screen.getByText("Cookie Domain")).toBeInTheDocument();
  });

  it("auto-fills the cookie domain from the entered domain", () => {
    renderForm();
    const inputs = screen.getAllByPlaceholderText("your-domain.com");
    fireEvent.change(inputs[0], { target: { value: "app.example.com" } });
    expect((inputs[1] as HTMLInputElement).value).toBe("example.com");
  });

  it("submits a new domain in add mode", async () => {
    const onAfterSubmit = vi.fn();
    renderForm({ onAfterSubmit });
    const inputs = screen.getAllByPlaceholderText("your-domain.com");
    fireEvent.change(inputs[0], { target: { value: "app.example.com" } });
    fireEvent.submit(document.querySelector("form")!);
    await waitFor(() => expect(mutateAsync).toHaveBeenCalled());
    expect(mutateAsync.mock.calls[0][0].application.domain).toBe(
      "https://app.example.com",
    );
    await waitFor(() => expect(onAfterSubmit).toHaveBeenCalled());
  });

  it("prefills values and submits an update in edit mode", async () => {
    renderForm({
      application: {
        domain: "https://beta.example.com",
        cookieDomain: "example.com",
        isDomainVerified: true,
      },
    });
    expect(screen.getByRole("button", { name: "Update" })).toBeInTheDocument();
    fireEvent.submit(document.querySelector("form")!);
    await waitFor(() => expect(mutateAsync).toHaveBeenCalled());
    expect(mutateAsync.mock.calls[0][0].applicationDomain).toBe(
      "https://beta.example.com",
    );
  });
});

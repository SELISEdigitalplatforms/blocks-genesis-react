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
/* eslint-disable @typescript-eslint/no-explicit-any */
vi.mock(
  "@/pages/dashboard/dashboard-overview-sections/domain/domain-form-dialog",
  () => ({ DomainFormDialog: () => null }),
);
vi.mock("@/pages/dashboard/dashboard-overview-sections/cname/dialog", () => ({
  CnameValidatorDialog: () => null,
}));
vi.mock("@/components/common/confirmation-modal", () => ({
  ConfirmationModal: ({ onConfirm, onCancel }: any) => (
    <div>
      <button onClick={onConfirm}>confirm-delete</button>
      <button onClick={onCancel}>cancel-delete</button>
    </div>
  ),
}));

import { DomainTable } from "@/pages/dashboard/dashboard-overview-sections/domain/domain-table";
import { showSuccessToast } from "@/utils/toast";

const data = [
  { domain: "app.example.com", isDomainVerified: true, cookieDomain: ".ex.com" },
  {
    domain: "beta.example.com",
    isDomainVerified: false,
    cookieDomain: ".ex.com",
  },
];

beforeEach(() => {
  mutateAsync.mockReset().mockResolvedValue({ isSuccess: true });
  vi.mocked(showSuccessToast).mockReset();
});

describe("DomainTable", () => {
  it("renders domain rows with verification status", () => {
    render(<DomainTable data={data as never} />);
    expect(screen.getByText("app.example.com")).toBeInTheDocument();
    expect(screen.getByText("beta.example.com")).toBeInTheDocument();
    expect(screen.getByText("Verified")).toBeInTheDocument();
    expect(screen.getByText("Unverified")).toBeInTheDocument();
  });

  it("only shows configure and CNAME actions for unverified domains", () => {
    render(<DomainTable data={data as never} />);
    expect(screen.getAllByRole("button", { name: "Delete domain" })).toHaveLength(2);
    expect(
      screen.getAllByRole("button", { name: "Configure domain" }),
    ).toHaveLength(1);
    expect(
      screen.getAllByRole("button", { name: "Validate CNAME" }),
    ).toHaveLength(1);
  });

  it("deletes a domain and shows a success toast on confirm", async () => {
    render(<DomainTable data={data as never} />);
    fireEvent.click(
      screen.getAllByRole("button", { name: "Delete domain" })[0],
    );
    fireEvent.click(screen.getByText("confirm-delete"));
    await waitFor(() => expect(mutateAsync).toHaveBeenCalled());
    await waitFor(() => expect(showSuccessToast).toHaveBeenCalled());
  });
});

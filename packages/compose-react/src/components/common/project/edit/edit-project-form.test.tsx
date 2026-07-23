import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Dialog } from "@/components";
import { EditProjectForm } from "./edit-project-form";

const h = vi.hoisted(() => ({
  mutateAsync: vi.fn(),
  isPending: false,
  showSuccess: vi.fn(),
  showError: vi.fn(),
}));

vi.mock("@/hooks/use-project", () => ({
  useUpdateTenantGroup: () => ({
    mutateAsync: h.mutateAsync,
    isPending: h.isPending,
  }),
}));

vi.mock("@/utils/toast", () => ({
  showSuccessToast: h.showSuccess,
  showErrorToast: h.showError,
}));

vi.mock("@/utils/error", () => ({
  isErrorWithErrors: (error: unknown) =>
    !!error && typeof error === "object" && "errors" in error,
}));

const wrapper = ({ children }: { children: ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return (
    <QueryClientProvider client={queryClient}>
      <Dialog open>{children}</Dialog>
    </QueryClientProvider>
  );
};

const renderForm = () => {
  const onAfterSubmit = vi.fn();
  render(
    <EditProjectForm
      tenantGroupId="tg-1"
      currentName="Old Name"
      onAfterSubmit={onAfterSubmit}
    />,
    { wrapper },
  );
  return { onAfterSubmit };
};

const typeName = (value: string) =>
  fireEvent.change(screen.getByPlaceholderText("Enter project name"), {
    target: { value },
  });

const submitForm = () =>
  fireEvent.submit(
    screen.getByPlaceholderText("Enter project name").closest("form")!,
  );

describe("EditProjectForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    h.isPending = false;
  });

  it("prefills the current name and disables save until the field is dirty", () => {
    renderForm();

    expect(screen.getByDisplayValue("Old Name")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
  });

  it("updates the project and reports success", async () => {
    h.mutateAsync.mockResolvedValue({ isSuccess: true });
    const { onAfterSubmit } = renderForm();

    typeName("New Name");
    submitForm();

    await waitFor(() =>
      expect(h.mutateAsync).toHaveBeenCalledWith({
        name: "New Name",
        tenantGroupId: "tg-1",
      }),
    );
    expect(h.showSuccess).toHaveBeenCalled();
    expect(onAfterSubmit).toHaveBeenCalled();
  });

  it("shows an error toast when the update is unsuccessful", async () => {
    h.mutateAsync.mockResolvedValue({ isSuccess: false, errors: ["nope"] });
    renderForm();

    typeName("New Name");
    submitForm();

    await waitFor(() =>
      expect(h.showError).toHaveBeenCalledWith({ errors: ["nope"] }),
    );
  });

  it("shows an error toast when the update throws with errors", async () => {
    h.mutateAsync.mockRejectedValue({ errors: ["boom"] });
    renderForm();

    typeName("New Name");
    submitForm();

    await waitFor(() =>
      expect(h.showError).toHaveBeenCalledWith({ errors: ["boom"] }),
    );
  });

  it("keeps save disabled while a request is pending", () => {
    h.isPending = true;
    renderForm();

    typeName("New Name");
    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
  });
});

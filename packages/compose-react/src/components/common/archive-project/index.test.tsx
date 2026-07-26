import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ArchiveProject } from "./index";

const h = vi.hoisted(() => ({
  mutateAsync: vi.fn(),
  isPending: false,
  navigate: vi.fn(),
  showSuccess: vi.fn(),
  showError: vi.fn(),
  selectedProject: { tenantId: "tenant-1" } as { tenantId: string } | undefined,
}));

vi.mock("@/hooks/use-project", () => ({
  useDisableProject: () => ({
    mutateAsync: h.mutateAsync,
    isPending: h.isPending,
  }),
}));

vi.mock("@/store", () => ({
  useProjectStore: () => ({ selectedProject: h.selectedProject }),
}));

vi.mock("@/utils/toast", () => ({
  showSuccessToast: h.showSuccess,
  showErrorToast: h.showError,
}));

vi.mock("@/utils/error", () => ({
  isErrorWithErrors: (error: unknown) =>
    !!error && typeof error === "object" && "errors" in error,
}));

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router-dom")>()),
  useNavigate: () => h.navigate,
}));

vi.mock("@/components/common/confirmation-modal", () => ({
  ConfirmationModal: ({ onConfirm }: { onConfirm: () => void }) => (
    <button onClick={onConfirm}>confirm</button>
  ),
}));

const renderArchive = () =>
  render(
    <MemoryRouter>
      <ArchiveProject />
    </MemoryRouter>,
  );

describe("ArchiveProject", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    h.isPending = false;
  });

  it("renders the delete trigger", () => {
    renderArchive();

    expect(screen.getByText("Delete")).toBeInTheDocument();
  });

  it("deletes the project and navigates to the console on success", async () => {
    h.mutateAsync.mockResolvedValue({ isSuccess: true });
    renderArchive();

    fireEvent.click(screen.getByText("confirm"));

    await waitFor(() => expect(h.showSuccess).toHaveBeenCalled());
    expect(h.navigate).toHaveBeenCalledWith("/app/console");
  });

  it("shows an error toast when the deletion is unsuccessful", async () => {
    h.mutateAsync.mockResolvedValue({ isSuccess: false, errors: ["nope"] });
    renderArchive();

    fireEvent.click(screen.getByText("confirm"));

    await waitFor(() =>
      expect(h.showError).toHaveBeenCalledWith({ errors: ["nope"] }),
    );
    expect(h.navigate).not.toHaveBeenCalled();
  });

  it("shows an error toast when the deletion throws with errors", async () => {
    h.mutateAsync.mockRejectedValue({ errors: ["boom"] });
    renderArchive();

    fireEvent.click(screen.getByText("confirm"));

    await waitFor(() =>
      expect(h.showError).toHaveBeenCalledWith({ errors: ["boom"] }),
    );
  });
});

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { IEnvRepository } from "@/models";
import type { IDomain } from "@/models/project.model";
import { SetCustomDomainDialog } from "./dialog";

const h = vi.hoisted(() => ({
  mutateAsync: vi.fn(),
  isPending: false,
  showSuccess: vi.fn(),
  showError: vi.fn(),
}));

vi.mock("@/hooks/use-project", () => ({
  useUpdateRepositories: () => ({
    mutateAsync: h.mutateAsync,
    isPending: h.isPending,
  }),
}));

vi.mock("@/utils/toast", () => ({
  showSuccessToast: h.showSuccess,
  showErrorToast: h.showError,
}));

vi.mock("./form", () => ({
  SetCustomDomainForm: ({
    onSubmit,
    onCancel,
    defaultDomain,
    verifiedDomains,
    isPending,
  }: {
    onSubmit: (domain: string) => void;
    onCancel: () => void;
    defaultDomain: string;
    verifiedDomains: string[];
    isPending: boolean;
  }) => (
    <div>
      <div data-testid="default-domain">{defaultDomain}</div>
      <div data-testid="verified-count">{verifiedDomains.length}</div>
      <div data-testid="pending">{String(isPending)}</div>
      <button onClick={() => onSubmit("assigned.com")}>submit-form</button>
      <button onClick={onCancel}>cancel-form</button>
    </div>
  ),
}));

const repo = {
  itemId: "repo-1",
  repoUrl: "https://github.com/acme/web",
  repoName: "acme-web",
  customDeploymentUrl: "https://a.com/",
} as unknown as IEnvRepository;

const domains = [
  { domain: "a.com", isDomainVerified: true },
  { domain: "a.com", isDomainVerified: true },
  { domain: "b.com", isDomainVerified: false },
] as unknown as IDomain[];

const renderDialog = (overrides: Partial<Parameters<typeof SetCustomDomainDialog>[0]> = {}) =>
  render(
    <SetCustomDomainDialog
      open
      onOpenChange={vi.fn()}
      repo={repo}
      domains={domains}
      projectKey="proj"
      projectEnv="dev"
      {...overrides}
    />,
  );

describe("SetCustomDomainDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    h.isPending = false;
  });

  it("renders the title and the target repo name", () => {
    renderDialog();

    expect(screen.getByText("Set custom domain")).toBeInTheDocument();
    expect(screen.getByText("acme-web")).toBeInTheDocument();
  });

  it("deduplicates verified domains and preselects the matching url", () => {
    renderDialog();

    expect(screen.getByTestId("verified-count")).toHaveTextContent("1");
    expect(screen.getByTestId("default-domain")).toHaveTextContent("a.com");
  });

  it("shows an empty default domain when the current url has no match", () => {
    renderDialog({
      repo: { ...repo, customDeploymentUrl: "https://nomatch.com" } as IEnvRepository,
    });

    expect(screen.getByTestId("default-domain")).toHaveTextContent("");
  });

  it("submits the domain and shows a success toast then closes", async () => {
    const onOpenChange = vi.fn();
    h.mutateAsync.mockResolvedValue({ isSuccess: true });
    renderDialog({ onOpenChange });

    fireEvent.click(screen.getByText("submit-form"));

    await waitFor(() =>
      expect(h.mutateAsync).toHaveBeenCalledWith({
        projectKey: "proj",
        projectEnv: "dev",
        repoWithDomains: [
          {
            repoId: "repo-1",
            repoUrl: "https://github.com/acme/web",
            customDeploymentDomain: "assigned.com",
          },
        ],
      }),
    );
    expect(h.showSuccess).toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("shows an error toast when the update is not successful", async () => {
    h.mutateAsync.mockResolvedValue({ isSuccess: false, errors: ["bad"] });
    renderDialog();

    fireEvent.click(screen.getByText("submit-form"));

    await waitFor(() =>
      expect(h.showError).toHaveBeenCalledWith({ errors: ["bad"] }),
    );
  });

  it("shows an error toast when the update rejects with errors", async () => {
    h.mutateAsync.mockRejectedValue({ errors: ["boom"] });
    renderDialog();

    fireEvent.click(screen.getByText("submit-form"));

    await waitFor(() =>
      expect(h.showError).toHaveBeenCalledWith({ errors: ["boom"] }),
    );
  });

  it("does not call the mutation when there is no repo", async () => {
    renderDialog({ repo: null });

    fireEvent.click(screen.getByText("submit-form"));

    await Promise.resolve();
    expect(h.mutateAsync).not.toHaveBeenCalled();
  });

  it("closes the dialog on cancel", () => {
    const onOpenChange = vi.fn();
    renderDialog({ onOpenChange });

    fireEvent.click(screen.getByText("cancel-form"));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});

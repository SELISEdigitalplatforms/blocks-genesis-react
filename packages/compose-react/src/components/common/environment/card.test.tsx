import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ReactNode } from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";

const h = vi.hoisted(() => ({ mutateAsync: vi.fn() }));
vi.mock("@/hooks/use-impersonation", () => ({
  useStartImpersonation: () => ({ mutateAsync: h.mutateAsync }),
}));
const navigate = vi.fn();
vi.mock("react-router", async (imp) => ({
  ...(await imp<typeof import("react-router")>()),
  useNavigate: () => navigate,
}));

import { EnvironmentCard } from "@/components/common/environment/card";
import { useProjectStore } from "@/store/project.store";

const project = {
  itemId: "i1",
  tenantId: "t-123",
  tenantGroupId: "tg1",
  environment: "prod",
};

const wrap = (ui: ReactNode) => render(<MemoryRouter>{ui}</MemoryRouter>);

beforeEach(() => {
  h.mutateAsync.mockReset().mockResolvedValue(undefined);
  navigate.mockReset();
  useProjectStore.getState().resetProjectStore();
});

describe("EnvironmentCard", () => {
  it("renders the tenant id", () => {
    wrap(<EnvironmentCard project={project as never} />);
    expect(screen.getByText("X-Blocks-Key:")).toBeInTheDocument();
    expect(screen.getByText("t-123")).toBeInTheDocument();
  });

  it("shows a migration indicator when a migration is ongoing", () => {
    wrap(<EnvironmentCard project={project as never} isMigrationOngoing />);
    expect(screen.getByText("t-123")).toBeInTheDocument();
  });

  it("starts impersonation and navigates on click", async () => {
    wrap(<EnvironmentCard project={project as never} />);
    fireEvent.click(screen.getByText("t-123"));
    await waitFor(() =>
      expect(h.mutateAsync).toHaveBeenCalledWith({
        targeted_tenant_id: "t-123",
      }),
    );
    await waitFor(() =>
      expect(navigate).toHaveBeenCalledWith("/app/i1/dashboard"),
    );
    expect(useProjectStore.getState().selectedProject).toMatchObject({
      itemId: "i1",
    });
  });
});

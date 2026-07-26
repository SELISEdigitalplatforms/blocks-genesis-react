import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Dialog } from "@/components/core/dialog";
import { ConfirmationModal } from "@/components/common/confirmation-modal";

describe("ConfirmationModal", () => {
  it("renders the title/subtitle and fires onConfirm", () => {
    const onConfirm = vi.fn();
    render(
      <Dialog open>
        <ConfirmationModal
          data={{
            dialogTitle: "Delete?",
            dialogSubtitle: "Are you sure?",
            confirmButton: "Yes",
            cancelButton: "No",
          }}
          onCancel={vi.fn()}
          onConfirm={onConfirm}
        />
      </Dialog>,
    );
    expect(screen.getByText("Delete?")).toBeInTheDocument();
    expect(screen.getByText("Are you sure?")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Yes" }));
    expect(onConfirm).toHaveBeenCalled();
  });

  it("uses default labels and honours the disabled confirm state", () => {
    render(
      <Dialog open>
        <ConfirmationModal
          data={{ dialogTitle: "T", dialogSubtitle: "S" }}
          onCancel={vi.fn()}
          onConfirm={vi.fn()}
          buttonState={{ confirm: { disable: true } }}
        />
      </Dialog>,
    );
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Yes" })).toBeDisabled();
  });
});

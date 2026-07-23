import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Dialog } from "@/components/core/dialog";
import { ImportFileModalContent } from "@/components/core/import-file-modal/import-file-modal";

const renderModal = (props: Record<string, unknown> = {}) =>
  render(
    <Dialog open>
      <ImportFileModalContent dialogTitle="Import" {...(props as never)} />
    </Dialog>,
  );

describe("ImportFileModalContent", () => {
  it("renders the upload form with default dropzone content", () => {
    renderModal();
    expect(screen.getByText("Import")).toBeInTheDocument();
    expect(screen.getByText("File format")).toBeInTheDocument();
    expect(screen.getByText("Click to upload")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Upload" })).toBeInTheDocument();
  });

  it("fires template-download and cancel callbacks", () => {
    const onDownloadTemplate = vi.fn();
    const onCancel = vi.fn();
    renderModal({ onDownloadTemplate, onCancel });
    fireEvent.click(screen.getByText("File Template"));
    expect(onDownloadTemplate).toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onCancel).toHaveBeenCalled();
  });

  it("transitions to the processing state on upload", async () => {
    renderModal();
    fireEvent.click(screen.getByRole("button", { name: "Upload" }));
    expect(await screen.findByText("Processing request")).toBeInTheDocument();
  });

  it("fires onCheckActivity from the processing state", async () => {
    const onCheckActivity = vi.fn();
    renderModal({ onCheckActivity });
    fireEvent.click(screen.getByRole("button", { name: "Upload" }));
    const check = await screen.findByRole("button", { name: "Check Activity" });
    fireEvent.click(check);
    expect(onCheckActivity).toHaveBeenCalled();
  });

  it("renders custom dropzone content when provided", () => {
    renderModal({ dropzoneContent: <span>custom drop</span> });
    expect(screen.getByText("custom drop")).toBeInTheDocument();
  });
});

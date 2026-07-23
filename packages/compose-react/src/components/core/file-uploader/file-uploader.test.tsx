import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  FileUploader,
  FileUploaderContent,
  FileUploaderItem,
  FileInput,
} from "@/components/core/file-uploader/file-uploader";

const makeFile = (name = "a.png") =>
  new File(["x"], name, { type: "image/png" });

describe("FileUploader", () => {
  it("renders the dropzone input and file items", () => {
    render(
      <FileUploader
        value={[makeFile()]}
        onValueChange={vi.fn()}
        dropzoneOptions={{}}
      >
        <FileInput>
          <div>Drop files here</div>
        </FileInput>
        <FileUploaderContent>
          <FileUploaderItem index={0}>a.png</FileUploaderItem>
        </FileUploaderContent>
      </FileUploader>,
    );
    expect(screen.getByText("Drop files here")).toBeInTheDocument();
    expect(screen.getByText("a.png")).toBeInTheDocument();
  });

  it("removes a file when its remove button is clicked", () => {
    const onValueChange = vi.fn();
    render(
      <FileUploader
        value={[makeFile("a.png"), makeFile("b.png")]}
        onValueChange={onValueChange}
        dropzoneOptions={{}}
      >
        <FileUploaderContent>
          <FileUploaderItem index={0}>a.png</FileUploaderItem>
          <FileUploaderItem index={1}>b.png</FileUploaderItem>
        </FileUploaderContent>
      </FileUploader>,
    );
    fireEvent.click(screen.getByRole("button", { name: /remove item 0/i }));
    expect(onValueChange).toHaveBeenCalled();
  });

  it("moves the active file with the arrow keys", () => {
    render(
      <FileUploader
        value={[makeFile("a.png"), makeFile("b.png")]}
        onValueChange={vi.fn()}
        dropzoneOptions={{}}
      >
        <FileUploaderContent>
          <FileUploaderItem index={0}>a.png</FileUploaderItem>
          <FileUploaderItem index={1}>b.png</FileUploaderItem>
        </FileUploaderContent>
      </FileUploader>,
    );
    fireEvent.keyDown(screen.getByText("a.png"), { key: "ArrowRight" });
    fireEvent.keyDown(screen.getByText("a.png"), { key: "ArrowLeft" });
    expect(screen.getByText("b.png")).toBeInTheDocument();
  });

  it("throws when useFileUpload is used outside the provider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() =>
      render(<FileUploaderItem index={0}>x</FileUploaderItem>),
    ).toThrow("useFileUpload must be used within a FileUploaderProvider");
    spy.mockRestore();
  });
});

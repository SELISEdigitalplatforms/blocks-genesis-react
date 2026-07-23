import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CopyableSnippet } from "./index";

describe("CopyableSnippet", () => {
  const writeText = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
  });

  it("renders the trimmed code", () => {
    const { container } = render(
      <CopyableSnippet code="  echo hi  " isCopyable />,
    );

    expect(container.textContent).toContain("echo hi");
  });

  it("hides the copy button when not copyable", () => {
    render(<CopyableSnippet code="echo hi" isCopyable={false} />);

    expect(
      screen.queryByRole("button", { name: "Copy code" }),
    ).not.toBeInTheDocument();
  });

  it("copies the code to the clipboard on click", async () => {
    render(<CopyableSnippet code="echo hi" isCopyable />);

    fireEvent.click(screen.getByRole("button", { name: "Copy code" }));

    await waitFor(() => expect(writeText).toHaveBeenCalledWith("echo hi"));
  });
});

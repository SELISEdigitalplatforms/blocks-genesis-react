import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TablePagination } from "@/components/common/data-table/data-table-pagination";

describe("TablePagination", () => {
  it("renders page info and disables previous on the first page", () => {
    render(
      <TablePagination
        pageIndex={0}
        pageCount={5}
        pageSize={10}
        onPageChange={vi.fn()}
        onPageSizeChange={vi.fn()}
      />,
    );
    expect(screen.getByText("Rows per page")).toBeInTheDocument();
    expect(screen.getByText("Page 1 of 5")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Go to previous page" }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Go to next page" }),
    ).toBeEnabled();
  });

  it("navigates with the first/prev/next/last buttons", () => {
    const onPageChange = vi.fn();
    render(
      <TablePagination
        pageIndex={2}
        pageCount={5}
        pageSize={10}
        onPageChange={onPageChange}
        onPageSizeChange={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Go to first page" }));
    expect(onPageChange).toHaveBeenCalledWith(0);
    fireEvent.click(
      screen.getByRole("button", { name: "Go to previous page" }),
    );
    expect(onPageChange).toHaveBeenCalledWith(1);
    fireEvent.click(screen.getByRole("button", { name: "Go to next page" }));
    expect(onPageChange).toHaveBeenCalledWith(3);
    fireEvent.click(screen.getByRole("button", { name: "Go to last page" }));
    expect(onPageChange).toHaveBeenCalledWith(4);
  });

  it("changes the page size through the select", async () => {
    const user = userEvent.setup();
    const onPageSizeChange = vi.fn();
    render(
      <TablePagination
        pageIndex={0}
        pageCount={5}
        pageSize={10}
        pageSizeOptions={[10, 20]}
        onPageChange={vi.fn()}
        onPageSizeChange={onPageSizeChange}
      />,
    );
    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByRole("option", { name: "20" }));
    expect(onPageSizeChange).toHaveBeenCalledWith(20);
  });

  it("renders a provided summary", () => {
    render(
      <TablePagination
        pageIndex={0}
        pageCount={1}
        pageSize={10}
        onPageChange={vi.fn()}
        onPageSizeChange={vi.fn()}
        summary="1 of 10 selected"
      />,
    );
    expect(screen.getByText("1 of 10 selected")).toBeInTheDocument();
  });
});

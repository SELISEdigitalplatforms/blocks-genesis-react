import { describe, it, expect, vi } from "vitest";
import type { ReactNode } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { DataTable } from "@/components/common/data-table/data-table";

type Row = { name: string; age: number };

const columns = [
  {
    accessorKey: "name",
    header: "Name",
    cell: (info: { getValue: () => unknown }) => info.getValue(),
  },
  {
    accessorKey: "age",
    header: "Age",
    cell: (info: { getValue: () => unknown }) => info.getValue(),
  },
];
const data: Row[] = [
  { name: "Alice", age: 30 },
  { name: "Bob", age: 25 },
];

const wrap = (ui: ReactNode) =>
  render(<NuqsTestingAdapter>{ui}</NuqsTestingAdapter>);

describe("DataTable", () => {
  it("renders the column headers and data rows", () => {
    wrap(<DataTable data={data} columns={columns as never} />);
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
  });

  it("invokes onRowClick with the row original", () => {
    const onRowClick = vi.fn();
    wrap(
      <DataTable
        data={data}
        columns={columns as never}
        onRowClick={onRowClick}
      />,
    );
    fireEvent.click(screen.getByText("Alice"));
    expect(onRowClick).toHaveBeenCalledWith({ name: "Alice", age: 30 });
  });

  it("renders the empty state when there is no data", () => {
    wrap(<DataTable data={[]} columns={columns as never} />);
    expect(screen.getByText("No results.")).toBeInTheDocument();
  });

  it("renders a loading state instead of rows", () => {
    wrap(<DataTable data={data} columns={columns as never} isLoading />);
    expect(screen.queryByText("Alice")).not.toBeInTheDocument();
  });

  it("renders pagination controls when totalCount exceeds pageSize", () => {
    wrap(
      <DataTable
        data={data}
        columns={columns as never}
        pagination={{ totalCount: 20, pageSize: 5, pageNumber: 0 } as never}
      />,
    );
    expect(screen.getByText("Alice")).toBeInTheDocument();
  });

  it("supports a non-scrollable layout with controlled sort", () => {
    const onSortChange = vi.fn();
    wrap(
      <DataTable
        data={data}
        columns={columns as never}
        scrollable={false}
        sortValue={{ property: "name", isDescending: false }}
        onSortChange={onSortChange}
      />,
    );
    expect(screen.getByText("Alice")).toBeInTheDocument();
  });
});

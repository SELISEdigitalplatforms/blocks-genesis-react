import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { SortValue } from "./sort-header.types";
import { SortHeader } from "./sort-header";

const renderHeader = (
  value: SortValue,
  props: Partial<Parameters<typeof SortHeader>[0]> = {},
) => {
  const onChange = vi.fn();
  render(
    <SortHeader
      id="name"
      label="Name"
      value={value}
      onChange={onChange}
      {...props}
    />,
  );
  return { onChange };
};

describe("SortHeader", () => {
  it("renders the column label", () => {
    renderHeader({ property: "", isDescending: false });

    expect(screen.getByText("Name")).toBeInTheDocument();
  });

  it("sorts ascending when a different column is clicked", () => {
    const { onChange } = renderHeader({
      property: "date",
      isDescending: true,
    });

    fireEvent.click(screen.getByText("Name"));

    expect(onChange).toHaveBeenCalledWith({
      property: "name",
      isDescending: false,
    });
  });

  it("toggles the direction when the active column is clicked", () => {
    const { onChange } = renderHeader({
      property: "name",
      isDescending: false,
    });

    fireEvent.click(screen.getByText("Name"));

    expect(onChange).toHaveBeenCalledWith({
      property: "name",
      isDescending: true,
    });
  });

  it("shows the sort icon only for the active column", () => {
    const { container } = render(
      <SortHeader
        id="name"
        label="Name"
        value={{ property: "name", isDescending: false }}
        onChange={vi.fn()}
      />,
    );

    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("hides the icon for an inactive column", () => {
    const { container } = render(
      <SortHeader
        id="name"
        label="Name"
        value={{ property: "other", isDescending: false }}
        onChange={vi.fn()}
      />,
    );

    expect(container.querySelector("svg")).not.toBeInTheDocument();
  });
});

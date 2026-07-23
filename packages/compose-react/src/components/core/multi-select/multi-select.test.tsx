import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MultiSelect } from "@/components/core/multi-select/multi-select";

const options = [
  { label: "Open", value: "open" },
  { label: "Closed", value: "closed" },
  { label: "Pending", value: "pending" },
];

describe("MultiSelect", () => {
  it("shows a single selected option as a badge", () => {
    render(
      <MultiSelect
        label="Status"
        options={options}
        value={["open"]}
        onChange={() => {}}
      />,
    );
    expect(screen.getAllByText("Open").length).toBeGreaterThan(0);
  });

  it("collapses to a count badge beyond two selections", () => {
    render(
      <MultiSelect
        label="Status"
        options={options}
        value={["open", "closed", "pending"]}
        onChange={() => {}}
      />,
    );
    expect(screen.getByText("3 selected")).toBeInTheDocument();
  });

  it("toggles an option through the popover command list", () => {
    const onChange = vi.fn();
    render(
      <MultiSelect
        label="Status"
        options={options}
        value={[]}
        onChange={onChange}
      />,
    );
    fireEvent.click(screen.getByRole("button"));
    fireEvent.click(screen.getByText("Open"));
    expect(onChange).toHaveBeenCalledWith(["open"]);
  });

  it("clears all selections through the reset item", () => {
    const onChange = vi.fn();
    render(
      <MultiSelect
        label="Status"
        options={options}
        value={["open"]}
        onChange={onChange}
      />,
    );
    fireEvent.click(screen.getByRole("button"));
    fireEvent.click(screen.getByText("Clear"));
    expect(onChange).toHaveBeenCalledWith([]);
  });
});

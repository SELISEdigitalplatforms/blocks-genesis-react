import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { MultiSelect } from "./multi-select";

vi.mock("@/hooks", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/hooks")>()),
  useIsMobile: () => false,
  usePopoverWidth: () => [{ current: null }, undefined],
}));

const options = [
  { label: "Alpha", value: "a" },
  { label: "Beta", value: "b" },
  { label: "Gamma", value: "c" },
];

describe("MultiSelect", () => {
  it("renders the label on the trigger", () => {
    render(
      <MultiSelect
        label="Order Status"
        options={options}
        value={[]}
        onChange={vi.fn()}
      />,
    );

    expect(screen.getByText("Order Status")).toBeInTheDocument();
  });

  it("shows a badge per selected option up to two", () => {
    render(
      <MultiSelect
        label="Order Status"
        options={options}
        value={["a"]}
        onChange={vi.fn()}
      />,
    );

    expect(screen.getByText("Alpha")).toBeInTheDocument();
  });

  it("collapses to a count badge beyond two selections", () => {
    render(
      <MultiSelect
        label="Order Status"
        options={options}
        value={["a", "b", "c"]}
        onChange={vi.fn()}
      />,
    );

    expect(screen.getByText("3 selected")).toBeInTheDocument();
  });

  it("toggles a value when an option is selected", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <MultiSelect
        label="Order Status"
        options={options}
        value={["a"]}
        onChange={onChange}
      />,
    );

    await user.click(screen.getByRole("button"));
    await user.click(await screen.findByText("Beta"));

    expect(onChange).toHaveBeenCalledWith(["a", "b"]);
  });

  it("clears all selections via the Clear action", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <MultiSelect
        label="Order Status"
        options={options}
        value={["a"]}
        onChange={onChange}
      />,
    );

    await user.click(screen.getByRole("button"));
    await user.click(await screen.findByText("Clear"));

    expect(onChange).toHaveBeenCalledWith([]);
  });
});

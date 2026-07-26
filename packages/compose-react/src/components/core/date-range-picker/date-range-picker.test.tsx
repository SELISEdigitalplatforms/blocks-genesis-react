import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DateRangePicker } from "@/components/core/date-range-picker/date-range-picker";

describe("DateRangePicker", () => {
  it("shows the label when no range is committed", () => {
    render(<DateRangePicker label="Pick dates" />);
    expect(screen.getByText("Pick dates")).toBeInTheDocument();
  });

  it("shows a formatted range when a value is provided", () => {
    render(
      <DateRangePicker
        label="Pick dates"
        value={{
          from: new Date(2024, 0, 1),
          to: new Date(2024, 0, 5),
        }}
      />,
    );
    expect(screen.queryByText("Pick dates")).not.toBeInTheDocument();
  });

  it("commits the draft on Apply and clears it on Reset", () => {
    const onChange = vi.fn();
    render(<DateRangePicker label="Pick dates" onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: /Pick dates/ }));
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));
    expect(onChange).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: /Pick dates/ }));
    fireEvent.click(screen.getByRole("button", { name: "Reset" }));
    expect(onChange).toHaveBeenCalledWith(undefined);
  });
});

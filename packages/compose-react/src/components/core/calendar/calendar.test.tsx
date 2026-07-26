import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Calendar } from "@/components/core/calendar/calendar";

describe("Calendar", () => {
  it("renders a day-picker grid", () => {
    render(<Calendar mode="single" defaultMonth={new Date(2024, 0, 1)} />);
    expect(screen.getByRole("grid")).toBeInTheDocument();
  });
});

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  Alert,
  AlertTitle,
  AlertDescription,
} from "@/components/core/alert/alert";

describe("Alert", () => {
  it("renders an alert with a title and description", () => {
    render(
      <Alert>
        <AlertTitle>Heads up</AlertTitle>
        <AlertDescription>Details</AlertDescription>
      </Alert>,
    );
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Heads up")).toBeInTheDocument();
    expect(screen.getByText("Details")).toBeInTheDocument();
  });

  it("applies the destructive variant", () => {
    render(<Alert variant="destructive">D</Alert>);
    expect(screen.getByRole("alert").className).toContain("text-destructive");
  });
});

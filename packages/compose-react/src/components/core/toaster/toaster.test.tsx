import { describe, it, expect } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { toast } from "@/hooks/use-toast";
import { Toaster } from "@/components/core/toaster/toaster";

describe("Toaster", () => {
  it("renders the active toasts from the store", () => {
    act(() => {
      toast({ title: "Saved", description: "All good" });
    });
    render(<Toaster />);
    expect(screen.getByText("Saved")).toBeInTheDocument();
    expect(screen.getByText("All good")).toBeInTheDocument();
  });
});

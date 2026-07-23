import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
} from "@/components/core/toaster/toast";

describe("Toast primitives", () => {
  it("renders an open toast with title, description, action and close", () => {
    render(
      <ToastProvider>
        <Toast open variant="destructive">
          <ToastTitle>Heads up</ToastTitle>
          <ToastDescription>Something happened</ToastDescription>
          <ToastAction altText="Undo the action">Undo</ToastAction>
          <ToastClose />
        </Toast>
        <ToastViewport />
      </ToastProvider>,
    );
    expect(screen.getByText("Heads up")).toBeInTheDocument();
    expect(screen.getByText("Something happened")).toBeInTheDocument();
    expect(screen.getByText("Undo")).toBeInTheDocument();
  });
});

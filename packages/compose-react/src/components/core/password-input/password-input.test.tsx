import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PasswordInput } from "@/components/core/password-input/password-input";

describe("PasswordInput", () => {
  it("toggles between password and text visibility", () => {
    render(<PasswordInput placeholder="Password" />);
    const input = screen.getByPlaceholderText("Password");
    expect(input).toHaveAttribute("type", "password");
    fireEvent.click(
      screen.getByRole("button", { name: "Toggle password visibility" }),
    );
    expect(input).toHaveAttribute("type", "text");
  });
});

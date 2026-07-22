import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/core/avatar/avatar";

describe("Avatar", () => {
  it("renders the fallback while the image is unresolved", () => {
    render(
      <Avatar>
        <AvatarImage src="/x.png" alt="user" />
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>,
    );
    expect(screen.getByText("AB")).toBeInTheDocument();
  });
});

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/core/hover-card/hover-card";

describe("HoverCard", () => {
  it("renders hover-card content when open", () => {
    render(
      <HoverCard open>
        <HoverCardTrigger>Hover</HoverCardTrigger>
        <HoverCardContent>Card body</HoverCardContent>
      </HoverCard>,
    );
    expect(screen.getByText("Card body")).toBeInTheDocument();
  });
});

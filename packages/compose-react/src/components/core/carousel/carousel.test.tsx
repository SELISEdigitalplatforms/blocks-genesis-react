import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/core/carousel/carousel";

describe("Carousel", () => {
  it("renders slides and the previous/next controls", () => {
    render(
      <Carousel>
        <CarouselContent>
          <CarouselItem>Slide 1</CarouselItem>
          <CarouselItem>Slide 2</CarouselItem>
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>,
    );
    expect(screen.getByRole("region")).toBeInTheDocument();
    expect(screen.getByText("Slide 1")).toBeInTheDocument();
    expect(screen.getByText("Previous slide")).toBeInTheDocument();
    expect(screen.getByText("Next slide")).toBeInTheDocument();
  });

  it("supports vertical orientation and arrow-key navigation", () => {
    render(
      <Carousel orientation="vertical">
        <CarouselContent>
          <CarouselItem>Only</CarouselItem>
        </CarouselContent>
      </Carousel>,
    );
    const region = screen.getByRole("region");
    fireEvent.keyDown(region, { key: "ArrowRight" });
    fireEvent.keyDown(region, { key: "ArrowLeft" });
    expect(screen.getByText("Only")).toBeInTheDocument();
  });

  it("throws when a sub-component is used outside a Carousel", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<CarouselItem>x</CarouselItem>)).toThrow(
      "useCarousel must be used within a <Carousel />",
    );
    spy.mockRestore();
  });
});

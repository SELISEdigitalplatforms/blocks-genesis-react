import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/core/accordion/accordion";

describe("Accordion", () => {
  it("renders and shows the content of the open item", () => {
    render(
      <Accordion type="single" defaultValue="a" collapsible>
        <AccordionItem value="a">
          <AccordionTrigger>Section A</AccordionTrigger>
          <AccordionContent>Body A</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );
    expect(screen.getByText("Section A")).toBeInTheDocument();
    expect(screen.getByText("Body A")).toBeInTheDocument();
  });
});

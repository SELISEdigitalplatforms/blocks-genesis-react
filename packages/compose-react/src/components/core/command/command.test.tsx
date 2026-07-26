import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
} from "@/components/core/command/command";

describe("Command", () => {
  it("renders the palette with an input, group, items and separator", () => {
    render(
      <Command>
        <CommandInput placeholder="Search" />
        <CommandList>
          <CommandEmpty>No results</CommandEmpty>
          <CommandGroup heading="Suggestions">
            <CommandItem>
              Item A<CommandShortcut>A</CommandShortcut>
            </CommandItem>
            <CommandSeparator />
            <CommandItem>Item B</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>,
    );
    expect(screen.getByPlaceholderText("Search")).toBeInTheDocument();
    expect(screen.getByText("Item A")).toBeInTheDocument();
    expect(screen.getByText("Item B")).toBeInTheDocument();
  });

  it("renders inside a command dialog when open", () => {
    render(
      <CommandDialog open>
        <CommandInput placeholder="Type" />
        <CommandList>
          <CommandItem>Only</CommandItem>
        </CommandList>
      </CommandDialog>,
    );
    expect(screen.getByText("Only")).toBeInTheDocument();
  });
});

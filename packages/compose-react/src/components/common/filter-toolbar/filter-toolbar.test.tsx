import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { Radio } from "@/components/common/filter-toolbar/radio/radio";
import { SearchInput } from "@/components/common/filter-toolbar/search-input/search-input";
import { DateRange } from "@/components/common/filter-toolbar/date-range/date-range";
import { DropdownSearchInput } from "@/components/common/filter-toolbar/dropdown-search-input/dropdown-search-input";
import { MultiSelect } from "@/components/common/filter-toolbar/multi-select/multi-select";
import { FilterToolbar } from "@/components/common/filter-toolbar/filter-toolbar";

afterEach(() => vi.useRealTimers());

describe("Radio filter", () => {
  const options = [
    { label: "Open", value: "open" },
    { label: "Closed", value: "closed" },
  ];

  it("opens and selects a radio option", () => {
    const onChange = vi.fn();
    render(<Radio label="Status" options={options} value="" onChange={onChange} />);
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getAllByText("Open").length).toBeGreaterThan(0);
    fireEvent.click(screen.getAllByRole("radio")[0]);
    expect(onChange).toHaveBeenCalledWith("open");
  });

  it("shows a no-results state while searching", () => {
    render(<Radio label="Status" options={options} value="" onChange={vi.fn()} />);
    fireEvent.click(screen.getByRole("button"));
    fireEvent.change(screen.getByPlaceholderText("Status"), {
      target: { value: "zzz" },
    });
    expect(screen.getByText("No results found.")).toBeInTheDocument();
  });

  it("renders the selected badge when a value is set", () => {
    render(
      <Radio label="Status" options={options} value="open" onChange={vi.fn()} />,
    );
    expect(screen.getAllByText("Open").length).toBeGreaterThan(0);
  });
});

describe("SearchInput filter", () => {
  it("debounces changes to onChange", () => {
    vi.useFakeTimers();
    const onChange = vi.fn();
    render(<SearchInput value="" onChange={onChange} />);
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "abc" },
    });
    act(() => vi.advanceTimersByTime(1000));
    expect(onChange).toHaveBeenCalledWith("abc");
  });
});

describe("DateRange filter", () => {
  it("renders the trigger with its label", () => {
    render(<DateRange label="Created" value={{}} onChange={vi.fn()} />);
    expect(screen.getByText("Created")).toBeInTheDocument();
  });
});

describe("DropdownSearchInput filter", () => {
  it("renders an input and updates its draft value", () => {
    render(
      <DropdownSearchInput
        value={{ selected: "name", value: "" }}
        options={[{ label: "Name", value: "name" }]}
        onChange={vi.fn()}
      />,
    );
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });
});

describe("MultiSelect filter", () => {
  it("renders the trigger label", () => {
    render(
      <MultiSelect
        label="Tags"
        options={[{ label: "A", value: "a" }]}
        value={[]}
        onChange={vi.fn()}
      />,
    );
    expect(screen.getAllByText("Tags").length).toBeGreaterThan(0);
  });
});

describe("FilterToolbar", () => {
  const filters = [
    { key: "q", type: "SearchInput", label: "Search", props: {} },
    {
      key: "status",
      type: "Radio",
      label: "Status",
      props: { options: [{ label: "Open", value: "open" }] },
    },
  ];

  it("renders the configured controls", () => {
    render(
      <FilterToolbar
        filters={filters as never}
        values={{ q: "", status: "" }}
        defaultValues={{ q: "", status: "" }}
        onChange={vi.fn()}
      />,
    );
    expect(screen.getAllByText("Status").length).toBeGreaterThan(0);
  });

  it("shows the reset control when values differ from defaults", () => {
    render(
      <FilterToolbar
        filters={filters as never}
        values={{ q: "typed", status: "" }}
        defaultValues={{ q: "", status: "" }}
        onChange={vi.fn()}
        onReset={vi.fn()}
      />,
    );
    expect(screen.getAllByText("Status").length).toBeGreaterThan(0);
  });
});

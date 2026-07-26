import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { InfiniteScroller } from "@/components/core/infinite-scroller/infinite-scroller";

type Item = { id: number; text: string };

const baseProps = {
  renderItem: (item: Item) => <div>{item.text}</div>,
  getItemKey: (item: Item) => item.id,
  topFn: vi.fn().mockResolvedValue([]),
  pollingFn: vi.fn().mockResolvedValue([]),
  pollingInterval: 100000,
  loadingIndicator: <div>loading</div>,
  hasTopMore: true,
  bottomIndicator: (scrollToBottom: () => void) => (
    <button onClick={scrollToBottom}>jump to latest</button>
  ),
};

describe("InfiniteScroller", () => {
  it("renders each item from the initial data", () => {
    render(
      <InfiniteScroller
        {...baseProps}
        initialData={[
          { id: 1, text: "alpha" },
          { id: 2, text: "beta" },
        ]}
      />,
    );
    expect(screen.getByText("alpha")).toBeInTheDocument();
    expect(screen.getByText("beta")).toBeInTheDocument();
  });

  it("shows the empty content when there is no data", () => {
    render(
      <InfiniteScroller
        {...baseProps}
        initialData={[]}
        emptyContent={<span>Nothing yet</span>}
      />,
    );
    expect(screen.getByText("Nothing yet")).toBeInTheDocument();
  });

  it("loads older data when scrolled to the top", async () => {
    const topFn = vi.fn().mockResolvedValue([{ id: 0, text: "older" }]);
    const { container } = render(
      <InfiniteScroller
        {...baseProps}
        topFn={topFn}
        initialData={[{ id: 1, text: "alpha" }]}
      />,
    );
    const scroller = container.querySelector(".overflow-auto")!;
    fireEvent.scroll(scroller);
    expect(topFn).toHaveBeenCalled();
    expect(await screen.findByText("older")).toBeInTheDocument();
  });

  it("polls for newer data and surfaces the jump-to-latest control", async () => {
    vi.useFakeTimers();
    const pollingFn = vi.fn().mockResolvedValue([{ id: 3, text: "fresh" }]);
    render(
      <InfiniteScroller
        {...baseProps}
        pollingFn={pollingFn}
        pollingInterval={1000}
        initialData={[{ id: 1, text: "alpha" }]}
      />,
    );
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });
    expect(pollingFn).toHaveBeenCalled();
    expect(screen.getByText("fresh")).toBeInTheDocument();
    fireEvent.click(screen.getByText("jump to latest"));
    vi.useRealTimers();
  });
});

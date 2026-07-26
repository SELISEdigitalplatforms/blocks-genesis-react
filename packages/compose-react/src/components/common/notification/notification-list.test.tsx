import { createRef } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { INotification } from "@/models";
import { NotificationList } from "./notification-list";

vi.mock("./notification-item", () => ({
  NotificationItem: ({ notification }: { notification: INotification }) => (
    <div data-testid="item">{notification.id}</div>
  ),
}));

const baseProps = () => ({
  notifications: [] as INotification[],
  isLoading: false,
  isFetching: false,
  listRef: createRef<HTMLDivElement>(),
  onScroll: vi.fn(),
  onMarkAsRead: vi.fn(),
});

describe("NotificationList", () => {
  it("shows the empty state when there are no notifications", () => {
    render(<NotificationList {...baseProps()} />);

    expect(screen.getByText("No notifications")).toBeInTheDocument();
  });

  it("shows no empty message while the first page is loading", () => {
    render(<NotificationList {...baseProps()} isLoading />);

    expect(screen.queryByText("No notifications")).not.toBeInTheDocument();
  });

  it("renders an item per notification", () => {
    render(
      <NotificationList
        {...baseProps()}
        notifications={[
          { id: "a" } as INotification,
          { id: "b" } as INotification,
        ]}
      />,
    );

    expect(screen.getAllByTestId("item")).toHaveLength(2);
  });

  it("shows a loading footer while fetching more", () => {
    render(
      <NotificationList
        {...baseProps()}
        notifications={[{ id: "a" } as INotification]}
        isFetching
      />,
    );

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("forwards scroll events to the onScroll handler", () => {
    const props = baseProps();
    const { container } = render(<NotificationList {...props} />);

    fireEvent.scroll(container.firstElementChild!);

    expect(props.onScroll).toHaveBeenCalled();
  });
});

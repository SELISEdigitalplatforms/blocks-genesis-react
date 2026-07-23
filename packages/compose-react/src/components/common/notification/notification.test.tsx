import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Notification } from "./notification";

vi.mock("./use-notification-socket", () => ({
  useNotificationSocket: vi.fn(),
}));
vi.mock("./use-notification-feed", () => ({
  useNotificationFeed: () => ({
    notifications: [],
    isLoading: false,
    isFetching: false,
    listRef: { current: null },
    unreadCount: 3,
    handleScroll: vi.fn(),
    handleMarkAsRead: vi.fn(),
    handleMarkAllAsRead: vi.fn(),
  }),
}));
vi.mock("./notification-bell", () => ({
  NotificationBell: ({ unreadCount }: { unreadCount: number }) => (
    <div data-testid="bell">{unreadCount}</div>
  ),
}));
vi.mock("./notification-header", () => ({
  NotificationHeader: () => <div data-testid="nheader" />,
}));
vi.mock("./notification-list", () => ({
  NotificationList: () => <div data-testid="nlist" />,
}));

describe("Notification", () => {
  it("renders the bell with the unread count", () => {
    render(<Notification />);

    expect(screen.getByTestId("bell")).toHaveTextContent("3");
  });

  it("opens the feed with header and list when the bell is clicked", async () => {
    const user = userEvent.setup();
    render(<Notification />);

    await user.click(screen.getByTestId("bell"));

    expect(await screen.findByTestId("nheader")).toBeInTheDocument();
    expect(screen.getByTestId("nlist")).toBeInTheDocument();
  });
});

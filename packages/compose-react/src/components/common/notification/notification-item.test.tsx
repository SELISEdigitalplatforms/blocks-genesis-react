import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { INotification } from "@/models";
import { NotificationItem } from "./notification-item";

const makeNotification = (over: Partial<INotification> = {}): INotification =>
  ({
    id: "n1",
    isRead: false,
    denormalizedPayload: JSON.stringify({
      title: "hello_world",
      description: "World",
      meta: "",
      redirectPath: "",
      toastable: false,
    }),
    createdTime: "2026-01-01T10:00:00Z",
    ...over,
  }) as INotification;

describe("NotificationItem", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders the formatted title and description", () => {
    render(
      <NotificationItem
        notification={makeNotification()}
        onMarkAsRead={vi.fn()}
      />,
    );

    expect(screen.getByText("Hello World")).toBeInTheDocument();
    expect(screen.getByText("World")).toBeInTheDocument();
  });

  it("marks an unread notification as read on mouse enter", () => {
    const onMarkAsRead = vi.fn();
    const { container } = render(
      <NotificationItem
        notification={makeNotification()}
        onMarkAsRead={onMarkAsRead}
      />,
    );

    fireEvent.mouseEnter(container.firstElementChild!);

    expect(onMarkAsRead).toHaveBeenCalledWith("n1");
  });

  it("does not re-mark an already-read notification", () => {
    const onMarkAsRead = vi.fn();
    const { container } = render(
      <NotificationItem
        notification={makeNotification({ isRead: true })}
        onMarkAsRead={onMarkAsRead}
      />,
    );

    fireEvent.mouseEnter(container.firstElementChild!);

    expect(onMarkAsRead).not.toHaveBeenCalled();
  });

  it("renders a placeholder title when the payload is invalid json", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <NotificationItem
        notification={makeNotification({ denormalizedPayload: "not-json" })}
        onMarkAsRead={vi.fn()}
      />,
    );

    expect(screen.getByText("No Title")).toBeInTheDocument();
  });
});

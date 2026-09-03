import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ThemeSwitcher } from "./theme-switcher";

type Theme = "light" | "dark" | "system";

const h = vi.hoisted(() => ({
  resolvedTheme: "light" as "light" | "dark",
  setTheme: vi.fn(),
  theme: "system" as Theme,
}));

vi.mock("@/hooks/use-theme", () => ({
  useTheme: () => ({
    resolvedTheme: h.resolvedTheme,
    setTheme: h.setTheme,
    theme: h.theme,
  }),
}));

describe("ThemeSwitcher", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    h.resolvedTheme = "light";
    h.theme = "system";
  });

  it.each([
    ["system", "light", "monitor"],
    ["system", "dark", "monitor"],
    ["light", "light", "sun"],
    ["dark", "dark", "moon"],
  ] as const)(
    "shows the %s theme icon when the resolved theme is %s",
    (theme, resolvedTheme, icon) => {
      h.theme = theme;
      h.resolvedTheme = resolvedTheme;

      render(<ThemeSwitcher />);

      const trigger = screen.getByRole("button", { name: "Change theme" });
      expect(trigger).toHaveAttribute("type", "button");
      expect(trigger).toHaveTextContent("");
      expect(trigger.querySelectorAll("svg")).toHaveLength(2);
      expect(trigger.querySelector(`.lucide-${icon}`)).toBeInTheDocument();
      expect(trigger.querySelector(".lucide-chevron-down")).toBeInTheDocument();
    },
  );

  it("lists Auto, Light and Dark in order and marks the current theme", async () => {
    const user = userEvent.setup();
    h.theme = "light";
    render(<ThemeSwitcher />);

    await user.click(screen.getByRole("button", { name: "Change theme" }));

    const items = screen.getAllByRole("menuitemradio");
    expect(items.map((item) => item.textContent)).toEqual([
      "Auto",
      "Light",
      "Dark",
    ]);
    expect(items.map((item) => item.getAttribute("aria-checked"))).toEqual([
      "false",
      "true",
      "false",
    ]);
    const autoItem = screen.getByRole("menuitemradio", { name: "Auto" });
    const lightItem = screen.getByRole("menuitemradio", { name: "Light" });
    const darkItem = screen.getByRole("menuitemradio", { name: "Dark" });
    expect(autoItem.querySelector(".lucide-monitor")).toBeInTheDocument();
    expect(lightItem.querySelector(".lucide-sun")).toBeInTheDocument();
    expect(darkItem.querySelector(".lucide-moon")).toBeInTheDocument();
    expect(lightItem.querySelector(".lucide-circle")).toBeInTheDocument();
  });

  it.each([
    ["Auto", "system"],
    ["Light", "light"],
    ["Dark", "dark"],
  ] as const)("selecting %s sets the %s theme once", async (label, theme) => {
    const user = userEvent.setup();
    render(<ThemeSwitcher />);

    await user.click(screen.getByRole("button", { name: "Change theme" }));
    await user.click(screen.getByRole("menuitemradio", { name: label }));

    expect(h.setTheme).toHaveBeenCalledOnce();
    expect(h.setTheme).toHaveBeenCalledWith(theme);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("calls setTheme when the active theme is selected again", async () => {
    const user = userEvent.setup();
    h.theme = "light";
    render(<ThemeSwitcher />);

    await user.click(screen.getByRole("button", { name: "Change theme" }));
    await user.click(screen.getByRole("menuitemradio", { name: "Light" }));

    expect(h.setTheme).toHaveBeenCalledOnce();
    expect(h.setTheme).toHaveBeenCalledWith("light");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("updates the trigger icon from the theme returned on the next render", () => {
    h.theme = "dark";
    const { rerender } = render(<ThemeSwitcher />);
    const trigger = screen.getByRole("button", { name: "Change theme" });
    expect(trigger.querySelector(".lucide-moon")).toBeInTheDocument();

    h.theme = "light";
    rerender(<ThemeSwitcher />);

    expect(trigger.querySelector(".lucide-sun")).toBeInTheDocument();
    expect(trigger.querySelector(".lucide-moon")).not.toBeInTheDocument();
  });

  it("dismisses the menu with Escape without selecting a theme", async () => {
    const user = userEvent.setup();
    render(<ThemeSwitcher />);

    await user.click(screen.getByRole("button", { name: "Change theme" }));
    await user.keyboard("{Escape}");

    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(h.setTheme).not.toHaveBeenCalled();
  });

  it("dismisses the menu on an outside interaction without selecting a theme", async () => {
    const user = userEvent.setup();
    render(
      <div>
        <ThemeSwitcher />
        <button type="button">Outside</button>
      </div>,
    );
    const outside = screen.getByRole("button", { name: "Outside" });

    await user.click(screen.getByRole("button", { name: "Change theme" }));
    fireEvent.pointerDown(outside);

    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(h.setTheme).not.toHaveBeenCalled();
  });

  it("supports opening and selecting a theme with the keyboard", async () => {
    const user = userEvent.setup();
    render(<ThemeSwitcher />);
    const trigger = screen.getByRole("button", { name: "Change theme" });
    trigger.focus();

    await user.keyboard("{Enter}{ArrowDown}{ArrowDown}{Enter}");

    expect(h.setTheme).toHaveBeenCalledOnce();
    expect(h.setTheme).toHaveBeenCalledWith("dark");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });
});

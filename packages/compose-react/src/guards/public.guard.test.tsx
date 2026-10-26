import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { beforeEach, describe, expect, it } from "vitest";
import { PublicGuard } from "@/guards/public.guard";
import { useAuthStore } from "@/store/auth.store";

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route
          path="/login/*"
          element={
            <PublicGuard>
              <div>public page</div>
            </PublicGuard>
          }
        />
        <Route path="/app/console" element={<div>console</div>} />
      </Routes>
    </MemoryRouter>,
  );

describe("PublicGuard", () => {
  beforeEach(() => {
    useAuthStore.getState().setAuthenticated();
  });

  it("sends a signed-in user from the login page to the console", async () => {
    renderAt("/login");

    expect(await screen.findByText("console")).toBeInTheDocument();
  });

  it("leaves the sign-in callback to finish", async () => {
    // Redirecting here sent the console's requests out before the code exchange had replaced the
    // cookie -- and its stop undid an impersonation the new session had just started.
    renderAt("/login/callback");

    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(screen.getByText("public page")).toBeInTheDocument();
    expect(screen.queryByText("console")).toBeNull();
  });
});

import { describe, it, expect } from "vitest";
import type { ReactNode } from "react";
import { renderHook } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { useScopedPath } from "@/hooks/use-scoped-path";

describe("useScopedPath", () => {
  it("builds a project-scoped path from the route param", () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <MemoryRouter initialEntries={["/app/proj123/foo"]}>
        <Routes>
          <Route path="/app/:itemId/*" element={children} />
        </Routes>
      </MemoryRouter>
    );
    const { result } = renderHook(() => useScopedPath(), { wrapper });
    expect(result.current("idp/roles")).toBe("/app/proj123/idp/roles");
    expect(result.current("/leading")).toBe("/app/proj123/leading");
  });

  it("defaults the id to empty when the param is absent", () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <MemoryRouter initialEntries={["/other"]}>
        <Routes>
          <Route path="/other" element={children} />
        </Routes>
      </MemoryRouter>
    );
    const { result } = renderHook(() => useScopedPath(), { wrapper });
    expect(result.current("x")).toBe("/app//x");
  });
});

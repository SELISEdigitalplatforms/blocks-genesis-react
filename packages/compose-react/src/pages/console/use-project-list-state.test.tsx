import type { IProject, IProjectGroup } from "@/models";
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useProjectListState } from "./use-project-list-state";

const project = (
  groupId: string,
  name: string,
  environment: string,
  lastUpdatedDate: string,
): IProject =>
  ({
    environment,
    itemId: `${groupId}-${environment}`,
    lastUpdatedDate,
    name,
    tenantGroupId: groupId,
    tenantId: `${groupId}-${environment}`,
  }) as IProject;

const group = (
  id: string,
  name: string,
  environments: { value: string; updated: string }[],
): IProjectGroup => ({
  tenantGroupId: id,
  projects: environments.map(({ value, updated }) =>
    project(id, name, value, updated),
  ),
  nonSharedProject: [],
  isShared: false,
});

const projectGroups = [
  group("alpha", "Alpha Portal", [
    { value: "dev", updated: "2026-08-01T00:00:00.000Z" },
    { value: "prod", updated: "2026-09-02T00:00:00.000Z" },
  ]),
  group("beta", "Beta Service", [
    { value: "test", updated: "2026-09-01T00:00:00.000Z" },
  ]),
  group("gamma", "Gamma Tool", [
    { value: "sandbox", updated: "2026-07-01T00:00:00.000Z" },
  ]),
];

const visibleNames = (
  result: ReturnType<
    typeof renderHook<ReturnType<typeof useProjectListState>, unknown>
  >["result"],
) => result.current.visibleProjectGroups.map((item) => item.projects[0]?.name);

describe("useProjectListState", () => {
  beforeEach(() => localStorage.clear());

  it("sorts newest first using the latest sibling update", () => {
    const { result } = renderHook(() => useProjectListState(projectGroups));

    expect(visibleNames(result)).toEqual([
      "Alpha Portal",
      "Beta Service",
      "Gamma Tool",
    ]);
    expect(result.current.sort).toEqual({
      property: "lastUpdatedDate",
      isDescending: true,
    });
  });

  it("fuzzy-searches names and filters on any sibling environment", () => {
    const { result } = renderHook(() => useProjectListState(projectGroups));

    act(() => result.current.setSearchText("Alpha Portl"));
    expect(visibleNames(result)).toEqual(["Alpha Portal"]);

    act(() => {
      result.current.setSearchText("");
      result.current.setEnvironmentFilter(["prod", "test"]);
    });
    expect(visibleNames(result)).toEqual(["Alpha Portal", "Beta Service"]);
  });

  it("derives environment options only from environments in the response", () => {
    const { result } = renderHook(() => useProjectListState(projectGroups));

    expect(result.current.availableEnvironmentOptions).toEqual([
      { label: "Development", value: "dev" },
      { label: "Testing", value: "test" },
      { label: "Production", value: "prod" },
      { label: "sandbox", value: "sandbox" },
    ]);
  });

  it("sorts by name in either direction", () => {
    const { result } = renderHook(() => useProjectListState(projectGroups));

    act(() =>
      result.current.setSort({ property: "name", isDescending: false }),
    );
    expect(visibleNames(result)).toEqual([
      "Alpha Portal",
      "Beta Service",
      "Gamma Tool",
    ]);

    act(() => result.current.setSort({ property: "name", isDescending: true }));
    expect(visibleNames(result)).toEqual([
      "Gamma Tool",
      "Beta Service",
      "Alpha Portal",
    ]);
  });

  it("persists only view mode and resets session state on remount", () => {
    const first = renderHook(() => useProjectListState(projectGroups));

    act(() => {
      first.result.current.setViewMode("list");
      first.result.current.setSearchText("Alpha");
      first.result.current.setEnvironmentFilter(["dev"]);
      first.result.current.setSort({ property: "name", isDescending: false });
    });

    expect(
      JSON.parse(localStorage.getItem("console:projectsViewMode") || ""),
    ).toMatchObject({ value: "list" });
    first.unmount();

    const second = renderHook(() => useProjectListState(projectGroups));
    expect(second.result.current.viewMode).toBe("list");
    expect(second.result.current.searchText).toBe("");
    expect(second.result.current.environmentFilter).toEqual([]);
    expect(second.result.current.sort).toEqual({
      property: "lastUpdatedDate",
      isDescending: true,
    });
  });

  it("uses grid view when the persisted value is invalid", () => {
    localStorage.setItem(
      "console:projectsViewMode",
      JSON.stringify({ value: "cards" }),
    );

    const { result } = renderHook(() => useProjectListState([]));

    expect(result.current.viewMode).toBe("grid");
    expect(result.current.visibleProjectGroups).toEqual([]);
  });
});

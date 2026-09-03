import { environmentOptions } from "@/constants/environment-options";
import { useDebouncedFuseFilter } from "@/hooks/use-fuse";
import type { IProjectGroup } from "@/models";
import { createStorage } from "@/utils/storage";
import { useCallback, useMemo, useState } from "react";
import {
  getLatestProjectUpdate,
  getProjectGroupName,
} from "./project-list-utils";

export type ProjectViewMode = "grid" | "list";

export type ProjectSort = {
  property: "name" | "lastUpdatedDate";
  isDescending: boolean;
};

const DEFAULT_SORT: ProjectSort = {
  property: "lastUpdatedDate",
  isDescending: true,
};

const projectViewStorage = createStorage("local", { prefix: "console" });
const VIEW_MODE_KEY = "projectsViewMode";

const readViewMode = (): ProjectViewMode => {
  const storedValue = projectViewStorage.get<ProjectViewMode>(VIEW_MODE_KEY);
  return storedValue === "list" || storedValue === "grid"
    ? storedValue
    : "grid";
};

type SearchableProjectGroup = {
  group: IProjectGroup;
  representativeName: string;
};

const SEARCH_OPTIONS = {
  keys: ["representativeName"],
  threshold: 0.3,
};

export const useProjectListState = (projectGroups: IProjectGroup[]) => {
  const [viewMode, setViewMode] = useState<ProjectViewMode>(readViewMode);
  const [searchText, setSearchText] = useState("");
  const [environmentFilter, setEnvironmentFilter] = useState<string[]>([]);
  const [sort, setSort] = useState<ProjectSort>(DEFAULT_SORT);

  const searchableGroups = useMemo<SearchableProjectGroup[]>(
    () =>
      projectGroups.map((group) => ({
        group,
        representativeName: getProjectGroupName(group),
      })),
    [projectGroups],
  );

  const searchedGroups = useDebouncedFuseFilter(
    searchableGroups,
    searchText,
    SEARCH_OPTIONS,
  );

  const visibleProjectGroups = useMemo(() => {
    const filteredGroups = searchedGroups
      .map(({ group }) => group)
      .filter(
        (group) =>
          environmentFilter.length === 0 ||
          group.projects.some((project) =>
            environmentFilter.includes(project.environment),
          ),
      );

    return filteredGroups.toSorted((left, right) => {
      const comparison =
        sort.property === "name"
          ? getProjectGroupName(left).localeCompare(getProjectGroupName(right))
          : getLatestProjectUpdate(left) - getLatestProjectUpdate(right);

      return sort.isDescending ? -comparison : comparison;
    });
  }, [environmentFilter, searchedGroups, sort]);

  const availableEnvironmentOptions = useMemo(() => {
    const presentValues = new Set(
      projectGroups.flatMap((group) =>
        group.projects
          .map((project) => project.environment)
          .filter((environment) => environment.length > 0),
      ),
    );
    const knownOptions = environmentOptions
      .filter((option) => presentValues.delete(option.value))
      .map(({ label, value }) => ({ label, value }));
    const unknownOptions = [...presentValues]
      .sort((left, right) => left.localeCompare(right))
      .map((value) => ({ label: value, value }));

    return [...knownOptions, ...unknownOptions];
  }, [projectGroups]);

  const persistViewMode = useCallback((nextViewMode: ProjectViewMode) => {
    setViewMode(nextViewMode);
    projectViewStorage.set(VIEW_MODE_KEY, nextViewMode);
  }, []);

  const resetFilters = useCallback(() => {
    setSearchText("");
    setEnvironmentFilter([]);
  }, []);

  return {
    availableEnvironmentOptions,
    environmentFilter,
    resetFilters,
    searchText,
    setEnvironmentFilter,
    setSearchText,
    setSort,
    setViewMode: persistViewMode,
    sort,
    viewMode,
    visibleProjectGroups,
  };
};

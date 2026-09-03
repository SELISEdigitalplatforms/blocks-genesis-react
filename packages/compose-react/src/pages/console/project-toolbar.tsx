import { MultiSelect } from "@/components/common/filter-toolbar/multi-select/multi-select";
import { ResetButton } from "@/components/common/filter-toolbar/reset-button/reset-button";
import { SearchInput } from "@/components/common/filter-toolbar/search-input/search-input";
import { ToggleGroup, ToggleGroupItem } from "@/components/core/toggle-group";
import { LayoutGrid, List } from "lucide-react";
import type { ProjectViewMode } from "./use-project-list-state";

type ProjectToolbarProps = {
  availableEnvironmentOptions: { label: string; value: string }[];
  environmentFilter: string[];
  onEnvironmentFilterChange: (value: string[]) => void;
  onReset: () => void;
  onSearchTextChange: (value: string) => void;
  onViewModeChange: (value: ProjectViewMode) => void;
  searchText: string;
  viewMode: ProjectViewMode;
};

export const ProjectToolbar = ({
  availableEnvironmentOptions,
  environmentFilter,
  onEnvironmentFilterChange,
  onReset,
  onSearchTextChange,
  onViewModeChange,
  searchText,
  viewMode,
}: ProjectToolbarProps) => {
  const hasActiveFilters =
    searchText.trim().length > 0 || environmentFilter.length > 0;

  return (
    <div
      className="flex flex-wrap items-center gap-3"
      aria-label="Project filters and view"
    >
      <SearchInput
        value={searchText}
        onChange={onSearchTextChange}
        placeholder="Search projects..."
      />
      <MultiSelect
        label="Environment"
        options={availableEnvironmentOptions}
        value={environmentFilter}
        onChange={onEnvironmentFilterChange}
      />
      <ToggleGroup
        type="single"
        variant="outline"
        size="sm"
        value={viewMode}
        onValueChange={(value) => {
          if (value === "grid" || value === "list") onViewModeChange(value);
        }}
        aria-label="Project view"
        className="rounded-md border p-0.5"
      >
        <ToggleGroupItem value="grid" aria-label="Grid view">
          <LayoutGrid className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="list" aria-label="List view">
          <List className="h-4 w-4" />
        </ToggleGroupItem>
      </ToggleGroup>
      {hasActiveFilters && <ResetButton onClick={onReset} />}
    </div>
  );
};

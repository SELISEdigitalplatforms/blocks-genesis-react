import { MultiSelect } from "@/components/common/filter-toolbar/multi-select/multi-select";
import { ResetButton } from "@/components/common/filter-toolbar/reset-button/reset-button";
import { SearchInput } from "@/components/common/filter-toolbar/search-input/search-input";
import { ToggleGroup, ToggleGroupItem } from "@/components/core/toggle-group";
import { useT } from "@/i18n";
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
  const { t } = useT("genesis.console");
  const hasActiveFilters =
    searchText.trim().length > 0 || environmentFilter.length > 0;

  return (
    <div
      className="flex flex-wrap items-center justify-between gap-3"
      aria-label={t("PROJECT_TOOLBAR.FILTERS_ARIA")}
    >
      <div className="flex flex-wrap items-center gap-3">
        <SearchInput
          value={searchText}
          onChange={onSearchTextChange}
          placeholder={t("PROJECT_TOOLBAR.SEARCH_PLACEHOLDER")}
        />
        <MultiSelect
          label={t("PROJECT_TOOLBAR.ENVIRONMENT")}
          options={availableEnvironmentOptions}
          value={environmentFilter}
          onChange={onEnvironmentFilterChange}
        />
        {hasActiveFilters && <ResetButton onClick={onReset} />}
      </div>
      <ToggleGroup
        type="single"
        variant="outline"
        size="sm"
        value={viewMode}
        onValueChange={(value) => {
          if (value === "grid" || value === "list") onViewModeChange(value);
        }}
        aria-label={t("PROJECT_TOOLBAR.VIEW_ARIA")}
        className="h-8 rounded-md border bg-background p-0.5"
      >
        <ToggleGroupItem
          value="grid"
          aria-label={t("PROJECT_TOOLBAR.GRID_VIEW")}
          className="h-7 w-7 min-w-0 border-0 px-0"
        >
          <LayoutGrid className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem
          value="list"
          aria-label={t("PROJECT_TOOLBAR.LIST_VIEW")}
          className="h-7 w-7 min-w-0 border-0 px-0"
        >
          <List className="h-4 w-4" />
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
};

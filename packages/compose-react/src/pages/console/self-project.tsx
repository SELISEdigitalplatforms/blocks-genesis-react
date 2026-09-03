import { ProjectCardLoadingSkeleton } from "@/components/common/project";
import { Button } from "@/components/core/button/button";
import { useGetProjects } from "@/hooks/use-project";
import { motion } from "framer-motion";
import { AddProjectCard } from "./add-project-card";
import ConsoleCreateProject from "./console-create";
import { ProjectCard } from "./project-card";
import { ProjectList } from "./project-list";
import { canOpenProject } from "./project-list-utils";
import { ProjectToolbar } from "./project-toolbar";
import { useProjectListState } from "./use-project-list-state";

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: i * 0.06,
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  }),
};

const SelfProjectLoading = () => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {["sk-1", "sk-2", "sk-3", "sk-4", "sk-5", "sk-6", "sk-7", "sk-8"].map(
        (itemKey) => (
          <ProjectCardLoadingSkeleton key={itemKey} />
        ),
      )}
    </div>
  );
};

export type SelfProjectProps = {
  canCreateProject?: boolean;
};

export const SelfProject = ({ canCreateProject = false }: SelfProjectProps) => {
  const { data, isLoading, isFetching } = useGetProjects({ enabled: true });
  const projectGroups = data || [];
  const {
    availableEnvironmentOptions,
    environmentFilter,
    resetFilters,
    searchText,
    setEnvironmentFilter,
    setSearchText,
    setSort,
    setViewMode,
    sort,
    viewMode,
    visibleProjectGroups,
  } = useProjectListState(projectGroups);

  if (isLoading || isFetching) return <SelfProjectLoading />;

  if (!projectGroups.length && canCreateProject)
    return <ConsoleCreateProject />;

  const showAddProject =
    projectGroups.length < 10 && searchText.trim().length === 0;
  const hasNoMatches =
    projectGroups.length > 0 && visibleProjectGroups.length === 0;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <h2 className="shrink-0 text-base font-semibold text-[hsl(var(--high-emphasis))]">
            Your Blocks Projects
          </h2>
          <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-semibold">
            {projectGroups.length}
          </span>
        </div>
        {canCreateProject && projectGroups.length > 9 && (
          <span className="shrink-0 text-sm text-[hsl(var(--medium-emphasis))]">
            Please delete an existing project to create a new one.
          </span>
        )}
      </div>
      {projectGroups.length > 0 && (
        <ProjectToolbar
          availableEnvironmentOptions={availableEnvironmentOptions}
          environmentFilter={environmentFilter}
          onEnvironmentFilterChange={setEnvironmentFilter}
          onReset={resetFilters}
          onSearchTextChange={setSearchText}
          onViewModeChange={setViewMode}
          searchText={searchText}
          viewMode={viewMode}
        />
      )}
      {viewMode === "grid" ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {showAddProject && (
            <motion.div
              variants={cardVariants}
              custom={0}
              initial="hidden"
              animate="visible"
            >
              <AddProjectCard />
            </motion.div>
          )}
          {visibleProjectGroups.map((project, index) => (
            <motion.div
              key={project.tenantGroupId}
              variants={cardVariants}
              custom={showAddProject ? index + 1 : index}
              initial="hidden"
              animate="visible"
            >
              {project.projects[0] && (
                <ProjectCard
                  project={project.projects[0]}
                  projects={project.projects}
                  isShared={project.isShared}
                  canOpen={canOpenProject(project)}
                />
              )}
            </motion.div>
          ))}
        </div>
      ) : (
        <ProjectList
          projectGroups={visibleProjectGroups}
          showAddProject={showAddProject}
          sort={sort}
          onSortChange={setSort}
        />
      )}
      {hasNoMatches && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-6 py-10 text-center">
          <p className="text-sm font-medium text-muted-foreground">
            {searchText.trim()
              ? "No projects match your search"
              : "No projects match the selected filters"}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              if (searchText.trim()) setSearchText("");
              else setEnvironmentFilter([]);
            }}
          >
            {searchText.trim() ? "Clear search" : "Clear filters"}
          </Button>
        </div>
      )}
    </section>
  );
};

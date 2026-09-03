import { SortHeader } from "@/components/common/filter-toolbar/sort-header";
import { Badge } from "@/components/core/badge";
import { Button } from "@/components/core/button/button";
import { Card, CardTitle } from "@/components/core/card/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/core/table";
import { useIsMobile } from "@/hooks/use-mobile";
import type { IProjectGroup } from "@/models";
import { formatDistanceToNow } from "date-fns";
import { Plus, UsersRound } from "lucide-react";
import { ProjectActionButton } from "./project-action-button";
import { ProjectEnvironments } from "./project-environments";
import {
  canOpenProject,
  getLatestProjectUpdate,
  getProjectGroupName,
} from "./project-list-utils";
import { useCreateProjectRedirect } from "./use-create-project-redirect";
import type { ProjectSort } from "./use-project-list-state";

type ProjectListProps = {
  projectGroups: IProjectGroup[];
  showAddProject: boolean;
  sort: ProjectSort;
  onSortChange: (sort: ProjectSort) => void;
};

const getLastUpdatedLabel = (group: IProjectGroup) => {
  const timestamp = getLatestProjectUpdate(group);
  return timestamp === 0
    ? "Unknown"
    : formatDistanceToNow(timestamp, { addSuffix: true });
};

/**
 * Desktop rows are drawn as cards, matching the grid view.
 *
 * Their geometry is set inline rather than through Tailwind utilities on purpose: this
 * package ships JS only, so a consuming app generates CSS by scanning dist — and the
 * utilities this layout needs (`border-separate`, `border-spacing-*`, `rounded-l-2xl`)
 * appear nowhere else in the package, so they can be absent from that app's output and
 * silently render nothing. Everything below sticks to classes used elsewhere already.
 *
 * The card background lives on each `TableCell`, not the `TableRow`: a `<tr>` paints a
 * plain rectangle regardless of a child cell's border-radius, so a row-level background
 * shows through square behind the rounded corners. Per-cell background is clipped to
 * that cell's own radius instead.
 */
const CARD_RADIUS = "1rem";
/** Vertical gap between rows. */
const ROW_SPACING = "0 0.5rem";

const cardCorners = {
  left: {
    borderTopLeftRadius: CARD_RADIUS,
    borderBottomLeftRadius: CARD_RADIUS,
  },
  right: {
    borderTopRightRadius: CARD_RADIUS,
    borderBottomRightRadius: CARD_RADIUS,
  },
} as const;

const SharedStatus = ({ isShared }: { isShared: boolean }) =>
  isShared ? (
    <Badge variant="outline" className="flex w-fit items-center gap-1">
      <UsersRound size={16} />
      Shared
    </Badge>
  ) : (
    <span className="text-muted-foreground">—</span>
  );

const AddProjectListAction = ({ mobile = false }: { mobile?: boolean }) => {
  const { handleClick, isDisabled, isFetching } = useCreateProjectRedirect();

  const action = (
    <Button
      type="button"
      variant="ghost"
      className="text-primary w-full justify-start gap-2"
      disabled={isDisabled || isFetching}
      onClick={handleClick}
    >
      <Plus className="h-4 w-4" />
      Add Project
    </Button>
  );

  if (mobile) {
    return (
      <Card
        data-testid="add-project-list-row"
        className="border-primary/30 rounded-2xl border border-dashed p-2"
      >
        {action}
      </Card>
    );
  }

  return (
    <TableRow data-testid="add-project-list-row" className="border-0">
      <TableCell
        colSpan={5}
        className="border-primary/30 border border-dashed bg-transparent p-2"
        style={{ borderRadius: CARD_RADIUS }}
      >
        {action}
      </TableCell>
    </TableRow>
  );
};

const ProjectMobileList = ({
  projectGroups,
  showAddProject,
}: Pick<ProjectListProps, "projectGroups" | "showAddProject">) => (
  <div className="grid gap-3" data-testid="project-list-mobile">
    {showAddProject && <AddProjectListAction mobile />}
    {projectGroups.map((group) => {
      const project = group.projects[0];

      return (
        <Card
          key={group.tenantGroupId}
          data-testid="project-list-row"
          className="border-border/60 space-y-3 rounded-2xl border p-4 shadow-sm"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-2">
              <CardTitle className="break-all text-base">
                {getProjectGroupName(group) || "Unnamed project"}
              </CardTitle>
              <SharedStatus isShared={group.isShared} />
            </div>
            {project && (
              <ProjectActionButton
                project={project}
                isShared={group.isShared}
                canOpen={canOpenProject(group)}
              />
            )}
          </div>
          <ProjectEnvironments projects={group.projects} />
          <p className="text-muted-foreground text-xs">
            Last updated {getLastUpdatedLabel(group)}
          </p>
        </Card>
      );
    })}
  </div>
);

export const ProjectList = ({
  projectGroups,
  showAddProject,
  sort,
  onSortChange,
}: ProjectListProps) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <ProjectMobileList
        projectGroups={projectGroups}
        showAddProject={showAddProject}
      />
    );
  }

  return (
    <Table
      data-testid="project-list-table"
      style={{ borderCollapse: "separate", borderSpacing: ROW_SPACING }}
    >
      <TableHeader>
        <TableRow className="border-0 hover:bg-transparent">
          <TableHead>
            <SortHeader
              id="name"
              label="Name"
              value={sort}
              onChange={(value) => onSortChange(value as ProjectSort)}
            />
          </TableHead>
          <TableHead>Environments</TableHead>
          <TableHead>Shared</TableHead>
          <TableHead>
            <SortHeader
              id="lastUpdatedDate"
              label="Last Updated"
              value={sort}
              onChange={(value) => onSortChange(value as ProjectSort)}
            />
          </TableHead>
          <TableHead className="text-right">
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {showAddProject && <AddProjectListAction />}
        {projectGroups.map((group) => {
          const project = group.projects[0];

          return (
            <TableRow
              key={group.tenantGroupId}
              data-testid="project-list-row"
              className="border-0"
            >
              <TableCell
                className="bg-card max-w-64 break-all py-2 font-medium"
                style={cardCorners.left}
              >
                {getProjectGroupName(group) || "Unnamed project"}
              </TableCell>
              <TableCell className="bg-card py-2">
                <ProjectEnvironments projects={group.projects} />
              </TableCell>
              <TableCell className="bg-card py-2">
                <SharedStatus isShared={group.isShared} />
              </TableCell>
              <TableCell className="bg-card whitespace-nowrap py-2 text-muted-foreground">
                {getLastUpdatedLabel(group)}
              </TableCell>
              <TableCell
                className="bg-card py-2 text-right"
                style={cardCorners.right}
              >
                {project && (
                  <ProjectActionButton
                    project={project}
                    isShared={group.isShared}
                    canOpen={canOpenProject(group)}
                  />
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

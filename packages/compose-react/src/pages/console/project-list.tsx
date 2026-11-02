import { Badge } from "@/components/core/badge";
import { Button } from "@/components/core/button/button";
import { Card, CardTitle } from "@/components/core/card/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/core/table";
import { useIsMobile } from "@/hooks/use-mobile";
import { useT, type TFunction } from "@/i18n";
import type { IProjectGroup } from "@/models";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale/de";
import { Plus, UsersRound } from "lucide-react";
import { ProjectActionButton } from "./project-action-button";
import { ProjectEnvironments } from "./project-environments";
import {
  canOpenProject,
  getLatestProjectUpdate,
  getProjectGroupName,
} from "./project-list-utils";
import { useCreateProjectRedirect } from "./use-create-project-redirect";

type ProjectListProps = {
  projectGroups: IProjectGroup[];
  showAddProject: boolean;
};

const MODULE = "genesis.console";

const timeAgo = (timestamp: number, language: string) =>
  formatDistanceToNow(timestamp, {
    addSuffix: true,
    locale: language === "de" ? de : undefined,
  });

const getLastUpdatedLabel = (
  group: IProjectGroup,
  t: TFunction,
  language: string,
) => {
  const timestamp = getLatestProjectUpdate(group);
  return timestamp === 0
    ? t("PROJECT_LIST.UNKNOWN")
    : timeAgo(timestamp, language);
};

/**
 * Desktop rows have no "Last Updated" column header (see the card-styling note
 * below), so the cell value carries that context itself instead of a bare relative
 * timestamp.
 */
const getLastUpdatedCellLabel = (
  group: IProjectGroup,
  t: TFunction,
  language: string,
) => {
  const timestamp = getLatestProjectUpdate(group);
  return timestamp === 0
    ? t("PROJECT_LIST.NOT_UPDATED_YET")
    : t("PROJECT_LIST.UPDATED", { time: timeAgo(timestamp, language) });
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
const CARD_RADIUS = "0.75rem";
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

const SharedStatus = ({ isShared }: { isShared: boolean }) => {
  const { t } = useT(MODULE);
  return isShared ? (
    <Badge variant="outline" className="flex w-fit items-center gap-1">
      <UsersRound size={16} />
      {t("PROJECT_LIST.SHARED")}
    </Badge>
  ) : (
    <span className="text-muted-foreground">—</span>
  );
};

const AddProjectListAction = ({ mobile = false }: { mobile?: boolean }) => {
  const { t } = useT(MODULE);
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
      {t("PROJECT_LIST.ADD_PROJECT")}
    </Button>
  );

  if (mobile) {
    return (
      <Card
        data-testid="add-project-list-row"
        className="border-primary/30 rounded-xl border border-dashed p-2"
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
}: Pick<ProjectListProps, "projectGroups" | "showAddProject">) => {
  const { t, language } = useT(MODULE);
  return (
    <div className="grid gap-3" data-testid="project-list-mobile">
      {showAddProject && <AddProjectListAction mobile />}
      {projectGroups.map((group) => {
        const project = group.projects[0];

        return (
          <Card
            key={group.tenantGroupId}
            data-testid="project-list-row"
            className="border-border/60 space-y-3 rounded-xl border p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 space-y-2">
                <CardTitle className="break-all text-base">
                  {getProjectGroupName(group) ||
                    t("PROJECT_LIST.UNNAMED_PROJECT")}
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
              {t("PROJECT_LIST.LAST_UPDATED", {
                time: getLastUpdatedLabel(group, t, language),
              })}
            </p>
          </Card>
        );
      })}
    </div>
  );
};

export const ProjectList = ({
  projectGroups,
  showAddProject,
}: ProjectListProps) => {
  const isMobile = useIsMobile();
  const { t, language } = useT(MODULE);

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
                {getProjectGroupName(group) ||
                  t("PROJECT_LIST.UNNAMED_PROJECT")}
              </TableCell>
              <TableCell className="bg-card py-2">
                <ProjectEnvironments projects={group.projects} />
              </TableCell>
              <TableCell className="bg-card py-2">
                <SharedStatus isShared={group.isShared} />
              </TableCell>
              <TableCell className="bg-card whitespace-nowrap py-2 text-muted-foreground">
                {getLastUpdatedCellLabel(group, t, language)}
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

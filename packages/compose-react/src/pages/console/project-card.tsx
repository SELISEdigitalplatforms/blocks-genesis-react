import { Badge } from "@/components/core/badge";
import { Card, CardTitle } from "@/components/core/card/card";
import { RenderAlternatively } from "@/components/core/render-elements";
import type { IProject } from "@/models";
import { UsersRound } from "lucide-react";
import { ProjectActionButton } from "./project-action-button";
import { ProjectEnvironments } from "./project-environments";

type ProjectCardProps = {
  project: IProject;
  projects: IProject[];
  isShared: boolean;
  /**
   * Whether the viewer may open the project-overview shell.
   *
   * False for a shared project whose owner has granted no menu: that route admits nobody
   * without a grant and redirects straight back to the console, so the button reads as a
   * page that refuses to load rather than as a permissions boundary. Defaults to true —
   * an owner holds every menu implicitly.
   */
  canOpen?: boolean;
};

export const ProjectCard = ({
  project,
  projects,
  isShared,
  canOpen = true,
}: ProjectCardProps) => {
  return (
    <Card className="border-border/60 bg-card hover:border-primary/30 group flex h-40 flex-col overflow-hidden rounded-2xl border p-4 shadow-sm transition-all duration-200 hover:shadow-md">
      <div className="relative flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <CardTitle className="line-clamp-3 break-all text-base font-semibold leading-snug">
            {project.name}
          </CardTitle>
        </div>
        <div className="shrink-0">
          <RenderAlternatively
            condition={isShared}
            whenTrue={
              <div className="flex items-center gap-1">
                <Badge
                  variant={"outline"}
                  className="flex items-center gap-1 shrink-0"
                >
                  <UsersRound size={16} />
                  {"Shared"}
                </Badge>
                <ProjectActionButton
                  project={project}
                  isShared
                  canOpen={canOpen}
                />
              </div>
            }
            whenFalse={
              <ProjectActionButton project={project} isShared={false} />
            }
          />
        </div>
      </div>

      <div className="mt-auto">
        <ProjectEnvironments projects={projects} />
      </div>
    </Card>
  );
};

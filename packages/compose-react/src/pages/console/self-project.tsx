import { ProjectCardLoadingSkeleton } from "@/components/common/project";
import { useGetProjects } from "@/hooks/use-project";
import { motion } from "framer-motion";
import { AddProjectCard } from "./add-project-card";
import ConsoleCreateProject from "./console-create";
import { ProjectCard } from "./project-card";

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

  if (isLoading || isFetching) return <SelfProjectLoading />;
  const projectGroups = data || [];

  if (!projectGroups.length && canCreateProject)
    return <ConsoleCreateProject />;

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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {projectGroups.length < 10 && (
          <motion.div
            variants={cardVariants}
            custom={0}
            initial="hidden"
            animate="visible"
          >
            <AddProjectCard />
          </motion.div>
        )}
        {projectGroups.map((project, i) => (
          <motion.div
            key={project.tenantGroupId}
            variants={cardVariants}
            custom={projectGroups.length < 10 ? i + 1 : i}
            initial="hidden"
            animate="visible"
          >
            {project.projects[0] && (
              <ProjectCard
                project={project.projects[0]}
                projects={project.projects}
                isShared={project.isShared}
              />
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
};

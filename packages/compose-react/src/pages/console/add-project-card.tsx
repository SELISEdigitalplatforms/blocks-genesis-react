import { ProjectCardLoadingSkeleton } from "@/components";
import { Card, CardContent } from "@/components/core/card/card";
import { cn } from "@/lib";
import { Plus } from "lucide-react";
import { useCreateProjectRedirect } from "./use-create-project-redirect";

export const AddProjectCard = () => {
  const { handleClick, isDisabled, isFetching } = useCreateProjectRedirect();

  if (isFetching) {
    return <ProjectCardLoadingSkeleton />;
  }

  return (
    <Card
      onClick={handleClick}
      className={cn(
        "border-primary/30 hover:border-primary/70 flex h-40 items-center justify-center rounded-xl border bg-transparent shadow-sm transition-all duration-200 hover:shadow-md md:py-4",
        isDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
      )}
      style={{ pointerEvents: isDisabled ? "none" : "auto" }}
    >
      <CardContent className="p-0 text-center">
        <div className="flex justify-center">
          <Plus className="text-primary" strokeWidth={2} size={50} />
        </div>
        <p className="text-primary mt-2 font-bold">{"Add Project"}</p>
      </CardContent>
    </Card>
  );
};

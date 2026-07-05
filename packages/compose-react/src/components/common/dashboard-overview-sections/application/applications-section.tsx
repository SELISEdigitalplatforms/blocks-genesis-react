import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components";
import { DashboardSectionCard } from "../dashboard-section-card";
import { ApplicationFormDialog } from "./application-form-dialog";
import { ApplicationsTable } from "./applications-table";
import type { IApplication } from "@/models/project.model";

interface ApplicationsSectionProps {
  applications: IApplication[];
}

export const ApplicationsSection = ({
  applications,
}: ApplicationsSectionProps) => {
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  return (
    <>
      {/* Add dialog — self-contained here, no prop callbacks needed */}
      <ApplicationFormDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        // No application prop → add mode
      />

      <DashboardSectionCard
        title="Domains"
        description="Domains and cookie domains configured for this project"
        contentClassName="p-0"
        headerRight={
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => setAddDialogOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Add Domain
          </Button>
        }
      >
        <ApplicationsTable data={applications} />
      </DashboardSectionCard>
    </>
  );
};

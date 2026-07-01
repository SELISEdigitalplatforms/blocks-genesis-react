import { Plus } from "lucide-react";
import { Button } from "@/components";
import { DashboardSectionCard } from "./dashboard-section-card";
import { ApplicationsTable } from "./applications-table";
import type { IApplication } from "@/models/project.model";

interface ApplicationsSectionProps {
  /**
   * Live data from the API once `GetProjectResponseData.applications` is
   * available. Omit during development — the mock list above is used.
   */
  applications: IApplication[];
  onAddApplication?: () => void;
  onDeleteApplication?: (application: IApplication) => void;
}

export const ApplicationsSection = ({
  applications,
  onAddApplication,
  onDeleteApplication,
}: ApplicationsSectionProps) => {
  const data = applications;

  return (
    <DashboardSectionCard
      title="Applications"
      description="Domains and cookie domains configured for this project"
      contentClassName="p-0"
      headerRight={
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={onAddApplication}>
          <Plus className="h-4 w-4" />
          Add Application
        </Button>
      }>
      <ApplicationsTable data={data} onDelete={onDeleteApplication} />
    </DashboardSectionCard>
  );
};

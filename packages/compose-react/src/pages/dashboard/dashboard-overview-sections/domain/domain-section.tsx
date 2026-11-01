import { useT } from "@/i18n";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components";
import { DashboardSectionCard } from "@/components/common/dashboard-section-card";
import { DomainFormDialog } from "./domain-form-dialog";
import { DomainTable } from "./domain-table";
import type { IDomain } from "@/models/project.model";

interface DomainsSectionProps {
  applications: IDomain[];
}

export const DomainsSection = ({ applications }: DomainsSectionProps) => {
  const { t } = useT("genesis.dashboard");
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  return (
    <>
      {/* Add dialog — self-contained here, no prop callbacks needed */}
      <DomainFormDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        // No application prop → add mode
      />

      <DashboardSectionCard
        title={t("DOMAIN_SECTION.TITLE")}
        description={t("DOMAIN_SECTION.DESCRIPTION")}
        contentClassName="p-0"
        headerRight={
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => setAddDialogOpen(true)}
          >
            <Plus className="h-4 w-4" />
            {t("DOMAIN_SECTION.ADD_DOMAIN")}
          </Button>
        }
      >
        <DomainTable data={applications} />
      </DashboardSectionCard>
    </>
  );
};

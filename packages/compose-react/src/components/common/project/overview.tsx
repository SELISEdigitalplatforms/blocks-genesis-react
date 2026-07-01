import { Badge, CopyToClipboardButton, MaskedText } from "@/components/core";

type ProjectOverviewProps = {
  name: string;
  environment: string;
  tenantId: string;
};

export const ProjectOverview: React.FC<ProjectOverviewProps> = ({
  name,
  environment,
  tenantId,
}) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-semibold md:text-2xl">{name}</h1>
        <Badge>{environment}</Badge>
      </div>
      <div className="flex items-center gap-2 font-mono text-xs">
        <p className="font-medium text-medium-emphasis">{"X-Blocks-Key:"}</p>
        <CopyToClipboardButton
          className="text-high-emphasis rounded-lg items-center"
          textToCopy={tenantId || ""}
          isHoverable
        >
          <MaskedText
            text={tenantId || ""}
            showFirstN={3}
            showLastN={3}
            length={20}
          />
        </CopyToClipboardButton>
      </div>
    </div>
  );
};

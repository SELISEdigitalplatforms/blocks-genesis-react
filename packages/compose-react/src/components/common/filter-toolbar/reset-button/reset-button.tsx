import { useT } from "@/i18n";
import { Button } from "@/components/core";
import { X } from "lucide-react";
import type { MouseEventHandler } from "react";

type ResetButtonProps = {
  onClick: MouseEventHandler<HTMLButtonElement>;
};

export const ResetButton = ({ onClick }: ResetButtonProps) => {
  const { t } = useT("genesis.shared");
  return (
    <Button
      type="button"
      variant="outline"
      onClick={onClick}
      className="h-8 rounded-md px-2 lg:px-3"
    >
      {t("common:RESET")}
      <X className="ml-2 h-4 w-4" />
    </Button>
  );
};

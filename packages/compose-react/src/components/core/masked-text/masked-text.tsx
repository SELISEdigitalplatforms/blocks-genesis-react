import { cn } from "@/lib/utils";

export type MaskedTextProps = {
  text: string;
  length?: number;
  showFirstN?: number;
  showLastN?: number;
  char?: string;
  className?: string;
};

export const MaskedText = ({
  text,
  length,
  showFirstN = 0,
  showLastN = 0,
  char = "*",
  className,
}: MaskedTextProps) => {
  const actualLength = length ?? text?.length ?? 0;
  const firstVisible = showFirstN > 0 ? text.slice(0, showFirstN) : "";
  const lastVisible = showLastN > 0 ? text.slice(-showLastN) : "";
  const maskedCount = Math.max(actualLength - showFirstN - showLastN, 0);

  return (
    <div className={cn("flex min-w-0 items-center overflow-hidden", className)}>
      {firstVisible ? <span className="shrink-0">{firstVisible}</span> : null}
      <span className="h-4 min-w-0 flex-1 overflow-hidden text-muted-foreground">
        {char.repeat(maskedCount)}
      </span>
      {lastVisible ? <span className="shrink-0">{lastVisible}</span> : null}
    </div>
  );
};

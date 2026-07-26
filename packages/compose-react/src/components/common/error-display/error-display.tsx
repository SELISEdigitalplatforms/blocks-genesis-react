import { type LucideIcon, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ErrorDisplayProps {
  icon?: LucideIcon;
  text?: string;
  containerClassName?: string;
  iconClassName?: string;
  textClassName?: string;
}

export function ErrorDisplay({
  icon: Icon = AlertCircle,
  text,
  containerClassName,
  iconClassName,
  textClassName,
}: ErrorDisplayProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2",
        containerClassName,
      )}
    >
      <Icon className={cn("h-8 w-8 text-destructive", iconClassName)} />
      {text && (
        <p className={cn("text-sm text-muted-foreground", textClassName)}>
          {text}
        </p>
      )}
    </div>
  );
}

export function ErrorDisplayWithCard({
  icon: Icon = AlertCircle,
  text,
  containerClassName,
  iconClassName,
  textClassName,
}: Omit<ErrorDisplayProps, "wrapWithCard">) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <ErrorDisplay
        icon={Icon}
        text={text}
        containerClassName={containerClassName}
        iconClassName={iconClassName}
        textClassName={textClassName}
      />
    </div>
  );
}

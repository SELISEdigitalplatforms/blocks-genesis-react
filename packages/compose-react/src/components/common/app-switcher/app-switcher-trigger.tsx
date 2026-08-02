import { PopoverTrigger } from "@/components/core/popover/popover";
import { cn } from "@/lib/utils";
import { Grip } from "lucide-react";

interface AppSwitcherTriggerProps {
  open: boolean;
}

/**
 * The button that opens the AppSwitcher popover. Stateless — the parent
 * owns the `open` state and the `Popover` wrapper.
 */
export function AppSwitcherTrigger({ open }: AppSwitcherTriggerProps) {
  return (
    <PopoverTrigger asChild>
      <button
        aria-label="SELISE Blocks apps"
        className={cn(
          "text-muted-foreground flex h-9 w-9 items-center justify-center rounded-full transition-colors",
          "hover:bg-accent hover:text-foreground focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2",
          open && "bg-accent text-foreground",
        )}
      >
        <Grip className="stroke-3 h-6 w-6" />
      </button>
    </PopoverTrigger>
  );
}

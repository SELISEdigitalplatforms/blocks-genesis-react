import { Bell } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/core/popover/popover";

export function Notification() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="text-muted-foreground hover:text-primary transition-colors"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80">
        <div className="space-y-1">
          <div className="text-primary text-sm font-semibold">Notifications</div>
          <div className="text-muted-foreground text-sm">
            Real-time notifications are being ported into the standalone client.
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

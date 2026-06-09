import * as React from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/core/button";
import { Calendar } from "@/components/core/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/core/popover";

function formatFullDate(date: Date): string {
  return format(date, "PPP");
}

export interface DateRangePickerProps {
  /** Visible label inside the trigger button when no range is selected. */
  label: string;
  /** Currently committed range (controlled). */
  value?: DateRange;
  /** Called when the user clicks "Apply". */
  onChange?: (range: DateRange | undefined) => void;
  /** Number of months shown side-by-side. Defaults to 2 (matches the design). */
  numberOfMonths?: number;
  /** Disable specific dates inside the calendar. */
  disabled?: React.ComponentProps<typeof Calendar>["disabled"];
  /** Trigger button width. */
  className?: string;
  /** Side of the popover relative to the trigger. */
  align?: "start" | "center" | "end";
}

function formatRange(range: DateRange | undefined): string | null {
  if (!range?.from) return null;
  if (!range.to) return formatFullDate(range.from);
  return `${formatFullDate(range.from)} – ${formatFullDate(range.to)}`;
}

/**
 * Two-month date-range picker with "Reset" / "Apply" footer.
 *
 * Visual reference: the date-range filter used in the parent app's
 * Localization → Translations table (e.g. "Create Date" filter).
 */
const DateRangePicker = React.forwardRef<HTMLButtonElement, DateRangePickerProps>(
  ({ label, value, onChange, numberOfMonths = 2, disabled, className, align = "start" }, ref) => {
    const [open, setOpen] = React.useState(false);
    /** Draft selection — only committed to `onChange` when "Apply" is pressed. */
    const [draft, setDraft] = React.useState<DateRange | undefined>(value);

    // Reset the draft whenever the popover (re)opens or external value changes.
    React.useEffect(() => {
      if (open) setDraft(value);
    }, [open, value]);

    const formatted = formatRange(value);

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            variant="outline"
            size="sm"
            className={cn("h-8 gap-2 rounded-full font-normal", className)}
          >
            <CalendarIcon className="h-4 w-4" />
            <span className="truncate">{formatted ?? label}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent align={align} className="w-auto p-0" sideOffset={6}>
          <Calendar
            mode="range"
            selected={draft}
            onSelect={setDraft}
            numberOfMonths={numberOfMonths}
            disabled={disabled}
            defaultMonth={value?.from ?? draft?.from ?? new Date()}
          />
          <div className="border-border flex items-center justify-between gap-2 border-t p-3">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => {
                setDraft(undefined);
                onChange?.(undefined);
                setOpen(false);
              }}
            >
              Reset
            </Button>
            <Button
              size="sm"
              className="flex-1"
              onClick={() => {
                onChange?.(draft);
                setOpen(false);
              }}
            >
              Apply
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    );
  },
);
DateRangePicker.displayName = "DateRangePicker";

export { DateRangePicker };

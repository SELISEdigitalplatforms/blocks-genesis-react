import { cn } from "@/lib/utils";

export function RightSidePanelResizer({
  onHandlePointerDown,
}: {
  onHandlePointerDown: (event: React.PointerEvent<HTMLDivElement>) => void;
}) {
  return (
    <div className="pointer-events-none absolute inset-y-0 -left-0.5 w-1.5">
      {/* Thin separator line visible above and below the knob */}
      <div
        aria-hidden="true"
        className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-border"
      />
      {/* Center knob — the ONLY interactive part */}
      <div
        data-resize-handle
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize panel"
        onPointerDown={onHandlePointerDown}
        className={cn(
          "pointer-events-auto",
          "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
          "flex h-12 w-3 cursor-ew-resize touch-none items-center justify-center",
          "rounded-full bg-border transition-colors duration-150",
          "hover:bg-primary/50 active:bg-primary/70",
        )}
      >
        {/* 2 × 3 dot grid — classic resize gripper pattern */}
        <div aria-hidden="true" className="grid grid-cols-2 gap-[3px]">
          <span className="block h-[3px] w-[3px] rounded-full bg-background/70" />
          <span className="block h-[3px] w-[3px] rounded-full bg-background/70" />
          <span className="block h-[3px] w-[3px] rounded-full bg-background/70" />
          <span className="block h-[3px] w-[3px] rounded-full bg-background/70" />
          <span className="block h-[3px] w-[3px] rounded-full bg-background/70" />
          <span className="block h-[3px] w-[3px] rounded-full bg-background/70" />
        </div>
      </div>
    </div>
  );
}

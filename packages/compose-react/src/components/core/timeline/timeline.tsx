"use client";

import type { ReactNode } from "react";
import { EllipsisVertical, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/core/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/core/dropdown-menu";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { fadeTransition, staggerContainer, staggerItem } from "@/lib/motion-presets";

export type TimelineEventBase = {
  time?: string;
  date?: string;
  description?: string;
};

export type TimelineProps<TEvent extends TimelineEventBase> = {
  events: TEvent[];
  leftContent?: (event: TEvent) => ReactNode;
  rightContent?: (event: TEvent) => ReactNode;
  onRevert?: (event: TEvent) => void;
  revertLabel?: string;
  className?: string;
  connectorClassName?: string;
};

export const Timeline = <TEvent extends TimelineEventBase>({
  events,
  leftContent,
  rightContent,
  onRevert,
  revertLabel = "Revert",
  className,
  connectorClassName,
}: TimelineProps<TEvent>) => {
  const isMobile = useIsMobile();

  const defaultRightContent = (event: TEvent) => {
    const revertAction = isMobile ? (
      <div className="flex w-[25%] justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="ghost" className="size-5 p-0">
              <EllipsisVertical className="size-5" aria-hidden />
              <span className="sr-only">{revertLabel}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="cursor-pointer" onClick={() => onRevert?.(event)}>
              <RotateCcw className="size-4" aria-hidden />
              <span className="ml-2">{revertLabel}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ) : (
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button
          type="button"
          size="default"
          variant="outline"
          className="gap-2"
          onClick={() => onRevert?.(event)}
        >
          <RotateCcw className="size-4" aria-hidden />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">{revertLabel}</span>
        </Button>
      </motion.div>
    );

    return (
      <motion.div className="relative flex w-full flex-row justify-between" layout>
        <p className="text-muted-foreground w-[75%] text-xs font-medium leading-5 md:w-[55%] md:text-base md:leading-6">
          {event.description}
        </p>
        {onRevert ? revertAction : null}
      </motion.div>
    );
  };

  return (
    <motion.div
      className={cn("mt-4 flex flex-col items-start md:mt-5", className)}
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      {events.map((event, index) => (
        <motion.div
          key={`${event.date ?? ""}|${event.time ?? ""}|${event.description ?? ""}`}
          variants={staggerItem}
          transition={fadeTransition}
          className="flex min-h-[66px] w-full"
        >
          <div className={cn("relative", isMobile ? "w-[30%]" : "w-[16%]")}>
            <motion.div
              className="absolute -top-1.5 w-full pr-[18px] text-right md:pr-5"
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ ...fadeTransition, delay: index * 0.05 }}
            >
              {leftContent ? (
                leftContent(event)
              ) : (
                <>
                  <p className="text-muted-foreground text-xs font-medium leading-5 md:text-sm">
                    {event.time}
                  </p>
                  <p className="text-muted-foreground text-xs font-medium leading-5 md:text-sm">
                    {event.date}
                  </p>
                </>
              )}
            </motion.div>
          </div>
          <div className="relative">
            {index !== events.length - 1 ? (
              <motion.div
                className={cn(
                  "bg-border absolute left-[37%] h-full w-1 origin-top",
                  connectorClassName,
                )}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ ...fadeTransition, delay: index * 0.05 }}
              />
            ) : null}
            <motion.div
              className="bg-primary relative z-10 size-4 rounded-full"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ ...fadeTransition, delay: index * 0.05 + 0.04 }}
            />
          </div>
          <div className="relative w-full">
            <div className="absolute -top-1.5 w-full pl-[18px] md:pl-5">
              <div className="flex w-full">
                {rightContent ? rightContent(event) : defaultRightContent(event)}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

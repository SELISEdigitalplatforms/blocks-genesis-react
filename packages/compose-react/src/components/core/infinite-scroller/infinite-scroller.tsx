"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { fadeInUp, fadeTransition } from "@/lib/motion-presets";

export type InfiniteScrollerProps<T> = {
  initialData: T[];
  renderItem: (item: T, index: number) => ReactNode;
  getItemKey?: (item: T, index: number) => string | number;
  topFn: (firstItem: T | null) => Promise<T[]>;
  pollingFn: (lastItem: T | null) => Promise<T[]>;
  pollingInterval: number;
  loadingIndicator: ReactNode;
  hasTopMore: boolean;
  bottomIndicator: (scrollToBottom: () => void) => ReactNode;
  emptyContent?: ReactNode;
  className?: string;
};

export const InfiniteScroller = <T,>({
  initialData,
  renderItem,
  getItemKey,
  topFn,
  pollingFn,
  pollingInterval,
  loadingIndicator,
  bottomIndicator,
  hasTopMore,
  emptyContent,
  className,
}: InfiniteScrollerProps<T>) => {
  const [data, setData] = useState(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(hasTopMore);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isNewDataAvailable, setNewDataAvailable] = useState(false);

  const handleFetchOlderData = useCallback(async () => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);

    try {
      const firstItem: T | null = data.length ? data[0]! : null;
      const olderData = await topFn(firstItem);
      if (olderData.length > 0) {
        const scrollContainer = scrollContainerRef.current;
        const previousScrollHeight = scrollContainer?.scrollHeight ?? 0;

        setData((prevData) => [...olderData, ...prevData]);

        requestAnimationFrame(() => {
          window.setTimeout(() => {
            if (scrollContainer) {
              const newScrollHeight = scrollContainer.scrollHeight;
              const heightAdded = newScrollHeight - previousScrollHeight;
              scrollContainer.scrollTop = heightAdded;
            }
          }, 0);
        });
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching older data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [data, hasMore, isLoading, topFn]);

  const handleFetchNewerData = useCallback(async () => {
    try {
      const lastItem: T | null = data.length ? data[data.length - 1]! : null;
      const newerData = await pollingFn(lastItem);
      if (newerData.length > 0) {
        setNewDataAvailable(true);
        setData((prevData) => [...prevData, ...newerData]);
      }
    } catch (error) {
      console.error("Error fetching newer data:", error);
    }
  }, [data, pollingFn]);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;

    const handleScroll = () => {
      if (scrollContainer && scrollContainer.scrollTop === 0 && hasMore) {
        void handleFetchOlderData();
      }
      if (
        scrollContainer &&
        scrollContainer.scrollTop + scrollContainer.clientHeight >=
          scrollContainer.scrollHeight
      ) {
        setNewDataAvailable(false);
      }
    };

    scrollContainer?.addEventListener("scroll", handleScroll);
    return () => scrollContainer?.removeEventListener("scroll", handleScroll);
  }, [handleFetchOlderData, hasMore]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      void handleFetchNewerData();
    }, pollingInterval);

    return () => window.clearInterval(interval);
  }, [handleFetchNewerData, pollingInterval]);

  const handleScrollToBottom = () => {
    scrollContainerRef.current?.scrollTo({
      top: scrollContainerRef.current.scrollHeight,
      behavior: "smooth",
    });
    setNewDataAvailable(false);
  };

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
      });
    }
  }, []);

  return (
    <div className={className ?? "relative flex h-full flex-col"}>
      <div ref={scrollContainerRef} className="h-full overflow-auto">
        {data.length ? (
          <>
            <AnimatePresence>
              {isLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={fadeTransition}
                >
                  {loadingIndicator}
                </motion.div>
              ) : null}
            </AnimatePresence>
            {data.map((item, index) => {
              const key = getItemKey?.(item, index) ?? index;
              return (
                <motion.div
                  key={key}
                  layout
                  variants={fadeInUp}
                  initial="initial"
                  animate="animate"
                  transition={fadeTransition}
                >
                  {renderItem(item, index)}
                </motion.div>
              );
            })}
          </>
        ) : (
          <motion.div
            className="flex h-full items-center justify-center text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={fadeTransition}
          >
            {emptyContent ?? "No items"}
          </motion.div>
        )}
      </div>
      <AnimatePresence>
        {isNewDataAvailable ? (
          <motion.div
            key="bottom-indicator"
            className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center pb-2"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={fadeTransition}
          >
            <motion.div
              className="pointer-events-auto"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {bottomIndicator(handleScrollToBottom)}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

/** @deprecated Use `InfiniteScroller` */
export const InfiniteScroll = InfiniteScroller;

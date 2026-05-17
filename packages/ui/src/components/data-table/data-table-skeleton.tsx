import { Skeleton } from "@blocks-kit/ui/components/skeleton"

export type DataTableSkeletonProps = {
  rowCount?: number
}

export const DataTableSkeleton = ({ rowCount = 8 }: DataTableSkeletonProps) => (
  <div className="grid w-full gap-2" role="status" aria-label="Loading table">
    {Array.from({ length: rowCount }).map((_, index) => (
      <Skeleton key={index} className="h-12 w-full rounded-lg" />
    ))}
  </div>
)

interface Props {
  className?: string;
}

export function Skeleton({ className = '' }: Props) {
  return <div className={`animate-pulse bg-surface-contrast rounded-md ${className}`} />;
}

export function PropertySkeleton() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-8">
      <Skeleton className="h-4 w-40" />
      <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[420px] rounded-lg overflow-hidden">
        <Skeleton className="col-span-2 row-span-2" />
        <Skeleton />
        <Skeleton />
        <Skeleton />
        <Skeleton />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-2 w-full" />
        <Skeleton className="h-2 w-5/6" />
        <Skeleton className="h-2 w-4/6" />
      </div>
    </div>
  );
}

export function SearchResultsSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 space-y-4">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-white border border-divider rounded-lg p-4 flex gap-4"
        >
          <Skeleton className="w-[280px] h-[180px] shrink-0" />
          <div className="flex-1 space-y-3 py-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
            <div className="flex justify-between items-end pt-4">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

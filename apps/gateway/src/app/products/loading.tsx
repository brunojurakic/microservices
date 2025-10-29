import { Spinner } from '@/components/ui/spinner';

export default function ProductsLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="h-10 w-48 bg-muted animate-pulse rounded" />
        <div className="h-6 w-96 bg-muted animate-pulse rounded mt-2" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex flex-col overflow-hidden rounded-lg border bg-card">
            <div className="relative h-48 w-full bg-muted animate-pulse" />
            <div className="p-6 space-y-3">
              <div className="h-6 bg-muted animate-pulse rounded w-3/4" />
              <div className="h-4 bg-muted animate-pulse rounded w-full" />
              <div className="h-4 bg-muted animate-pulse rounded w-2/3" />
              <div className="h-8 bg-muted animate-pulse rounded w-1/2 mt-4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

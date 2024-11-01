import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="relative rounded-lg bg-card">
        <div className="h-48 animate-pulse rounded-t-lg bg-muted md:h-64" />
        <div className="relative px-4 pb-4 pt-16 md:px-6">
          <div className="absolute -top-16 left-4 h-32 w-32 animate-pulse rounded-full bg-muted md:left-6" />
          <div className="space-y-4">
            <div className="h-8 w-48 animate-pulse rounded bg-muted" />
            <div className="h-4 w-full animate-pulse rounded bg-muted" />
            <div className="flex gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-4 w-20 animate-pulse rounded bg-muted" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Info Skeleton */}
      <Card>
        <CardHeader>
          <div className="h-6 w-32 animate-pulse rounded bg-muted" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              <div className="h-4 w-full animate-pulse rounded bg-muted" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

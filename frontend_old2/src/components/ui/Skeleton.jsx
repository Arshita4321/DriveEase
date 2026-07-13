import React from 'react';
import clsx from 'clsx';

export default function Skeleton({ className }) {
  return <div className={clsx('skeleton', className)} />;
}

export function VehicleCardSkeleton() {
  return (
    <div className="card-surface overflow-hidden rounded-2xl">
      <Skeleton className="h-48 w-full rounded-none" />
      <div className="space-y-3 p-4">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex justify-between pt-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>
    </div>
  );
}

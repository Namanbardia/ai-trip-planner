import React from 'react';

const Shimmer = ({ className = '' }) => (
  <div className={`relative overflow-hidden bg-bone ${className}`}>
    <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-ivory/70 to-transparent" />
  </div>
);

export default function PlanSkeleton() {
  return (
    <div className="space-y-10 animate-fade-in" aria-busy="true" aria-label="Loading your trip plan">
      {/* Masthead skeleton */}
      <div className="rule-hairline pt-10 flex items-end gap-6">
        <Shimmer className="w-32 h-32 shrink-0" />
        <div className="flex-1 space-y-3">
          <Shimmer className="h-3 w-32" />
          <Shimmer className="h-8 w-72 max-w-full" />
          <Shimmer className="h-3 w-96 max-w-full" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Map skeleton */}
        <div className="lg:col-span-5 space-y-4">
          <Shimmer className="h-4 w-36" />
          <Shimmer className="h-[540px] w-full" />
        </div>

        {/* Itinerary skeleton — story rows */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex gap-1">
            <Shimmer className="h-9 w-36" />
            <Shimmer className="h-9 w-24" />
            <Shimmer className="h-9 w-24" />
          </div>
          <div className="space-y-6">
            <Shimmer className="h-6 w-64" />
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex gap-4 items-start">
                <Shimmer className="w-8 h-8 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <Shimmer className="h-4 w-1/2" />
                  <Shimmer className="h-3 w-full" />
                  <Shimmer className="h-3 w-2/3" />
                </div>
              </div>
            ))}
            <p className="text-xs text-sage font-sans font-medium flex items-center gap-2 pt-1">
              <span className="w-4 h-4 border-2 border-terracotta border-t-transparent rounded-full animate-spin inline-block" />
              Clustering attractions into neighbourhood days &amp; optimizing your route…
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

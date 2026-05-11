/**
 * Skeleton Loader Components — 2026 UI Standard
 * Ghost placeholders that make loading feel instant and stable.
 */

const shimmer = `relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent`;

// Base skeleton block
export function SkeletonBlock({ className = '' }) {
  return (
    <div className={`bg-slate-200 dark:bg-slate-700 rounded-xl ${shimmer} ${className}`} />
  );
}

// Card skeleton - matches the standard "card" style
export function SkeletonCard({ lines = 3 }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-[20px] border border-slate-200 dark:border-slate-700 p-5 space-y-4 shadow-xl">
      <div className="flex items-center gap-3">
        <SkeletonBlock className="w-10 h-10 rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <SkeletonBlock className="h-3 w-3/4" />
          <SkeletonBlock className="h-2 w-1/2" />
        </div>
      </div>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonBlock key={i} className={`h-2 ${i === lines - 1 ? 'w-2/3' : 'w-full'}`} />
      ))}
    </div>
  );
}

// Stat card skeleton
export function SkeletonStat() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-[20px] border border-slate-200 dark:border-slate-700 p-6 space-y-4 shadow-xl">
      <SkeletonBlock className="h-2 w-1/2" />
      <SkeletonBlock className="h-8 w-2/3" />
      <SkeletonBlock className="h-1.5 w-full rounded-full" />
    </div>
  );
}

// Table row skeleton
export function SkeletonRow({ cols = 5 }) {
  return (
    <div className="flex items-center gap-4 py-3 px-4 border-b border-slate-100 dark:border-slate-700">
      <SkeletonBlock className="w-8 h-8 rounded-lg flex-shrink-0" />
      {Array.from({ length: cols - 1 }).map((_, i) => (
        <SkeletonBlock key={i} className={`h-2.5 ${i === 0 ? 'flex-1' : 'w-20'}`} />
      ))}
    </div>
  );
}

// Full page skeleton - for dashboard loading
export function SkeletonDashboard() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header */}
      <div className="space-y-2">
        <SkeletonBlock className="h-4 w-48" />
        <SkeletonBlock className="h-8 w-80" />
      </div>
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {[0,1,2,3].map(i => <SkeletonStat key={i} />)}
      </div>
      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkeletonCard lines={4} />
        <SkeletonCard lines={4} />
      </div>
    </div>
  );
}

// List skeleton - for lists of items
export function SkeletonList({ rows = 5 }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-[20px] border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden">
      <div className="p-5 border-b border-slate-100 dark:border-slate-700">
        <SkeletonBlock className="h-3 w-40" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonRow key={i} />
      ))}
    </div>
  );
}

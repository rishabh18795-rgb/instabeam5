// Shown instantly while a workspace page's data loads. Next.js prefetches this
// boundary for every sidebar link, so a click renders it immediately and the
// sidebar/header never freeze behind a slow query.
export default function Loading() {
  return (
    <div role="status" aria-live="polite" aria-label="Loading">
      <div className="mb-6 space-y-2">
        <div className="ops-skeleton h-8 w-56" />
        <div className="ops-skeleton h-4 w-80 max-w-full" />
      </div>
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => <div key={i} className="ops-skeleton h-24" />)}
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
        <div className="ops-skeleton h-72" />
        <div className="ops-skeleton h-72" />
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}

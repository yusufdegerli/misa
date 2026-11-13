/**
 * Shown instantly while an admin page loads its data. It is also the Suspense boundary that lets
 * navigation between admin pages start right away (every admin page reads live data).
 */
export default function AdminLoading() {
  return (
    <div aria-busy="true" className="flex animate-pulse flex-col gap-6">
      <div className="h-4 w-28 rounded bg-hairline" />
      <div className="h-12 w-72 rounded bg-hairline" />
      <div className="h-64 rounded-2xl border border-hairline bg-tile" />
    </div>
  );
}

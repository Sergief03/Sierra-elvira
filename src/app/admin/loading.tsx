export default function AdminDashboardLoading() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      <div className="h-8 w-48 rounded bg-surface-container-high" />
      <div className="h-4 w-64 rounded bg-surface-container-high" />
      <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
        <div className="md:col-span-3 h-32 rounded-xl bg-surface-container-high" />
        <div className="md:col-span-3 h-32 rounded-xl bg-surface-container-high" />
        <div className="md:col-span-3 h-32 rounded-xl bg-surface-container-high" />
        <div className="md:col-span-3 h-32 rounded-xl bg-surface-container-high" />
        <div className="md:col-span-12 h-96 rounded-xl bg-surface-container-high" />
      </div>
    </div>
  );
}

export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      <div className="h-8 w-48 rounded bg-surface-container-high" />
      <div className="h-4 w-72 rounded bg-surface-container-high" />
      <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
        <div className="md:col-span-8 h-64 rounded-xl bg-surface-container-high" />
        <div className="md:col-span-4 h-64 rounded-xl bg-surface-container-high" />
        <div className="md:col-span-12 h-48 rounded-xl bg-surface-container-high" />
      </div>
    </div>
  );
}

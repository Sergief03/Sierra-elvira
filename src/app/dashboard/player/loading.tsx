export default function PlayerDashboardLoading() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      <div className="h-8 w-64 bg-surface-container-high rounded" />
      <div className="h-12 w-96 bg-surface-container-high rounded" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="h-48 bg-surface-container-low rounded-xl" />
        <div className="h-48 bg-surface-container-low rounded-xl" />
        <div className="h-48 bg-surface-container-low rounded-xl" />
      </div>
      <div className="h-64 bg-surface-container-low rounded-xl" />
    </div>
  );
}

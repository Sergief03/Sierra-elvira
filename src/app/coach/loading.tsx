export default function CoachDashboardLoading() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      <div className="h-8 w-64 rounded bg-surface-container-high" />
      <div className="h-4 w-80 rounded bg-surface-container-high" />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-md">
        <div className="lg:col-span-4 flex flex-col gap-md">
          <div className="h-72 rounded-lg bg-surface-container-high" />
          <div className="h-48 rounded-lg bg-surface-container-high" />
        </div>
        <div className="lg:col-span-8 flex flex-col gap-md">
          <div className="h-64 rounded-lg bg-surface-container-high" />
          <div className="h-48 rounded-lg bg-surface-container-high" />
        </div>
      </div>
    </div>
  );
}

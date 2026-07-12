export default function CoachMatchesLoading() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      <div className="h-8 w-40 rounded bg-surface-container-high" />
      <div className="h-4 w-64 rounded bg-surface-container-high" />
      <div className="flex gap-2">
        <div className="h-8 w-24 rounded-lg bg-surface-container-high" />
        <div className="h-8 w-24 rounded-lg bg-surface-container-high" />
        <div className="h-8 w-24 rounded-lg bg-surface-container-high" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-24 rounded-xl bg-surface-container-high" />
        ))}
      </div>
    </div>
  );
}

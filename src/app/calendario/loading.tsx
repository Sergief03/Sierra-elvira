export default function CalendarioLoading() {
  return (
    <div className="min-h-screen bg-background animate-pulse">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <div className="h-10 w-64 mx-auto rounded bg-surface-container-high mb-4" />
          <div className="h-5 w-96 mx-auto rounded bg-surface-container-high" />
        </div>
        <div className="card-bg border border-solid card-border rounded-xl p-md mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
            <div className="h-20 rounded-lg bg-surface-container-high" />
            <div className="h-20 rounded-lg bg-surface-container-high" />
            <div className="h-20 rounded-lg bg-surface-container-high" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-64 rounded-xl bg-surface-container-high" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function MatchDetailLoading() {
  return (
    <div className="max-w-5xl mx-auto animate-pulse">
      <div className="h-5 w-40 rounded bg-surface-container-high mb-4" />
      <div className="card-bg border border-solid card-border rounded-xl p-md mb-6">
        <div className="h-6 w-24 rounded bg-surface-container-high mb-3" />
        <div className="h-8 w-96 rounded bg-surface-container-high mb-4" />
        <div className="h-5 w-64 rounded bg-surface-container-high" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        <div className="lg:col-span-5 h-80 rounded-xl bg-surface-container-high" />
        <div className="lg:col-span-2 h-80 rounded-xl bg-surface-container-high" />
        <div className="lg:col-span-5 h-80 rounded-xl bg-surface-container-high" />
      </div>
    </div>
  );
}

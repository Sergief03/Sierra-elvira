export default function TeamDetailLoading() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      <div className="h-8 w-64 bg-surface-container-high rounded" />
      <div className="flex gap-4">
        <div className="h-10 w-40 bg-surface-container-high rounded-lg" />
        <div className="h-10 w-40 bg-surface-container-high rounded-lg" />
      </div>
      <div className="h-64 bg-surface-container-low rounded-xl" />
      <div className="h-80 bg-surface-container-low rounded-xl" />
    </div>
  );
}

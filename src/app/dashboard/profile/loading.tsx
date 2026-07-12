export default function ProfileLoading() {
  return (
    <div className="flex flex-col gap-6 max-w-4xl animate-pulse">
      <div className="h-8 w-32 rounded bg-surface-container-high" />
      <div className="h-4 w-56 rounded bg-surface-container-high" />
      <div className="grid grid-cols-1 md:grid-cols-12 gap-md">
        <div className="md:col-span-4 h-72 rounded-xl bg-surface-container-high" />
        <div className="md:col-span-8 h-72 rounded-xl bg-surface-container-high" />
      </div>
    </div>
  );
}

export default function AdminUsersLoading() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      <div className="h-8 w-64 bg-surface-container-high rounded" />
      <div className="h-64 bg-surface-container-low rounded-xl" />
    </div>
  );
}

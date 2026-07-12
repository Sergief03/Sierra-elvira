export default function LoadingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
        <p className="font-sans text-body-md text-on-surface-variant">Cargando...</p>
      </div>
    </div>
  );
}

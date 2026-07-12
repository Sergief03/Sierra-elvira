"use client";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background px-4">
      <span className="material-symbols-outlined text-6xl text-error">error</span>
      <h1 className="font-display text-headline-lg text-on-surface">Algo salió mal</h1>
      <p className="font-sans text-body-md text-on-surface-variant text-center max-w-[28rem]">
        Ha ocurrido un error inesperado. Por favor, intenta de nuevo.
      </p>
      <button
        onClick={reset}
        className="px-6 py-2 bg-primary text-on-primary font-sans text-label-bold rounded-lg hover:bg-primary-container hover:text-on-primary-container transition-all active:scale-[0.98]"
      >
        Reintentar
      </button>
    </div>
  );
}

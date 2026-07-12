import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background px-4">
      <span className="material-symbols-outlined text-6xl text-outline">search_off</span>
      <h1 className="font-display text-headline-lg text-on-surface">Página no encontrada</h1>
      <p className="font-sans text-body-md text-on-surface-variant text-center max-w-[28rem]">
        La página que buscas no existe o ha sido movida.
      </p>
      <Link
        href="/dashboard"
        className="px-6 py-2 bg-primary text-on-primary font-sans text-label-bold rounded-lg hover:bg-primary-container hover:text-on-primary-container transition-all active:scale-[0.98]"
      >
        Volver al inicio
      </Link>
    </div>
  );
}

import Link from "next/link";

export default function HomePage() {
  return (
    <div id="main-content" className="min-h-screen flex flex-col items-center justify-center bg-background px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-surface-container-low/50 to-background pointer-events-none" />
      <div className="relative flex flex-col items-center gap-8 text-center max-w-[32rem]">
        <div className="w-24 h-24 rounded-full bg-primary-container/20 border border-primary/30 flex items-center justify-center">
          <span className="material-symbols-outlined text-5xl text-primary">sports_volleyball</span>
        </div>
        <div>
          <h1 className="font-display text-display-xl text-primary mb-2">Sierra Elvira</h1>
          <p className="text-body-lg text-on-surface-variant">Club de Voleibol</p>
        </div>
        <p className="text-body-md text-on-surface-variant max-w-[28rem]">
          Sistema de gestión deportiva — equipos, pagos, convocatorias y marcador en vivo.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link
            href="/calendario"
            className="flex-1 sm:flex-none inline-flex items-center justify-center px-8 py-3 bg-primary text-on-primary font-label-bold text-label-bold rounded-lg hover:bg-primary-container hover:text-on-primary-container transition-all active:scale-[0.98]"
          >
            <span className="material-symbols-outlined mr-2">calendar_month</span>
            Calendario de Partidos
          </Link>
          <Link
            href="/login"
            className="flex-1 sm:flex-none inline-flex items-center justify-center px-8 py-3 border-2 border-primary text-primary font-label-bold text-label-bold rounded-lg hover:bg-primary/10 transition-all active:scale-[0.98]"
          >
            Iniciar Sesión
          </Link>
          <Link
            href="/register"
            className="flex-1 sm:flex-none inline-flex items-center justify-center px-8 py-3 border-2 border-primary text-primary font-label-bold text-label-bold rounded-lg hover:bg-primary/10 transition-all active:scale-[0.98]"
          >
            Registrarse
          </Link>
        </div>
      </div>
    </div>
  );
}

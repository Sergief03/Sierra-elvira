import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div id="main-content" className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-[28rem] bg-surface-container-low border border-outline-variant rounded-xl p-md flex flex-col gap-md">
        <div className="flex flex-col items-center gap-sm">
          <div className="w-16 h-16 rounded-full bg-surface-container-high border border-outline-variant flex items-center justify-center">
            <span className="material-symbols-outlined text-4xl text-primary">sports_volleyball</span>
          </div>
          <div className="text-center">
            <h1 className="font-display text-headline-lg text-primary">Sierra Elvira</h1>
            <p className="font-sans text-label-sm text-on-surface-variant">Volleyball Club</p>
          </div>
        </div>
        <div className="border-t border-outline-variant" />
        <div>
          <p className="font-sans text-body-md text-on-surface text-center mb-md">Inicia sesión en tu cuenta</p>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}

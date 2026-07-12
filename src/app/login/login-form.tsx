"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast } from "sonner";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Credenciales inválidas. Intenta de nuevo.");
      toast.error("Credenciales inválidas");
      setPending(false);
      return;
    }

    toast.success("Sesión iniciada");
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {error && (
        <div className="p-3 rounded bg-error-container/20 border border-error/30 text-error font-sans text-body-md flex items-center gap-2" role="alert">
          <span className="material-symbols-outlined text-[20px]">error</span>
          {error}
        </div>
      )}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="font-sans text-label-bold text-on-surface">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="tu@email.com"
          className="w-full bg-surface border border-outline-variant rounded-lg px-sm py-sm text-on-surface font-sans text-body-md placeholder:text-on-surface-variant/50 focus:border-primary focus:shadow-[0_0_4px_#ff7a21] outline-none transition-all"
          aria-label="Email"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="font-sans text-label-bold text-on-surface">
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          placeholder="••••••••"
          className="w-full bg-surface border border-outline-variant rounded-lg px-sm py-sm text-on-surface font-sans text-body-md placeholder:text-on-surface-variant/50 focus:border-primary focus:shadow-[0_0_4px_#ff7a21] outline-none transition-all"
          aria-label="Contraseña"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        aria-busy={pending}
        className="w-full py-sm bg-primary text-on-primary font-sans text-label-bold rounded-lg hover:bg-primary-container hover:text-on-primary-container transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {pending ? "Entrando..." : "Iniciar Sesión"}
      </button>
      <p className="text-center font-sans text-body-md text-on-surface-variant">
        ¿No tienes cuenta?{" "}
        <a href="/register" className="text-primary font-sans text-label-bold hover:underline">
          Regístrate
        </a>
      </p>
    </form>
  );
}

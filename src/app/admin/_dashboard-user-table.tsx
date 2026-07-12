"use client";

import { useState, useActionState } from "react";
import { createUser, updateUser, deleteUser } from "@/actions/user.actions";
import { useRouter } from "next/navigation";
import { getRoleLabel } from "@/lib/utils";
import { toast } from "sonner";

interface DashboardUser {
  id: string;
  name: string;
  email: string;
  role: string;
  teamName: string | null;
  paidThisMonth: boolean;
}

const PAGE_SIZE = 10;

export function DashboardUserTable({ users }: { users: DashboardUser[] }) {
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const router = useRouter();

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function refresh() {
    setShowCreate(false);
    setEditingId(null);
    setPage(1);
    router.refresh();
  }

  async function handleDelete(u: DashboardUser) {
    if (!confirm(`¿Eliminar a ${u.name}?`)) return;
    try {
      await deleteUser(u.id);
      toast.success(`Usuario ${u.name} eliminado`);
      refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al eliminar usuario");
    }
  }

  return (
    <div className="card-bg border border-solid card-border rounded-lg flex flex-col overflow-hidden">
      <div className="p-md flex flex-col md:flex-row justify-between items-start md:items-center gap-md border-b border-outline-variant">
        <div>
          <h3 className="font-display text-headline-md text-on-surface">Gestión de Usuarios</h3>
          <p className="font-sans text-label-sm text-on-surface-variant">Administra jugadores, entrenadores y personal del club.</p>
        </div>
        <div className="flex items-center gap-sm w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full bg-surface border border-outline-variant rounded pl-10 pr-sm py-sm text-on-surface font-sans text-body-md focus:border-primary focus:ring-0 focus:shadow-[0_0_4px_#ff7a21] outline-none transition-shadow"
              placeholder="Buscar usuarios..."
            />
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="bg-primary text-black font-sans text-label-bold px-md py-sm rounded tracking-wide hover:bg-primary-container transition-colors flex items-center gap-xs whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Añadir Usuario
          </button>
        </div>
      </div>

      {showCreate && (
        <div className="p-md border-b border-outline-variant">
          <CreateUserForm onClose={refresh} />
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-outline-variant bg-surface-container-lowest">
              <th className="py-sm px-md font-sans text-label-sm text-on-surface-variant uppercase tracking-wider font-bold">Nombre</th>
              <th className="py-sm px-md font-sans text-label-sm text-on-surface-variant uppercase tracking-wider font-bold">Rol</th>
              <th className="py-sm px-md font-sans text-label-sm text-on-surface-variant uppercase tracking-wider font-bold">Equipo / Asignación</th>
              <th className="py-sm px-md font-sans text-label-sm text-on-surface-variant uppercase tracking-wider font-bold">Estado</th>
              <th className="py-sm px-md font-sans text-label-sm text-on-surface-variant uppercase tracking-wider font-bold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {paginated.length === 0 && (
              <tr>
                <td colSpan={5} className="p-md text-center">
                  <div className="flex flex-col items-center gap-2 py-4">
                    <span className="material-symbols-outlined text-4xl text-outline">person_search</span>
                    <p className="font-sans text-body-md text-on-surface-variant">No se encontraron usuarios.</p>
                    <p className="font-sans text-label-sm text-on-surface-variant">Prueba con otros términos de búsqueda.</p>
                  </div>
                </td>
              </tr>
            )}
            {paginated.map((u) => (
              <tr key={u.id} className="hover:bg-surface-container-high transition-colors group cursor-default">
                {editingId === u.id ? (
                  <td colSpan={5} className="p-3">
                    <EditUserForm
                      user={u}
                      onClose={() => { setEditingId(null); router.refresh(); }}
                    />
                  </td>
                ) : (
                  <>
                    <td className="py-sm px-md">
                      <div className="flex items-center gap-sm">
                        <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center font-sans text-label-bold text-on-surface" aria-hidden="true">
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-sans text-label-bold text-on-surface group-hover:text-primary transition-colors">{u.name}</p>
                          <p className="font-sans text-label-sm text-on-surface-variant">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-sm px-md">
                      <span className={`inline-block px-xs py-[2px] rounded text-[11px] font-bold tracking-wide uppercase ${
                        u.role === "SUPER_ADMIN" ? "border border-outline-variant text-on-surface-variant" :
                        u.role === "COACH" ? "bg-secondary-container text-on-surface" :
                        "bg-primary-container/20 text-primary"
                      }`}>
                        {getRoleLabel(u.role)}
                      </span>
                    </td>
                    <td className="py-sm px-md font-sans text-body-md text-on-surface">
                      {u.role === "SUPER_ADMIN" ? (
                        <span className="italic text-on-surface-variant">Acceso Global</span>
                      ) : (
                        u.teamName ?? <span className="italic text-on-surface-variant">Sin equipo</span>
                      )}
                    </td>
                    <td className="py-sm px-md">
                      {u.role === "PLAYER" && !u.paidThisMonth ? (
                        <span className="inline-block px-sm py-[2px] rounded-full text-[12px] font-bold bg-[#FF4B4B]/20 text-[#FF4B4B]">Impago</span>
                      ) : (
                        <span className="inline-block px-sm py-[2px] rounded-full text-[12px] font-bold bg-[#2DFF8E]/20 text-[#2DFF8E]">Activo</span>
                      )}
                    </td>
                    <td className="py-sm px-md text-right">
                      <button
                        onClick={() => setEditingId(u.id)}
                        className="text-on-surface-variant hover:text-primary transition-colors p-xs"
                        aria-label={`Editar ${u.name}`}
                      >
                        <span className="material-symbols-outlined text-[20px]">edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(u)}
                        className="text-on-surface-variant hover:text-error transition-colors p-xs"
                        aria-label={`Eliminar ${u.name}`}
                      >
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="p-sm border-t border-outline-variant flex justify-between items-center bg-surface-container-lowest">
          <span className="font-sans text-label-sm text-on-surface-variant">
            Mostrando {(page - 1) * PAGE_SIZE + 1} a {Math.min(page * PAGE_SIZE, filtered.length)} de {filtered.length} usuarios
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1 rounded text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[20px]">chevron_left</span>
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 rounded font-sans text-label-bold flex items-center justify-center transition-colors ${
                  p === page ? "bg-primary/20 text-primary" : "hover:bg-surface-container-high text-on-surface"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1 rounded text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[20px]">chevron_right</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function CreateUserForm({ onClose }: { onClose: () => void }) {
  const [state, formAction, pending] = useActionState(
    async (_prev: unknown, formData: FormData) => {
      try {
        await createUser(formData);
        toast.success("Usuario creado con éxito");
        onClose();
        return { success: true };
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Error al crear usuario");
        return { success: false, error: e instanceof Error ? e.message : "Error al crear usuario" };
      }
    },
    { success: false },
  );

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <input name="name" type="text" required placeholder="Nombre" className="bg-surface border border-outline-variant rounded px-sm py-sm text-on-surface font-sans text-body-md focus:border-primary focus:shadow-[0_0_4px_#ff7a21] outline-none transition-shadow" aria-label="Nombre" />
        <input name="email" type="email" required placeholder="Email" className="bg-surface border border-outline-variant rounded px-sm py-sm text-on-surface font-sans text-body-md focus:border-primary focus:shadow-[0_0_4px_#ff7a21] outline-none transition-shadow" aria-label="Email" />
        <input name="password" type="password" required minLength={6} placeholder="Contraseña" className="bg-surface border border-outline-variant rounded px-sm py-sm text-on-surface font-sans text-body-md focus:border-primary focus:shadow-[0_0_4px_#ff7a21] outline-none transition-shadow" aria-label="Contraseña" />
        <select name="role" required className="bg-surface border border-outline-variant rounded px-sm py-sm text-on-surface font-sans text-body-md focus:border-primary focus:shadow-[0_0_4px_#ff7a21] outline-none transition-shadow" aria-label="Rol">
          <option value="PLAYER">Jugador</option>
          <option value="COACH">Entrenador</option>
          <option value="SUPER_ADMIN">Admin</option>
        </select>
      </div>
      {state && typeof state === "object" && "error" in state && (state as { error: string }).error && (
        <div className="p-3 rounded-md bg-error-container/20 border border-error/30 text-error text-sm" role="alert">{(state as { error: string }).error}</div>
      )}
      <div className="flex gap-2">
        <button type="submit" disabled={pending}
          className="bg-primary text-on-primary font-sans text-label-bold px-md py-sm rounded-lg hover:bg-primary-container hover:text-on-primary-container transition-all disabled:opacity-50" aria-busy={pending}>
          {pending ? "..." : "Crear Usuario"}
        </button>
        <button type="button" onClick={onClose}
          className="border border-outline text-on-surface-variant font-sans text-label-bold px-md py-sm rounded-lg hover:bg-surface-container-high transition-colors">
          Cancelar
        </button>
      </div>
    </form>
  );
}

function EditUserForm({ user, onClose }: { user: DashboardUser; onClose: () => void }) {
  const [state, formAction, pending] = useActionState(
    async (_prev: unknown, formData: FormData) => {
      try {
        await updateUser(user.id, formData);
        toast.success("Usuario actualizado");
        onClose();
        return { success: true };
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Error al actualizar usuario");
        return { success: false, error: e instanceof Error ? e.message : "Error al actualizar usuario" };
      }
    },
    { success: false },
  );

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <input name="name" type="text" defaultValue={user.name} required className="bg-surface border border-outline-variant rounded px-sm py-sm text-on-surface font-sans text-body-md focus:border-primary focus:shadow-[0_0_4px_#ff7a21] outline-none transition-shadow" aria-label="Nombre" />
        <select name="role" defaultValue={user.role} className="bg-surface border border-outline-variant rounded px-sm py-sm text-on-surface font-sans text-body-md focus:border-primary focus:shadow-[0_0_4px_#ff7a21] outline-none transition-shadow" aria-label="Rol">
          <option value="PLAYER">Jugador</option>
          <option value="COACH">Entrenador</option>
          <option value="SUPER_ADMIN">Admin</option>
        </select>
        <input name="password" type="password" minLength={6} placeholder="Nueva contraseña (opcional)" className="bg-surface border border-outline-variant rounded px-sm py-sm text-on-surface font-sans text-body-md focus:border-primary focus:shadow-[0_0_4px_#ff7a21] outline-none transition-shadow" aria-label="Nueva contraseña" />
      </div>
      {state && typeof state === "object" && "error" in state && (state as { error: string }).error && (
        <div className="p-3 rounded-md bg-error-container/20 border border-error/30 text-error text-sm" role="alert">{(state as { error: string }).error}</div>
      )}
      <div className="flex gap-2">
        <button type="submit" disabled={pending}
          className="bg-primary text-on-primary font-sans text-label-bold px-md py-sm rounded-lg hover:bg-primary-container hover:text-on-primary-container transition-all disabled:opacity-50" aria-busy={pending}>
          {pending ? "..." : "Guardar"}
        </button>
        <button type="button" onClick={onClose}
          className="border border-outline text-on-surface-variant font-sans text-label-bold px-md py-sm rounded-lg hover:bg-surface-container-high transition-colors">
          Cancel
        </button>
      </div>
    </form>
  );
}

"use client";

import { useState, useActionState } from "react";
import { createUser, updateUser, deleteUser } from "@/actions/user.actions";
import { useRouter } from "next/navigation";
import { getRoleLabel } from "@/lib/utils";
import { toast } from "sonner";

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  teamsCount: number;
  createdAt: string;
}

export function UserManagementClient({ users }: { users: UserItem[] }) {
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const router = useRouter();

  async function handleDelete(user: UserItem) {
    if (!confirm(`¿Eliminar a ${user.name}?`)) return;
    try {
      await deleteUser(user.id);
      toast.success(`Usuario ${user.name} eliminado`);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al eliminar usuario");
    }
  }

  return (
    <div className="flex flex-col gap-4 mt-4">
      <button
        onClick={() => setShowCreate(true)}
        className="self-end flex items-center gap-2 bg-primary text-on-primary font-sans text-label-bold px-md py-sm rounded-lg hover:bg-primary-container hover:text-on-primary-container transition-all"
      >
        <span className="material-symbols-outlined text-[18px]">add</span>
        Nuevo Usuario
      </button>

      {showCreate && (
        <CreateUserForm onClose={() => { setShowCreate(false); router.refresh(); }} />
      )}

      <div className="bg-surface-container-low border border-outline-variant rounded-lg overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b border-outline-variant bg-surface-container-highest">
              <th className="text-left p-3 font-sans text-label-bold text-on-surface-variant uppercase tracking-wider">Nombre</th>
              <th className="text-left p-3 font-sans text-label-bold text-on-surface-variant uppercase tracking-wider">Email</th>
              <th className="text-left p-3 font-sans text-label-bold text-on-surface-variant uppercase tracking-wider">Rol</th>
              <th className="text-center p-3 font-sans text-label-bold text-on-surface-variant uppercase tracking-wider">Equipos</th>
              <th className="text-right p-3 font-sans text-label-bold text-on-surface-variant uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-surface-container-high transition-colors">
                {editingId === u.id ? (
                  <td colSpan={5} className="p-3">
                    <EditUserForm
                      user={u}
                      onClose={() => { setEditingId(null); router.refresh(); }}
                    />
                  </td>
                ) : (
                  <>
                    <td className="p-3">
                      <div className="flex items-center gap-sm">
                        <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center font-sans text-label-bold text-on-secondary-container" aria-hidden="true">
                          {u.name?.charAt(0)}
                        </div>
                        <span className="font-sans text-body-md text-on-surface">{u.name}</span>
                      </div>
                    </td>
                    <td className="p-3 font-sans text-body-md text-on-surface-variant">{u.email}</td>
                    <td className="p-3">
                      <span className={`inline-block px-xs py-[2px] rounded text-[11px] font-bold tracking-wide uppercase ${
                        u.role === "SUPER_ADMIN" ? "border border-outline-variant text-on-surface-variant" :
                        u.role === "COACH" ? "bg-secondary-container text-on-surface" :
                        "chip-primary"
                      }`}>
                        {getRoleLabel(u.role)}
                      </span>
                    </td>
                    <td className="p-3 text-center font-sans text-body-md text-on-surface-variant">{u.teamsCount}</td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => setEditingId(u.id)}
                        className="text-on-surface-variant hover:text-primary transition-colors p-xs"
                        aria-label={`Editar ${u.name}`}
                      >
                        <span className="material-symbols-outlined text-[20px]">edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(u)}
                        className="text-on-surface-variant hover:text-danger transition-colors p-xs"
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
    { success: false }
  );

  return (
    <form action={formAction} className="bg-surface-container-low border border-outline-variant rounded-lg p-md flex flex-col gap-3">
      <h3 className="font-display text-headline-md text-on-surface">Nuevo Usuario</h3>
      <div className="grid grid-cols-2 gap-3">
        <input name="name" type="text" required placeholder="Nombre" className="input-field text-body-md" aria-label="Nombre" />
        <input name="email" type="email" required placeholder="Email" className="input-field text-body-md" aria-label="Email" />
        <input name="password" type="password" required minLength={6} placeholder="Contraseña" className="input-field text-body-md" aria-label="Contraseña" />
        <select name="role" required className="input-field text-body-md" aria-label="Rol">
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
          {pending ? "..." : "Crear"}
        </button>
        <button type="button" onClick={onClose}
          className="border border-outline text-on-surface-variant font-sans text-label-bold px-md py-sm rounded-lg hover:bg-surface-container-high transition-colors">
          Cancelar
        </button>
      </div>
    </form>
  );
}

function EditUserForm({ user, onClose }: { user: UserItem; onClose: () => void }) {
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
    { success: false }
  );

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="grid grid-cols-3 gap-3">
        <input name="name" type="text" defaultValue={user.name} required className="input-field text-body-md" aria-label="Nombre" />
        <select name="role" defaultValue={user.role} className="input-field text-body-md" aria-label="Rol">
          <option value="PLAYER">Jugador</option>
          <option value="COACH">Entrenador</option>
          <option value="SUPER_ADMIN">Admin</option>
        </select>
        <input name="password" type="password" minLength={6} placeholder="Nueva contraseña (opcional)" className="input-field text-body-md" aria-label="Nueva contraseña" />
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
          Cancelar
        </button>
      </div>
    </form>
  );
}

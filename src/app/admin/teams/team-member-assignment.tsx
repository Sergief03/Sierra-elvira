"use client";

import { useRouter } from "next/navigation";
import { assignTeamMember, removeTeamMember } from "@/actions/team.actions";
import { getRoleLabel } from "@/lib/utils";
import { useState } from "react";
import { toast } from "sonner";

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
}

export function TeamMemberAssignment({
  teamId,
  allUsers,
}: {
  teamId: string;
  allUsers: UserItem[];
}) {
  const router = useRouter();
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedRole, setSelectedRole] = useState("PLAYER");
  const [assigning, setAssigning] = useState(false);

  async function handleAssign() {
    if (!selectedUser) return;
    setAssigning(true);
    try {
      await assignTeamMember(teamId, selectedUser, selectedRole);
      toast.success("Miembro asignado al equipo");
      setSelectedUser("");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al asignar miembro");
    } finally {
      setAssigning(false);
    }
  }

  async function handleRemove(userId: string) {
    try {
      await removeTeamMember(teamId, userId);
      toast.success("Miembro removido del equipo");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al remover miembro");
    }
  }

  return (
    <div className="flex gap-2">
      <select
        value={selectedUser}
        onChange={(e) => setSelectedUser(e.target.value)}
        className="input-field flex-1"
        aria-label="Seleccionar usuario"
      >
        <option value="">Seleccionar usuario...</option>
        {allUsers.map((u) => (
          <option key={u.id} value={u.id}>
            {u.name} ({getRoleLabel(u.role)})
          </option>
        ))}
      </select>
      <select
        value={selectedRole}
        onChange={(e) => setSelectedRole(e.target.value)}
        className="input-field w-40"
        aria-label="Rol en el equipo"
      >
        <option value="PLAYER">Jugador</option>
        <option value="MAIN_COACH">Coach Principal</option>
        <option value="SEC_COACH">Coach Secundario</option>
      </select>
      <button
        onClick={handleAssign}
        disabled={!selectedUser || assigning}
        className="px-4 py-2 bg-primary-container text-on-primary-container font-label-bold rounded-md hover:opacity-90 disabled:opacity-50 transition-all"
      >
        {assigning ? "..." : "Asignar"}
      </button>
    </div>
  );
}

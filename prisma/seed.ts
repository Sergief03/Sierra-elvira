import { PrismaClient, Role, TeamRole, MatchStatus } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed...");

  const hash = await bcrypt.hash("Admin123!", 12);
  const coachHash = await bcrypt.hash("Coach123!", 12);
  const playerHash = await bcrypt.hash("Player123!", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@sierraelvira.es" },
    update: {},
    create: {
      email: "admin@sierraelvira.es",
      password: hash,
      name: "Admin Sierra Elvira",
      role: Role.SUPER_ADMIN,
    },
  });
  console.log(`  ✅ Admin: ${admin.name}`);

  const coach1 = await prisma.user.upsert({
    where: { email: "coach1@sierraelvira.es" },
    update: {},
    create: {
      email: "coach1@sierraelvira.es",
      password: coachHash,
      name: "Carlos Ruiz",
      role: Role.COACH,
    },
  });

  const coach2 = await prisma.user.upsert({
    where: { email: "coach2@sierraelvira.es" },
    update: {},
    create: {
      email: "coach2@sierraelvira.es",
      password: coachHash,
      name: "María López",
      role: Role.COACH,
    },
  });
  console.log(`  ✅ Coaches: ${coach1.name}, ${coach2.name}`);

  const seniorTeam = await prisma.team.upsert({
    where: { name: "Senior Masculino" },
    update: {},
    create: { name: "Senior Masculino", category: "Senior Masculino" },
  });

  const juvenilTeam = await prisma.team.upsert({
    where: { name: "Juvenil Femenino" },
    update: {},
    create: { name: "Juvenil Femenino", category: "Juvenil Femenino" },
  });
  console.log(`  ✅ Equipos: ${seniorTeam.name}, ${juvenilTeam.name}`);

  await prisma.teamMember.upsert({
    where: { userId_teamId: { userId: coach1.id, teamId: seniorTeam.id } },
    update: { roleInTeam: TeamRole.MAIN_COACH },
    create: {
      userId: coach1.id,
      teamId: seniorTeam.id,
      roleInTeam: TeamRole.MAIN_COACH,
    },
  });

  await prisma.teamMember.upsert({
    where: { userId_teamId: { userId: coach2.id, teamId: juvenilTeam.id } },
    update: { roleInTeam: TeamRole.MAIN_COACH },
    create: {
      userId: coach2.id,
      teamId: juvenilTeam.id,
      roleInTeam: TeamRole.MAIN_COACH,
    },
  });

  await prisma.teamMember.upsert({
    where: { userId_teamId: { userId: coach1.id, teamId: juvenilTeam.id } },
    update: { roleInTeam: TeamRole.SEC_COACH },
    create: {
      userId: coach1.id,
      teamId: juvenilTeam.id,
      roleInTeam: TeamRole.SEC_COACH,
    },
  });
  console.log("  ✅ Asignaciones de coaches");

  const seniorNames = [
    "Alejandro García",
    "Daniel Martínez",
    "Javier Rodríguez",
    "Pablo Sánchez",
    "Miguel Ángel Pérez",
  ];
  const juvenilNames = [
    "Laura Fernández",
    "Cristina Gómez",
    "Ana Jiménez",
    "Sara Díaz",
    "Elena Torres",
  ];

  const seniorPlayers: { id: string; name: string }[] = [];
  for (const name of seniorNames) {
    const email = `${name.toLowerCase().replace(/\s+/g, ".")}@sierraelvira.es`;
    const player = await prisma.user.upsert({
      where: { email },
      update: {},
      create: { email, password: playerHash, name, role: Role.PLAYER },
    });
    seniorPlayers.push(player);
    await prisma.teamMember.upsert({
      where: { userId_teamId: { userId: player.id, teamId: seniorTeam.id } },
      update: {},
      create: { userId: player.id, teamId: seniorTeam.id, roleInTeam: TeamRole.PLAYER },
    });
  }

  const juvenilPlayers: { id: string; name: string }[] = [];
  for (const name of juvenilNames) {
    const email = `${name.toLowerCase().replace(/\s+/g, ".")}@sierraelvira.es`;
    const player = await prisma.user.upsert({
      where: { email },
      update: {},
      create: { email, password: playerHash, name, role: Role.PLAYER },
    });
    juvenilPlayers.push(player);
    await prisma.teamMember.upsert({
      where: { userId_teamId: { userId: player.id, teamId: juvenilTeam.id } },
      update: {},
      create: { userId: player.id, teamId: juvenilTeam.id, roleInTeam: TeamRole.PLAYER },
    });
  }
  console.log("  ✅ 10 jugadores creados y asignados");

  const months = ["Enero 2026", "Febrero 2026", "Marzo 2026", "Abril 2026", "Mayo 2026"];
  for (const player of seniorPlayers.slice(0, 3)) {
    for (const month of months) {
      await prisma.payment.create({
        data: {
          playerId: player.id,
          coachId: coach1.id,
          amount: 30,
          month,
          paidAt: new Date(2026, months.indexOf(month), 15),
        },
      });
    }
  }
  console.log("  ✅ Pagos históricos creados");

  const match1 = await prisma.match.create({
    data: {
      teamId: seniorTeam.id,
      opponent: "CV Almería",
      date: new Date(2026, 8, 15, 18, 0),
      location: "Pabellón Municipal Sierra Elvira",
      status: MatchStatus.SCHEDULED,
    },
  });

  const match2 = await prisma.match.create({
    data: {
      teamId: seniorTeam.id,
      opponent: "CD Universidad Granada",
      date: new Date(2026, 10, 20, 17, 30),
      location: "Pabellón Núñez Blanca",
      status: MatchStatus.COMPLETED,
      currentSet: 5,
      ourTotalSets: 3,
      oppTotalSets: 1,
    },
  });

  const match2Sets = [
    { setNumber: 1, ourPoints: 25, oppPoints: 18 },
    { setNumber: 2, ourPoints: 22, oppPoints: 25 },
    { setNumber: 3, ourPoints: 25, oppPoints: 20 },
    { setNumber: 4, ourPoints: 25, oppPoints: 15 },
  ];
  for (const s of match2Sets) {
    await prisma.matchSet.create({
      data: { matchId: match2.id, ...s },
    });
  }

  const match3 = await prisma.match.create({
    data: {
      teamId: seniorTeam.id,
      opponent: "CV Málaga",
      date: new Date(2026, 11, 5, 16, 0),
      location: "Pabellón Los Guindos",
      status: MatchStatus.LIVE,
      currentSet: 2,
      ourTotalSets: 1,
      oppTotalSets: 0,
    },
  });

  await prisma.matchSet.create({
    data: { matchId: match3.id, setNumber: 1, ourPoints: 25, oppPoints: 22 },
  });
  await prisma.matchSet.create({
    data: { matchId: match3.id, setNumber: 2, ourPoints: 7, oppPoints: 3 },
  });

  for (const player of seniorPlayers) {
    await prisma.roster.create({
      data: { matchId: match3.id, playerId: player.id },
    });
  }
  console.log("  ✅ 3 partidos creados (SCHEDULED, COMPLETED, LIVE)");

  await prisma.announcement.create({
    data: {
      title: "Bienvenidos al Club",
      content: "¡Iniciamos una nueva temporada! Recordad que las mensualidades se pagan antes del día 10 de cada mes.",
    },
  });

  await prisma.announcement.create({
    data: {
      title: "Entrenamiento especial Senior",
      content: "El próximo jueves 20 de julio hay sesión de vídeo y táctica a las 19:00.",
      targetTeamId: seniorTeam.id,
    },
  });
  console.log("  ✅ Comunicados creados");

  console.log("\n🎉 Seed completado con éxito!");
  console.log("\n📧 Credenciales de prueba:");
  console.log("   Admin:    admin@sierraelvira.es / Admin123!");
  console.log("   Coach 1:  coach1@sierraelvira.es / Coach123!");
  console.log("   Coach 2:  coach2@sierraelvira.es / Coach123!");
  console.log("   Player 1: alejandro.garcia@sierraelvira.es / Player123!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

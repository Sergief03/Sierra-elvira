import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const role = session.user.role;

  if (role === "PLAYER") redirect("/dashboard/player");
  if (role === "COACH") redirect("/coach");
  if (role === "SUPER_ADMIN") redirect("/admin");

  redirect("/login");
}

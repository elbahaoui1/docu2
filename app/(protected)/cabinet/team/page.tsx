import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/prisma/client";
import TeamClient from "./teamClient";

export default async function TeamPage() {
  const session: any = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (session.user?.accountType !== "CABINET") redirect("/dashboard");

  const cabinetId = session.user?.cabinetId as string;
  const isAdmin = session.user?.role === "ADMIN";

  const rawMembers = await prisma.user.findMany({
    where: { cabinetId },
    select: { id: true, email: true, role: true },
    orderBy: { email: "asc" }
  });

  const members = rawMembers.map((m) => ({
    id: m.id,
    email: m.email,
    role: (m.role || "MEMBER") as "ADMIN" | "MEMBER",
  }));

  return <TeamClient currentUserId={session.user.id} isAdmin={isAdmin} members={members} cabinetId={cabinetId} />;
}



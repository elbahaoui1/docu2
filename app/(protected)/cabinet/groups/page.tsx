import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/prisma/client";
import GroupsClient from "./groupsClient";

export default async function GroupsPage() {
  const session: any = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (session.user?.accountType !== "CABINET") redirect("/dashboard");

  const cabinetId = session.user?.cabinetId as string;
  const isAdmin = session.user?.role === "ADMIN";

  const groups = await prisma.group.findMany({
    where: isAdmin ? { cabinetId } : { cabinetId, members: { some: { userId: session.user.id } } },
    orderBy: { name: "asc" },
    include: { members: { include: { user: { select: { id: true, email: true } } } } }
  });

  const users = isAdmin
    ? await prisma.user.findMany({ where: { cabinetId }, select: { id: true, email: true }, orderBy: { email: "asc" } })
    : [];

  return <GroupsClient isAdmin={isAdmin} cabinetId={cabinetId} groups={groups} users={users} />;
}



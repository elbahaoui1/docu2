import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import CabinetInvitationsClient from "./CabinetInvitationsClient";

export default async function CabinetInvitationsPage() {
  const session: any = await getServerSession(authOptions);
  if (!session) redirect("/login");
  const isAdmin = session.user?.accountType === "CABINET" && session.user?.role === "ADMIN";
  if (!isAdmin) redirect("/dashboard");
  const cabinetId = session.user?.cabinetId as string;
  return <CabinetInvitationsClient cabinetId={cabinetId} />;
}



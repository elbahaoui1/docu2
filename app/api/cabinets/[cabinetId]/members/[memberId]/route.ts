import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { prisma } from "@/prisma/client";

export async function DELETE(_req: Request, { params }: { params: { cabinetId: string; memberId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.accountType !== "CABINET" || session.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }
  if (session.user.cabinetId !== params.cabinetId) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }
  if (params.memberId === session.user.id) {
    return NextResponse.json({ message: "You cannot remove yourself" }, { status: 400 });
  }

  const target = await prisma.user.findUnique({ where: { id: params.memberId } });
  if (!target || target.cabinetId !== params.cabinetId) {
    return NextResponse.json({ message: "Member not found" }, { status: 404 });
  }

  await prisma.user.update({ where: { id: params.memberId }, data: { cabinetId: null } });
  return NextResponse.json({ message: "Member removed" }, { status: 200 });
}



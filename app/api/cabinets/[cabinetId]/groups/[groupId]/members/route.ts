import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { prisma } from "@/prisma/client";

export async function POST(req: Request, { params }: { params: { cabinetId: string; groupId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.accountType !== "CABINET" || session.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }
  if (session.user.cabinetId !== params.cabinetId) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { userId } = await req.json();
  if (!userId) return NextResponse.json({ message: "userId is required" }, { status: 400 });

  // Ensure group belongs to cabinet and user too
  const [group, user] = await Promise.all([
    (prisma as any).group.findFirst({ where: { id: params.groupId, cabinetId: params.cabinetId } }),
    prisma.user.findFirst({ where: { id: userId, cabinetId: params.cabinetId } }),
  ]);
  if (!group || !user) return NextResponse.json({ message: "Not found" }, { status: 404 });

  await (prisma as any).groupMember.upsert({
    where: { groupId_userId: { groupId: params.groupId, userId } },
    update: {},
    create: { groupId: params.groupId, userId },
  });
  return NextResponse.json({ message: "Member added to group" }, { status: 200 });
}

export async function DELETE(req: Request, { params }: { params: { cabinetId: string; groupId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.accountType !== "CABINET" || session.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }
  if (session.user.cabinetId !== params.cabinetId) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId) return NextResponse.json({ message: "userId is required" }, { status: 400 });

  await (prisma as any).groupMember.delete({
    where: { groupId_userId: { groupId: params.groupId, userId } },
  });
  return NextResponse.json({ message: "Member removed from group" }, { status: 200 });
}



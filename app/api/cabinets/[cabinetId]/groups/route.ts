import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { prisma } from "@/prisma/client";

export async function GET(_req: Request, { params }: { params: { cabinetId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.accountType !== "CABINET") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }
  if (session.user.cabinetId !== params.cabinetId) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const isAdmin = session.user.role === "ADMIN";
  const where = isAdmin
    ? { cabinetId: params.cabinetId }
    : { cabinetId: params.cabinetId, members: { some: { userId: session.user.id } } };

  const groups = await (prisma as any).group.findMany({
    where,
    orderBy: { name: "asc" },
    include: {
      members: { include: { user: { select: { id: true, email: true } } } },
    },
  });

  return NextResponse.json({ groups }, { status: 200 });
}

export async function POST(req: Request, { params }: { params: { cabinetId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.accountType !== "CABINET" || session.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }
  if (session.user.cabinetId !== params.cabinetId) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { name } = await req.json();
  if (!name || typeof name !== "string") {
    return NextResponse.json({ message: "Group name is required" }, { status: 400 });
  }

  try {
    const group = await (prisma as any).group.create({
      data: { name: name.trim(), cabinetId: params.cabinetId },
    });
    return NextResponse.json({ group }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ message: "Group name must be unique" }, { status: 409 });
  }
}



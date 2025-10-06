import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { hash } from "bcrypt";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const { token, password } = await req.json();

  if (!token || !password) {
    return NextResponse.json({ message: "Token and password are required" }, { status: 400 });
  }

  const record = await prisma.passwordResetToken.findUnique({ where: { token } });

  if (!record || record.expires < new Date()) {
    return NextResponse.json({ message: "Invalid or expired token" }, { status: 400 });
  }

  const hashed = await hash(password, 10);

  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { password: hashed } }),
    prisma.passwordResetToken.delete({ where: { token } }),
  ]);

  return NextResponse.json({ message: "Password reset successfully" }, { status: 200 });
}



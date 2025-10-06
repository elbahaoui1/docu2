import { prisma } from "@/prisma/client";
import { NextResponse } from "next/server";
import { logger } from "@/src/shared/logger";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  const emailParam = searchParams.get("email");

  if (!token) {
    return NextResponse.json({ message: "Missing token" }, { status: 400 });
  }

  const record = await prisma.verificationToken.findUnique({ where: { token } });

  if (!record || record.expires < new Date()) {
    logger.warn("Email verification failed: invalid or expired token");
    return NextResponse.json({ message: "Invalid or expired token" }, { status: 400 });
  }

  const normalizedIdentifier = record.identifier.toLowerCase().trim();

  const result = await prisma.$transaction([
    prisma.user.updateMany({
      where: { email: { equals: normalizedIdentifier, mode: "insensitive" } },
      data: { emailVerified: new Date() },
    }),
    prisma.verificationToken.delete({ where: { token } }),
  ]);

  const updatedUsers = Array.isArray(result) ? (result[0] as any).count ?? 0 : 0;
  if (updatedUsers === 0) {
    logger.warn("Email verification: no account matched", { identifier: normalizedIdentifier });
    return NextResponse.json({ message: "No account matched this verification token email" }, { status: 404 });
  }

  const mismatchNote = emailParam && emailParam.toLowerCase().trim() !== normalizedIdentifier
    ? " (note: email parameter did not match the token identifier)"
    : "";

  return NextResponse.json({ message: `Email verified successfully${mismatchNote}` }, { status: 200 });
}



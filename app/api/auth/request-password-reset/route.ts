import { prisma } from "@/prisma/client";
import { NextResponse } from "next/server";
import { logger } from "@/src/shared/logger";
import { EmailService } from "@/src/infrastructure/email/EmailService";
import { TokenService } from "@/src/infrastructure/auth/TokenService";

const mailer = EmailService.get();

export async function POST(req: Request) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ message: "Email is required" }, { status: 400 });
  }

  const user = await prisma.user.findFirst({ where: { email: { equals: (email as string).trim(), mode: "insensitive" } } });

  // Always return 200 to avoid user enumeration
  if (!user) {
    return NextResponse.json({ message: "If an account exists, a reset email has been sent" }, { status: 200 });
  }

  const token = TokenService.generateToken();
  const expires = TokenService.expiryFromNow(60 * 60 * 1000); // 1 hour

  await prisma.passwordResetToken.create({
    data: { userId: user.id, token, expires },
  });

  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const resetLink = `${baseUrl}/reset-password?token=${token}`;

  const sent = await mailer.sendPasswordResetEmail(email, resetLink);
  if (!sent) {
    logger.warn("Password reset email failed to send", { email });
  }

  if (!sent) {
    // Still return 200 to avoid enumeration, but include hint for logs
    return NextResponse.json({ message: "If an account exists, a reset email has been sent (delivery issue detected)." }, { status: 200 });
  }

  return NextResponse.json({ message: "If an account exists, a reset email has been sent" }, { status: 200 });
}



// /app/api/auth/register-cabinet/route.ts

import { prisma } from "@/prisma/client";
import { hash } from "bcrypt";
import { NextResponse } from "next/server";
import { EmailService } from "@/src/infrastructure/email/EmailService";
import { TokenService } from "@/src/infrastructure/auth/TokenService";
import { normalizeEmail } from "@/src/shared/utils/email";
import { logger } from "@/src/shared/logger";

const mailer = EmailService.get();

export async function POST(req: Request) {
  try {
    const { cabinetName, email, password } = await req.json();

    if (!cabinetName || !email || !password) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const normalizedEmail = normalizeEmail(email as string);
    const hashedPassword = await hash(password, 10);

    const cabinet = await prisma.cabinet.create({
      data: {
        name: cabinetName,
        users: {
          create: {
            email: normalizedEmail,
            password: hashedPassword,
            accountType: "CABINET",
            role: "ADMIN",
            emailVerified: null,
          },
        },
      },
      include: { users: true },
    });

    // Create verification token and send email
    const token = TokenService.generateToken();
    const expires = TokenService.expiryFromNow(24 * 60 * 60 * 1000);
    await prisma.verificationToken.create({
      data: { identifier: normalizedEmail, token, expires },
    });

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const verifyLink = `${baseUrl}/verify-email?token=${token}&email=${encodeURIComponent(normalizedEmail)}`;
    const sent = await mailer.sendVerificationEmail(normalizedEmail, verifyLink);
    if (!sent) {
      logger.warn("Verification email failed to send", { email: normalizedEmail });
      return NextResponse.json({ message: "Cabinet account created. Email delivery issue detected; please contact support if you don't receive the email.", cabinetId: cabinet.id }, { status: 201 });
    }

    return NextResponse.json({ message: "Cabinet account created. Please verify your email.", cabinetId: cabinet.id }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "An error occurred" }, { status: 500 });
  }
}



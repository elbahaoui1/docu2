// /app/api/register-company/route.ts

import { prisma } from "@/prisma/client";
import { hash } from "bcrypt";
import { randomBytes } from "crypto";
import { EmailService } from "@/src/infrastructure/email/EmailService";
import { TokenService } from "@/src/infrastructure/auth/TokenService";
import { normalizeEmail } from "@/src/shared/utils/email";
import { logger } from "@/src/shared/logger";
import { NextResponse } from "next/server";

const mailer = EmailService.get();

export async function POST(req: Request) {
  try {
    const { companyName, email, password } = await req.json();

    if (!companyName || !email || !password) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const normalizedEmail = normalizeEmail(email as string);
    const hashedPassword = await hash(password, 10);

    // Create the Company and the User in a single transaction
    const company = await prisma.company.create({
      data: {
        name: companyName,
        user: {
          create: {
            email: normalizedEmail,
            password: hashedPassword,
            accountType: "COMPANY",
          },
        },
      },
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
      // Do not fail account creation; inform client non-fatally
      return NextResponse.json({ message: "Company account created. Email delivery issue detected; please contact support if you don't receive the email.", companyId: company.id }, { status: 201 });
    }

    return NextResponse.json({ message: "Company account created. Please verify your email.", companyId: company.id }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "An error occurred" }, { status: 500 });
  }
}
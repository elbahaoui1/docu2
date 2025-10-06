import { prisma } from "@/prisma/client";
import { TokenService } from "@/src/infrastructure/auth/TokenService";
import { EmailService } from "@/src/infrastructure/email/EmailService";
import { normalizeEmail } from "@/src/shared/utils/email";
import { config } from "@/src/shared/config";

export class AuthService {
  private mailer = EmailService.get();

  async createCompanyAccount(companyName: string, email: string, hashedPassword: string) {
    const normalizedEmail = normalizeEmail(email);
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

    const token = TokenService.generateToken();
    const expires = TokenService.expiryFromNow(24 * 60 * 60 * 1000);
    await prisma.verificationToken.create({ data: { identifier: normalizedEmail, token, expires } });
    const verifyLink = `${config.nextAuthUrl}/verify-email?token=${token}&email=${encodeURIComponent(normalizedEmail)}`;
    const sent = await this.mailer.sendVerificationEmail(normalizedEmail, verifyLink);
    return { company, sent };
  }
}



import { ResendAdapter, buildPasswordResetEmailHtml, buildVerificationEmailHtml } from "./ResendAdapter";

export class EmailService {
  private static instance: EmailService | null = null;
  private mailer: ResendAdapter;

  private constructor() {
    this.mailer = new ResendAdapter();
  }

  static get(): EmailService {
    if (!this.instance) this.instance = new EmailService();
    return this.instance;
  }

  async sendVerificationEmail(to: string, link: string): Promise<boolean> {
    return this.mailer.sendEmail({ to, subject: "Confirm your email", html: buildVerificationEmailHtml(link) });
  }

  async sendPasswordResetEmail(to: string, link: string): Promise<boolean> {
    return this.mailer.sendEmail({ to, subject: "Reset your password", html: buildPasswordResetEmailHtml(link) });
  }
}



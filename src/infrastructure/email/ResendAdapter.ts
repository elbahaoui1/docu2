import type { Resend as ResendClientType } from "resend";

type SendEmailParams = {
  to: string;
  subject: string;
  html: string;
};

export class ResendAdapter {
  private client: ResendClientType | null;
  private fromAddress: string;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    this.fromAddress = process.env.MAIL_FROM || "no-reply@example.com";

    try {
      // Dynamically import to avoid hard dependency if key is missing
      if (apiKey) {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { Resend } = require("resend");
        this.client = new Resend(apiKey);
      } else {
        this.client = null;
      }
    } catch {
      this.client = null;
    }
  }

  async sendEmail(params: SendEmailParams): Promise<boolean> {
    const { to, subject, html } = params;

    if (!this.client) {
      // Fallback: log the email so local dev can proceed without an API key
      // Do not throw: flows should still function in development
      // eslint-disable-next-line no-console
      console.log("EMAIL (mock)", { to, subject, html });
      return true;
    }

    try {
      await this.client.emails.send({
        from: this.fromAddress,
        to,
        subject,
        html,
      });
      return true;
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.error("Failed to send email via Resend", {
        error: error?.message || String(error),
        to,
        subject,
        from: this.fromAddress,
      });
      return false;
    }
  }
}

export function buildVerificationEmailHtml(verificationLink: string): string {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>Confirm your email</h2>
      <p>Thanks for creating an account. Please confirm your email by clicking the button below.</p>
      <p>
        <a href="${verificationLink}" style="display:inline-block;padding:10px 16px;background:#111;color:#fff;text-decoration:none;border-radius:6px;">
          Verify Email
        </a>
      </p>
      <p>If the button doesn't work, copy and paste this URL into your browser:</p>
      <code>${verificationLink}</code>
    </div>
  `;
}

export function buildPasswordResetEmailHtml(resetLink: string): string {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>Reset your password</h2>
      <p>We received a request to reset your password. If you didn't make this request, you can ignore this email.</p>
      <p>
        <a href="${resetLink}" style="display:inline-block;padding:10px 16px;background:#111;color:#fff;text-decoration:none;border-radius:6px;">
          Reset Password
        </a>
      </p>
      <p>If the button doesn't work, copy and paste this URL into your browser:</p>
      <code>${resetLink}</code>
    </div>
  `;
}



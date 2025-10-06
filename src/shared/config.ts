type AppConfig = {
  nextAuthUrl: string;
  nextAuthSecret: string | undefined;
  mailFrom: string;
};

export const config: AppConfig = {
  nextAuthUrl: process.env.NEXTAUTH_URL || "http://localhost:3000",
  nextAuthSecret: process.env.NEXTAUTH_SECRET,
  mailFrom: process.env.MAIL_FROM || "no-reply@example.com",
};



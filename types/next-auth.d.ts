// /types/next-auth.d.ts

import { UserRole, AccountType } from "@prisma/client";
import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      accountType: AccountType;
      role: UserRole | null;
      companyId: string | null;
      cabinetId: string | null;
    };
  }

  interface User {
      accountType: AccountType;
      role: UserRole | null;
      companyId: string | null;
      cabinetId: string | null;
  }
}

declare module "next-auth/jwt" {
    interface JWT {
        accountType: AccountType;
        role: UserRole | null;
        companyId: string | null;
        cabinetId: string | null;
    }
}
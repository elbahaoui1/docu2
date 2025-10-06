import { randomBytes } from "crypto";

export class TokenService {
  static generateToken(bytes: number = 32): string {
    return randomBytes(bytes).toString("hex");
  }

  static expiryFromNow(ms: number): Date {
    return new Date(Date.now() + ms);
  }
}


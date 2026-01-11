import * as argon2 from "argon2";
import jwt from "jsonwebtoken";
import { JwtPayload } from "./auth.types";

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Password must be at least 8 characters with 1 uppercase, 1 lowercase, 1 number
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export function isValidPassword(password: string): boolean {
  return passwordRegex.test(password);
}

export async function hashedString(strs: string): Promise<string> {
  try {
    const hash = await argon2.hash(strs);
    return hash;
  } catch (err) {
    console.error("Caught error:", err);
    return "";
  }
}

export async function verifyHashedString(
  hashFromDatabase: string,
  reqString: string
): Promise<boolean> {
  try {
    const match = await argon2.verify(hashFromDatabase, reqString);
    return match;
  } catch (err) {
    return false;
  }
}

export function isValidEmail(email: string): boolean {
  return emailRegex.test(email);
}

export function signToken(payload: JwtPayload): string {
  if (!process.env.JWT_SECRET_KEY || process.env.JWT_SECRET_KEY.length < 32) {
    throw new Error("JWT_SECRET_KEY must be at least 32 characters");
  }
  return jwt.sign(payload, process.env.JWT_SECRET_KEY, {
    expiresIn: "15m", // Shorter access token
    algorithm: "HS256",
  });
}

export function verifyToken(token: string): JwtPayload {
  if (!process.env.JWT_SECRET_KEY) {
    throw new Error("JWT_SECRET_KEY not configured");
  }
  return jwt.verify(token, process.env.JWT_SECRET_KEY) as JwtPayload;
}

export function refreshToken(payload: JwtPayload): string {
  if (!process.env.JWT_REFRESH_KEY || process.env.JWT_REFRESH_KEY.length < 32) {
    throw new Error("JWT_REFRESH_KEY must be at least 32 characters");
  }
  return jwt.sign(payload, process.env.JWT_REFRESH_KEY, { expiresIn: "7d" }); // 7 days for refresh
}

export function verifyRefreshToken(token: string): JwtPayload {
  if (!process.env.JWT_REFRESH_KEY) {
    throw new Error("JWT_REFRESH_KEY not configured");
  }
  return jwt.verify(token, process.env.JWT_REFRESH_KEY) as JwtPayload;
}

export function resetToken(payload: JwtPayload): string {
  return jwt.sign(payload, process.env.RESET_PASSWORD_SECRET!, {
    expiresIn: "5m",
  });
}

export function verifyResetToken(token: string): JwtPayload {
  return jwt.verify(token, process.env.RESET_PASSWORD_SECRET!) as JwtPayload;
}
export const htmlTemplate = (resetLink: string) => {
  const html = `
        <h2>Password Reset Request</h2>
        <p>You requested to reset your password.</p>
        <p>Click the button below:</p>
        <a href="${resetLink}" 
        style="padding: 10px 20px; background: #007bff; color: white; text-decoration: none;">
        Reset Password
        </a>
        <p>If you didn’t request this, just ignore this email.</p>
    `;
  return html;
};

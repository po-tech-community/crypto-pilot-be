import * as argon2 from 'argon2'
import jwt from "jsonwebtoken";
import { JwtPayload } from './auth.types';

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export async function hashedString(strs: string):Promise<string>{
  try {
     
    const hash = await argon2.hash(strs);
    return hash;
  } catch (err) {
    console.error("Caught error:", err);
    return ''
  }
}

export async function verifyHashedString(hashFromDatabase: string, reqString: string):Promise<boolean> {
  try {
    const match = await argon2.verify(hashFromDatabase, reqString);
    return match;
  } catch (err) {
    
    return false;
  }
}

export function isValidEmail(email:string):boolean{
  return emailRegex.test(email);
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, process.env.JWT_SECRET_KEY!, { expiresIn: "30m",algorithm:"HS256" });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, process.env.JWT_SECRET_KEY!) as JwtPayload;
}

export function refreshToken(payload: JwtPayload):string {
  return jwt.sign(payload, process.env.JWT_REFRESH_KEY!, { expiresIn: "1h" });
}

export function verifyRefreshToken(token: string):JwtPayload {
  return jwt.verify(token, process.env.JWT_REFRESH_KEY!) as JwtPayload;
}

export const htmlTemplate = (resetLink:string)=>{
    const html = `
        <h2>Password Reset Request</h2>
        <p>You requested to reset your password.</p>
        <p>Click the button below:</p>
        <a href="${resetLink}" 
        style="padding: 10px 20px; background: #007bff; color: white; text-decoration: none;">
        Reset Password
        </a>
        <p>If you didn’t request this, just ignore this email.</p>
    `
    return html
}

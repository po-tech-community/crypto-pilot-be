import * as argon2 from 'argon2'
import jwt from "jsonwebtoken";
import { JwtPayload } from './auth.types';

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export async function hashPassword(password: string):Promise<string>{
  try {
     
    const hash = await argon2.hash(password);
    return hash;
  } catch (err) {
    console.error("Caught error:", err);
    return ''
  }
}


export async function checkPassword(hashFromDatabase: string, submittedPassword: string):Promise<boolean> {
  try {
    const match = await argon2.verify(hashFromDatabase, submittedPassword);
    return match;
  } catch (err) {
    console.error('Error during password verification:', err);
    return false;
  }
}

export const isValidEmail = (email:string):boolean => emailRegex.test(email);

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


import { Request } from "express";
import { ERole } from "./auth.models";

export interface JwtPayload {
  userId: string;
  role: ERole;
  userEmail: string;
  userName: string;
}

export interface AuthResponse {
  userId: string;
  email: string;
  password: string;
  role: ERole;
  refreshToken?: string;
}

export interface RegisterRequest {
  userId: string;
  email: string;
  password: string;
  confirmPassword?: string;
  role: ERole;
}

export interface RegisterResponse {
  message: string;
  token?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token?: string;
  message: string;
}

export interface ForgotRequest {
  email?: string;
}

export interface ForgotResponse {
  message?: string;
}

export interface ResetRequest {
  token: string;
  password: string;
}

export interface ResetResponse {
  message?: string;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export interface DisableUserRequest {
  userId?: string;
  isActive: boolean;
  updatedBy?: string;
}

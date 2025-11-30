import { Request } from "express";

export interface JwtPayload{
    userId:string;
    role: "user" | "admin"
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  role?:"user" | "admin"
}

export interface RegisterResponse {
  message: string;
  token?:string
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token?: string;
  message: string;
}

export interface ForgotRequest{
  email?:string
}

export interface ForgotResponse{
  message?:string
}

export interface ResetRequest{
  token:string
  password:string
}

export interface ResetResponse{
  message?:string
}


export interface AuthRequest extends Request {
  user?: JwtPayload;
}


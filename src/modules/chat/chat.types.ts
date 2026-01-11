import { Request } from "express";
import { JwtPayload } from "../authentication/auth.types";

export interface ChatRequest {
  message: string;
}

export interface ChatResponse {
  reply: string;
  timestamp: Date;
}

export interface AuthChatRequest extends Request {
  user?: JwtPayload;
  body: ChatRequest;
}
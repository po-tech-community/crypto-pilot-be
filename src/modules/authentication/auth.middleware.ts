import { Response, NextFunction } from "express";
import { verifyToken } from "./auth.utils";
import { AuthRequest } from "./auth.types";
import { ERole } from "./auth.models";
import { FindAccount } from "./auth.service";


export async function  AuthMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing token" })
  }

  const token = header.split(" ")[1]

  try {
    const decoded = await verifyToken(token)
    const user = await FindAccount({userId: decoded.userId})
    if(!user){
      return res.status(404).json({ message: "Not Found" })
    }
    req.user = decoded;
    next()
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" })
  }
}

export function Authorize(role: ERole) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const userRole = ERole[req.user?.role as keyof typeof ERole];
    if (userRole !== role) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
}

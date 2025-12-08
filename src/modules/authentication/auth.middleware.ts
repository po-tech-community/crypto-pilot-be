import { Response, NextFunction } from "express";
import { verifyToken } from "./auth.utils";
import { AuthRequest } from "./auth.types";
import { ERole } from "./auth.models";
import { FindAccount } from "./auth.service";


export function AuthMiddleware(
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
    const decoded = verifyToken(token)
    const user = FindAccount({userId: decoded.userId})
    if(!user){
      return res.status(401).json({ message: "Invalid token" })
    }
    req.user = decoded;
    next()
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" })
  }
}

export function Authorize(role: ERole){
   return (req: AuthRequest, res: Response, next: NextFunction)=>{
      if(req.user?.role!=role){
        return res.status(403).json({message: "Access denied"})
      }
   }
}
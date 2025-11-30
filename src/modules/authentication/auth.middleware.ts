import { Response, NextFunction } from "express";
import { verifyToken } from "./auth.utils";
import { AuthRequest } from "./auth.types";


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
    req.user = decoded;
    next()
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" })
  }
}

export function Authorize(role: "admin" | "user"){
   return (req: AuthRequest, res: Response, next: NextFunction)=>{
      if(req.user?.role!=role){
        return res.status(403).json({message: "Access denied"})
      }
   }
}
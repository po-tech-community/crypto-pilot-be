import { Response, NextFunction } from "express";
import { verifyToken } from "./auth.utils";
import { AuthRequest } from "./auth.types";
import { ERole } from "./auth.models";
import { get } from "./auth.service";

// Validate token
export async function AuthMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing token" });
  }

  const token = header.split(" ")[1];

  try {
    const decoded = await verifyToken(token);
    const user = await get({ userId: decoded.userId });
    if (!user) {
      return res.status(404).json({ message: "Not Found" });
    }
    req.user = decoded; // { userId: decoded.userId, role: decoded.role }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

// Middleware role
export function Authorize(...allowedRoles: ERole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const userRole = req.user?.role as ERole;
    console.log("User role:", userRole);

    if (!userRole || !allowedRoles.includes(userRole)) {
      return res.status(403).json({ message: "Access denied" });
    }

    next();
  };
}

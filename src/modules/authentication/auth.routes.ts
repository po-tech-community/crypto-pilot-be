import { Router } from "express";
import {
  SignUp,
  SignIn,
  Profile,
  ForgotPassword,
  ResetPassword,
  RefreshTokenHandler,
  Logout,
  DisabledProfile,
} from "./auth.controller";
import { AuthMiddleware } from "./auth.middleware";

const router = Router();
router.post("/register", SignUp);
router.post("/login", SignIn);
router.post("/refresh",AuthMiddleware ,RefreshTokenHandler)
router.post("/logout",AuthMiddleware ,Logout)
router.post("/forgot-password",AuthMiddleware, ForgotPassword);
router.post("/reset-password", ResetPassword);
router.get("/me", AuthMiddleware, Profile);
router.put("/disable", AuthMiddleware, DisabledProfile);

export default router;

import { Router } from "express";
import {
  ForgotPassword,
  ResetPassword,
  RefreshTokenHandler,
  Logout,
  DisabledProfile,
} from "./auth.controller";

const router = Router();
router.post("/refresh", RefreshTokenHandler);
router.post("/logout", Logout);
router.post("/forgot-password", ForgotPassword);
router.post("/reset-password", ResetPassword);
router.put("/disable", DisabledProfile);

export default router;

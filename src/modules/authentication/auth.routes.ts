import { Router } from "express";
import {
  ForgotPassword,
  ResetPassword,
  RefreshTokenHandler,
  LogOut,
  DisabledUser,
} from "./auth.controller";

const router = Router();
router.post("/refresh", RefreshTokenHandler);
router.post("/logout", LogOut);
router.post("/forgot-password", ForgotPassword);
router.post("/reset-password", ResetPassword);
router.put("/disable", DisabledUser);

export default router;

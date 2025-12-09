import { Router } from "express";
import {
  CreateProfile,
  GetAllProfile,
  GetProfile,
  UpdateProfile,
} from "./profile.controller";
import { AuthMiddleware, Authorize } from "../authentication/auth.middleware";
import { ERole } from "../authentication/auth.models";

const router = Router();

router.get("/", AuthMiddleware, Authorize(ERole.admin), GetAllProfile);
router.post("/create", AuthMiddleware, CreateProfile);
router.get("/getme", AuthMiddleware, GetProfile);
router.put("/update", AuthMiddleware, UpdateProfile);

export default router;

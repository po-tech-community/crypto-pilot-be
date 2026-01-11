import { Router } from "express";
import { GetAllProfile, GetProfile, UpdateProfile } from "./profile.controller";
import { getPortfolio } from "./profile.portfolio";
import { Authorize } from "../authentication/auth.middleware";
import { ERole } from "../authentication/auth.models";

const router = Router();

router.get("/", Authorize(ERole.admin), GetAllProfile);
router.get("/get-me", GetProfile);
router.get("/portfolio", getPortfolio);
router.put("/update", UpdateProfile);

export default router;

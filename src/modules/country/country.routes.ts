import { Router } from "express";
import {
  createCountry,
  createCountries,
  getAllCountries,
} from "./country.controller";

const router = Router();

router.get("/", getAllCountries);
router.post("/create", createCountry);
router.post("/create/bulk", createCountries);

export default router;

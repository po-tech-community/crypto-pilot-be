import { Router } from "express";
import { createACountry, createManyCountries, GetListCountries } from "./country.controller";



const router = Router();

router.get("/",GetListCountries);
router.post("/create",createACountry);
router.post("/createmany",createManyCountries)

export default router;
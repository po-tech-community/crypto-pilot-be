import { Router } from "express";
import {
    getAssetController
} from "./asset.controller";

const assetRoutes = Router();

assetRoutes.get("/", getAssetController);

export default assetRoutes;

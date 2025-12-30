import { Router } from "express";
import {
  getHistoryController,
  getHistoryByIdController,
  createHistoryController,
  updateHistoryController,
  deleteHistoryController,
} from "./history.controller";
import { AuthMiddleware } from "../authentication/auth.middleware";

const historyRoutes = Router();

// protect all history endpoints
historyRoutes.use(AuthMiddleware);

// get method
historyRoutes.get("/", getHistoryController);

// getbyID
historyRoutes.get("/:id", getHistoryByIdController);

// post method
historyRoutes.post("/", createHistoryController);

// put method
historyRoutes.put("/:id", updateHistoryController);

// delete method
historyRoutes.delete("/:id", deleteHistoryController);

export default historyRoutes;

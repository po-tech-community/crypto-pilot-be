import { Router } from "express";
import {
  getHistoryController,
  getHistoryByIdController,
  createHistoryController,
  updateHistoryController,
  deleteHistoryController,
  seedHistoryController,
} from "./history.controller";

const historyRoutes = Router();
historyRoutes.post("/mock", seedHistoryController);

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

// Routes files: define model-related endpoints

import { Router } from "express";
import {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
} from "./order.controller";
import { AuthMiddleware } from "../authentication/auth.middleware";

const router = Router();

router.get("/", getAllOrders);
router.get("/:id", getOrderById);

router.post("/", AuthMiddleware, createOrder);

router.put("/:id", updateOrder);
router.delete("/:id", deleteOrder);

export default router;

// Routes files: define model-related endpoints

import { Router } from "express";
import {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
  getOrderBookHandler,
} from "./order.controller";
import { getBalances, getAssetBalance } from "./order.balance.controller";
import { AuthMiddleware } from "../authentication/auth.middleware";

const router = Router();

// Apply AuthMiddleware to all routes
router.use(AuthMiddleware);

router.get("/", getAllOrders);
router.get("/balance", getBalances);
router.get("/balance/:asset", getAssetBalance);
router.get("/book", getOrderBookHandler);
router.get("/book/:asset", getOrderBookHandler);
router.get("/:id", getOrderById);

router.post("/", createOrder);

router.put("/:id", updateOrder);
router.delete("/:id", deleteOrder);

export default router;

// Controller files: handle logic between routes and services

import { Request, Response } from "express";
import { UpdateOrderBody, OrderResponse, CreateOrderBody } from "./order.model";
import * as OrderService from "./order.service";
import { broadcastOrderUpdate } from "../../websocket/orderSocket";
import { AuthRequest } from "../authentication/auth.types";
import { getCurrentPrices } from "../../websocket/priceSocket";
import { cancelOrder, getOrderBook } from "./order.matching";

// GET /orders
export const getAllOrders = async (
  req: AuthRequest,
  res: Response<OrderResponse[]>
) => {
  const userId = req.user?.userId;
  const orders = await OrderService.getAll(userId);
  res.json(orders);
};

// GET /orders/:id
export const getOrderById = async (
  req: AuthRequest,
  res: Response<OrderResponse | { message: string }>
) => {
  const userId = req.user?.userId;
  const order = await OrderService.getById(req.params.id);

  if (!order) return res.status(404).json({ message: "Order not found" });

  // Users can only see their own orders (unless admin)
  if (order.userId !== userId) {
    return res.status(403).json({ message: "Forbidden" });
  }

  res.json(order);
};

// POST /orders
export const createOrder = async (
  req: AuthRequest,
  res: Response<OrderResponse | { message: string }>
) => {
  try {
    const userId = req.user!.userId;
    const currentPrices = getCurrentPrices();
    const order = await OrderService.create(userId, req.body, currentPrices);

    broadcastOrderUpdate("orderCreated", order);
    res.status(201).json(order);
  } catch (err: any) {
    res.status(400).json({ message: err.message ?? "Invalid order" });
  }
};

// PUT /orders/:id
export const updateOrder = async (
  req: Request<
    { id: string },
    OrderResponse | { message: string },
    UpdateOrderBody
  >,
  res: Response<OrderResponse | { message: string }>
) => {
  const order = await OrderService.update(req.params.id, req.body);
  if (!order) return res.status(404).json({ message: "Order not found" });

  broadcastOrderUpdate("orderUpdated", order);
  res.json(order);
};

// DELETE /orders/:id
export const deleteOrder = async (
  req: AuthRequest,
  res: Response<void | { message: string }>
) => {
  try {
    const userId = req.user?.userId;
    const order = await OrderService.getById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Users can only cancel their own orders
    if (order.userId !== userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const ok = await cancelOrder(req.params.id);
    if (!ok) {
      return res.status(400).json({
        message: "Order cannot be cancelled (already filled or cancelled)",
      });
    }

    res.status(204).send();
  } catch (err: any) {
    res.status(400).json({ message: err.message ?? "Failed to cancel order" });
  }
};

// GET /orders/book or /orders/book/:asset
export const getOrderBookHandler = async (req: Request, res: Response) => {
  const asset = req.params.asset as string | undefined;
  const orderBook = getOrderBook(asset);
  res.json(orderBook);
};

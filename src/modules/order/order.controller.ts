// Controller files: handle logic between routes and services

import { Request, Response } from "express";
import { CreateOrderBody, UpdateOrderBody, OrderResponse } from "./order.model";
import * as OrderService from "./order.service";
import { broadcastOrderUpdate } from "../../websocket/orderSocket";  // ← NEW IMPORT


// GET /orders
export const getAllOrders = async (
  req: Request,
  res: Response<OrderResponse[]>
) => {
  const orders = await OrderService.getAll();
  res.json(orders);
};

// GET /orders/:id
export const getOrderById = async (
  req: Request<{ id: string }, OrderResponse | { message: string }>,
  res: Response<OrderResponse | { message: string }>
) => {
  const order = await OrderService.getById(req.params.id);
  if (!order) return res.status(404).json({ message: "Order not found" });
  res.json(order);
};

// POST /orders
export const createOrder = async (
  req: Request<{}, OrderResponse, CreateOrderBody>,
  res: Response<OrderResponse>
) => {
  const order = await OrderService.create(req.body);
  broadcastOrderUpdate("orderCreated", order);
  res.status(201).json(order);
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
  req: Request<{ id: string }, void>,
  res: Response<void>
) => {
  const ok = await OrderService.deleteOrder(req.params.id);
  if (!ok) return res.status(404).send();
  broadcastOrderUpdate("orderDeleted", { id: req.params.id });
  res.status(204).send();
};

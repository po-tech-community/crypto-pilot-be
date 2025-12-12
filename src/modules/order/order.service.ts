// Service files: interact with the database

import Order, {
  IOrder,
  CreateOrderBody,
  UpdateOrderBody,
  OrderResponse,
} from "./order.model";

const toResponse = (doc: IOrder): OrderResponse => ({
  id: doc._id.toString(),
  userId: doc.userId,
  type: doc.type,
  side: doc.side,
  amount: doc.amount,
  limitPrice: doc.limitPrice,
  status: doc.status,
});

export const getAll = async (): Promise<OrderResponse[]> => {
  const orders = await Order.find();
  return orders.map(toResponse);
};

export const getById = async (id: string): Promise<OrderResponse | null> => {
  const order = await Order.findById(id);
  return order ? toResponse(order) : null;
};

export const create = async (data: CreateOrderBody): Promise<OrderResponse> => {
  const order = new Order(data);
  const saved = await order.save();
  return toResponse(saved);
};

export const update = async (
  id: string,
  data: UpdateOrderBody
): Promise<OrderResponse | null> => {
  const updated = await Order.findByIdAndUpdate(id, data, { new: true });
  return updated ? toResponse(updated) : null;
};

export const deleteOrder = async (id: string): Promise<boolean> => {
  const deleted = await Order.findByIdAndDelete(id);
  return !!deleted;
};

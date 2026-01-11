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
  asset: doc.asset,
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

const ALLOWED_ASSETS = ["BTC", "ETH", "SOL", "XRP"] as const;

function validateCreateOrder(data: CreateOrderBody) {
  // asset
  if (!ALLOWED_ASSETS.includes(data.asset)) {
    throw new Error("Invalid asset");
  }

  // amount
  if (typeof data.amount !== "number" || Number.isNaN(data.amount) || data.amount <= 0) {
    throw new Error("Amount must be a number > 0");
  }

  // type
  if (data.type !== "market" && data.type !== "limit") {
    throw new Error("Invalid order type");
  }

  // side
  if (data.side !== "buy" && data.side !== "sell") {
    throw new Error("Invalid order side");
  }

  // limitPrice rules
  if (data.type === "limit") {
    if (typeof data.limitPrice !== "number" || Number.isNaN(data.limitPrice) || data.limitPrice <= 0) {
      throw new Error("limitPrice is required for limit orders and must be > 0");
    }

  } else {
    // market order -> ignore limitPrice
    delete (data as any).limitPrice;
  }
}

export const create = async (
  userId: string,
  data: CreateOrderBody
): Promise<OrderResponse> => {
  validateCreateOrder(data);

  const order = new Order({ ...data, userId });
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

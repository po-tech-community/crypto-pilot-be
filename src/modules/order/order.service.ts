// Service files: interact with the database

import Order, {
  IOrder,
  CreateOrderBody,
  UpdateOrderBody,
  OrderResponse,
} from "./order.model";
import { executeMarketOrder, matchLimitOrder } from "./order.matching";
import { Prices } from "../constantAssets/asset.model";
import { checkSufficientBalance } from "./order.balance";

const toResponse = (doc: IOrder): OrderResponse => ({
  id: doc._id.toString(),
  userId: doc.userId,
  asset: doc.asset,
  type: doc.type,
  side: doc.side,
  amount: doc.amount,
  originalAmount: doc.originalAmount,
  filledAmount: doc.filledAmount,
  remainingAmount: doc.amount, // amount is the remaining amount
  limitPrice: doc.limitPrice,
  executionPrice: doc.executionPrice,
  status: doc.status,
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
});

export const getAll = async (userId?: string): Promise<OrderResponse[]> => {
  const filter = userId ? { userId } : {};
  const orders = await Order.find(filter).sort({ createdAt: -1 });
  return orders.map(toResponse);
};

export const getById = async (id: string): Promise<OrderResponse | null> => {
  const order = await Order.findById(id);
  return order ? toResponse(order) : null;
};

const ALLOWED_ASSETS = ["BTC", "ETH", "SOL", "BNB"] as const;

function validateCreateOrder(data: CreateOrderBody) {
  // asset
  if (!ALLOWED_ASSETS.includes(data.asset)) {
    throw new Error("Invalid asset");
  }

  // amount
  if (
    typeof data.amount !== "number" ||
    Number.isNaN(data.amount) ||
    data.amount <= 0
  ) {
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
    if (
      typeof data.limitPrice !== "number" ||
      Number.isNaN(data.limitPrice) ||
      data.limitPrice <= 0
    ) {
      throw new Error(
        "limitPrice is required for limit orders and must be > 0"
      );
    }
  } else {
    // market order -> ignore limitPrice
    delete (data as any).limitPrice;
  }
}

export const create = async (
  userId: string,
  data: CreateOrderBody,
  currentPrices?: Prices
): Promise<OrderResponse> => {
  validateCreateOrder(data);

  // Determine the price for balance check
  let priceToCheck = 0;
  if (data.type === "market" && currentPrices) {
    priceToCheck = parseFloat(currentPrices[data.asset]);
  } else if (data.type === "limit" && data.limitPrice) {
    priceToCheck = data.limitPrice;
  }

  // Check if user has sufficient balance
  const balanceCheck = await checkSufficientBalance(
    userId,
    data.asset,
    data.side,
    data.amount,
    priceToCheck
  );

  if (!balanceCheck.sufficient) {
    const currencyNeeded = data.side === "sell" ? data.asset : "USD";
    throw new Error(
      `Insufficient ${currencyNeeded} balance. Available: ${balanceCheck.available.toFixed(
        8
      )}, Required: ${balanceCheck.required.toFixed(8)}`
    );
  }

  const order = new Order({
    ...data,
    userId,
    originalAmount: data.amount,
    filledAmount: 0,
  });
  const saved = await order.save();

  // Execute order matching based on type
  if (data.type === "market") {
    await executeMarketOrder(saved);
  } else if (data.type === "limit" && currentPrices) {
    const currentPrice = parseFloat(currentPrices[data.asset]);
    await matchLimitOrder(saved, currentPrice);
  }

  // Reload order to get updated status
  const updated = await Order.findById(saved._id);
  return toResponse(updated || saved);
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

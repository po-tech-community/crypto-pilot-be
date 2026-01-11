import Order from "./order.model";
import { depositModel, DepositDoc } from "../deposit/deposit.model";
import Withdraw from "../withdraw/withdraw.model";

/**
 * Calculate user's available balance for a specific asset
 * Balance = Deposits - Withdrawals + Buy Orders - Sell Orders
 */
export async function getUserBalance(
  userId: string,
  asset: string
): Promise<number> {
  // Get completed deposits
  const deposits = await depositModel.findMany({
    userId,
    asset,
    status: "COMPLETED",
  });
  const totalDeposits = deposits.reduce(
    (sum: number, d: DepositDoc) => sum + parseFloat(d.amount),
    0
  );

  // Get completed withdrawals
  const withdrawals = await Withdraw.find({
    userId,
    asset,
    status: "COMPLETED",
  });
  const totalWithdrawals = withdrawals.reduce(
    (sum: number, w: any) => sum + parseFloat(w.amount),
    0
  );

  // Get all filled orders for this asset
  const orders = await Order.find({
    userId,
    asset,
    status: "filled",
  });

  let balance = totalDeposits - totalWithdrawals;

  for (const order of orders) {
    const filledAmount = order.filledAmount || 0;
    if (order.side === "buy") {
      // User bought this asset
      balance += filledAmount;
    } else if (order.side === "sell") {
      // User sold this asset
      balance -= filledAmount;
    }
  }

  return Math.max(0, balance);
}

// Starting USD balance for all users (demo/testing purposes)
// In production, this should be managed through a separate balance/wallet system
const STARTING_USD_BALANCE = 100000;

/**
 * Calculate user's USD balance
 * USD Balance = Starting Balance - (Buy Orders Cost) + (Sell Orders Revenue)
 *
 * Note: Deposit/Withdraw don't support USD, only crypto assets.
 * USD balance is calculated from order history only.
 */
export async function getUserUSDBalance(userId: string): Promise<number> {
  // Get all filled orders
  const orders = await Order.find({
    userId,
    status: "filled",
  });

  // Start with initial balance (for demo/testing)
  let balance = STARTING_USD_BALANCE;

  for (const order of orders) {
    const filledAmount = order.filledAmount || 0;
    const executionPrice = order.executionPrice || order.limitPrice || 0;
    const cost = filledAmount * executionPrice;

    if (order.side === "buy") {
      // User spent USD to buy crypto
      balance -= cost;
    } else if (order.side === "sell") {
      // User received USD from selling crypto
      balance += cost;
    }
  }

  return Math.max(0, balance);
}

/**
 * Get reserved balance (pending orders)
 */
export async function getReservedBalance(
  userId: string,
  asset: string
): Promise<number> {
  const pendingOrders = await Order.find({
    userId,
    asset,
    status: { $in: ["open", "partially_filled"] },
  });

  let reserved = 0;
  for (const order of pendingOrders) {
    if (order.side === "sell") {
      // For sell orders, reserve the crypto amount
      reserved += order.amount; // amount is remaining amount
    }
  }

  return reserved;
}

/**
 * Get reserved USD balance (pending buy orders)
 */
export async function getReservedUSDBalance(userId: string): Promise<number> {
  const pendingOrders = await Order.find({
    userId,
    status: { $in: ["open", "partially_filled"] },
  });

  let reserved = 0;
  for (const order of pendingOrders) {
    if (order.side === "buy") {
      // For buy orders, reserve USD
      const price = order.limitPrice || 0;
      reserved += order.amount * price; // amount is remaining amount
    }
  }

  return reserved;
}

/**
 * Check if user has sufficient balance to place an order
 */
export async function checkSufficientBalance(
  userId: string,
  asset: string,
  side: "buy" | "sell",
  amount: number,
  price: number
): Promise<{ sufficient: boolean; available: number; required: number }> {
  if (side === "sell") {
    // Selling crypto - need to have the crypto
    const balance = await getUserBalance(userId, asset);
    const reserved = await getReservedBalance(userId, asset);
    const available = balance - reserved;
    const required = amount;

    return {
      sufficient: available >= required,
      available,
      required,
    };
  } else {
    // Buying crypto - need to have USD
    const balance = await getUserUSDBalance(userId);
    const reserved = await getReservedUSDBalance(userId);
    const available = balance - reserved;
    const required = amount * price;

    return {
      sufficient: available >= required,
      available,
      required,
    };
  }
}

// Order Matching Engine: Matches market and limit orders in real-time

import Order, { IOrder } from "./order.model";
import { broadcastOrderUpdate } from "../../websocket/orderSocket";
import { Prices } from "../constantAssets/asset.model";

// Order book: stores limit orders by asset and side
interface OrderBook {
  [asset: string]: {
    buy: IOrder[]; // Sorted by price descending
    sell: IOrder[]; // Sorted by price ascending
  };
}

const orderBook: OrderBook = {
  BTC: { buy: [], sell: [] },
  ETH: { buy: [], sell: [] },
  SOL: { buy: [], sell: [] },
  BNB: { buy: [], sell: [] },
};

/**
 * Initialize order book with existing open limit orders from database
 */
export async function initializeOrderBook() {
  console.log("🔄 Initializing order book...");

  const openOrders = await Order.find({
    status: { $in: ["open", "partially_filled"] },
    type: "limit",
  }).sort({ createdAt: 1 });

  openOrders.forEach((order) => {
    addToOrderBook(order);
  });

  console.log(
    `✅ Loaded ${openOrders.length} open/partially-filled limit orders`
  );
  logOrderBook();
}

/**
 * Add a limit order to the in-memory order book
 */
function addToOrderBook(order: IOrder) {
  if (order.type !== "limit") return;
  if (order.status !== "open" && order.status !== "partially_filled") return;

  const book = orderBook[order.asset];
  if (!book) return;

  book[order.side].push(order);

  // Sort: buy orders by price DESC, sell orders by price ASC
  if (order.side === "buy") {
    book.buy.sort((a, b) => (b.limitPrice || 0) - (a.limitPrice || 0));
  } else {
    book.sell.sort((a, b) => (a.limitPrice || 0) - (b.limitPrice || 0));
  }
}

/**
 * Remove an order from the order book
 */
function removeFromOrderBook(
  orderId: string,
  asset: string,
  side: "buy" | "sell"
) {
  const book = orderBook[asset];
  if (!book) return;

  book[side] = book[side].filter((o) => o._id.toString() !== orderId);
}

/**
 * Execute a market order immediately against available limit orders
 */
export async function executeMarketOrder(order: IOrder): Promise<boolean> {
  console.log(
    `\n🎯 Executing market ${order.side} order for ${order.amount} ${order.asset}`
  );

  const book = orderBook[order.asset];
  if (!book) return false;

  // Market buy matches against sell orders (lowest price first)
  // Market sell matches against buy orders (highest price first)
  const matchingSide = order.side === "buy" ? "sell" : "buy";
  const availableOrders = book[matchingSide];

  if (availableOrders.length === 0) {
    console.log(
      `❌ No matching ${matchingSide} orders available for ${order.asset}`
    );
    // Market orders must execute immediately - cancel if no matches
    order.status = "cancelled";
    await order.save();

    broadcastOrderUpdate("orderCancelled", {
      id: order._id.toString(),
      userId: order.userId,
      asset: order.asset,
      type: order.type,
      side: order.side,
      amount: order.amount,
      status: "cancelled",
    });

    return false;
  }

  let remainingAmount = order.amount;
  const matchedOrders: IOrder[] = [];
  let totalExecutionValue = 0;
  let totalExecutedAmount = 0;

  // Match against available limit orders
  for (const limitOrder of availableOrders) {
    if (remainingAmount <= 0) break;

    const matchAmount = Math.min(remainingAmount, limitOrder.amount);
    const executionPrice = limitOrder.limitPrice || 0;

    // Track execution for weighted average price
    totalExecutionValue += matchAmount * executionPrice;
    totalExecutedAmount += matchAmount;

    // Update limit order
    limitOrder.amount -= matchAmount;
    limitOrder.filledAmount += matchAmount;
    remainingAmount -= matchAmount;

    if (limitOrder.amount === 0) {
      limitOrder.status = "filled";
      limitOrder.executionPrice = limitOrder.limitPrice;
    } else {
      limitOrder.status = "partially_filled";
    }

    await limitOrder.save();

    if (limitOrder.status === "filled") {
      removeFromOrderBook(
        limitOrder._id.toString(),
        limitOrder.asset,
        limitOrder.side
      );

      broadcastOrderUpdate("orderFilled", {
        id: limitOrder._id.toString(),
        userId: limitOrder.userId,
        asset: limitOrder.asset,
        type: limitOrder.type,
        side: limitOrder.side,
        amount: limitOrder.originalAmount,
        filledAmount: limitOrder.filledAmount,
        limitPrice: limitOrder.limitPrice,
        executionPrice: limitOrder.executionPrice,
        status: "filled",
      });
    } else {
      broadcastOrderUpdate("orderPartialFilled", {
        id: limitOrder._id.toString(),
        userId: limitOrder.userId,
        asset: limitOrder.asset,
        type: limitOrder.type,
        side: limitOrder.side,
        amount: limitOrder.amount,
        filledAmount: limitOrder.filledAmount,
        originalAmount: limitOrder.originalAmount,
        limitPrice: limitOrder.limitPrice,
        status: "partially_filled",
      });
    }

    matchedOrders.push(limitOrder);
    console.log(
      `  ✓ Matched ${matchAmount} ${order.asset} at ${executionPrice}`
    );
  }

  // Update market order
  const filledAmount = order.originalAmount - remainingAmount;
  order.filledAmount = filledAmount;
  order.amount = remainingAmount;

  if (filledAmount > 0) {
    // Calculate weighted average execution price
    order.executionPrice = totalExecutionValue / totalExecutedAmount;
    order.status = remainingAmount === 0 ? "filled" : "partially_filled";
    await order.save();

    console.log(
      `✅ Market order ${order.status} - ${filledAmount} ${order.asset} executed at avg price ${order.executionPrice}`
    );

    broadcastOrderUpdate(
      order.status === "filled" ? "orderFilled" : "orderPartialFilled",
      {
        id: order._id.toString(),
        userId: order.userId,
        asset: order.asset,
        type: order.type,
        side: order.side,
        amount: order.amount,
        originalAmount: order.originalAmount,
        filledAmount: order.filledAmount,
        executionPrice: order.executionPrice,
        status: order.status,
      }
    );

    return order.status === "filled";
  }

  // If we get here, market order couldn't be filled at all
  console.log(`⚠️  Market order could not be executed - cancelling`);
  order.status = "cancelled";
  await order.save();

  broadcastOrderUpdate("orderCancelled", {
    id: order._id.toString(),
    userId: order.userId,
    asset: order.asset,
    type: order.type,
    side: order.side,
    amount: order.amount,
    status: "cancelled",
  });

  return false;
}

/**
 * Try to match a limit order against existing orders
 */
export async function matchLimitOrder(
  order: IOrder,
  currentPrice: number
): Promise<void> {
  console.log(
    `\n🔍 Checking limit ${order.side} order for ${order.amount} ${order.asset} at ${order.limitPrice}`
  );

  // Check if limit order can be executed immediately
  const shouldExecute =
    order.side === "buy"
      ? (order.limitPrice || 0) >= currentPrice
      : (order.limitPrice || 0) <= currentPrice;

  if (shouldExecute) {
    console.log(
      `  ⚡ Price condition met (${currentPrice}) - attempting immediate execution`
    );

    const book = orderBook[order.asset];
    const matchingSide = order.side === "buy" ? "sell" : "buy";
    const availableOrders = book[matchingSide];

    let remainingAmount = order.amount;
    let totalExecutionValue = 0;
    let totalExecutedAmount = 0;

    for (const matchOrder of availableOrders) {
      if (remainingAmount <= 0) break;

      // Check if prices match
      const priceMatch =
        order.side === "buy"
          ? (order.limitPrice || 0) >= (matchOrder.limitPrice || 0)
          : (order.limitPrice || 0) <= (matchOrder.limitPrice || 0);

      if (!priceMatch) break; // No more matching orders

      const matchAmount = Math.min(remainingAmount, matchOrder.amount);
      const executionPrice = matchOrder.limitPrice || 0;

      // Track execution for weighted average price
      totalExecutionValue += matchAmount * executionPrice;
      totalExecutedAmount += matchAmount;

      // Update matched order
      matchOrder.amount -= matchAmount;
      matchOrder.filledAmount += matchAmount;
      remainingAmount -= matchAmount;

      if (matchOrder.amount === 0) {
        matchOrder.status = "filled";
        matchOrder.executionPrice = matchOrder.limitPrice;
        await matchOrder.save();
        removeFromOrderBook(
          matchOrder._id.toString(),
          matchOrder.asset,
          matchOrder.side
        );
        broadcastOrderUpdate("orderFilled", {
          id: matchOrder._id.toString(),
          userId: matchOrder.userId,
          asset: matchOrder.asset,
          type: matchOrder.type,
          side: matchOrder.side,
          amount: matchOrder.originalAmount,
          filledAmount: matchOrder.filledAmount,
          limitPrice: matchOrder.limitPrice,
          executionPrice: matchOrder.executionPrice,
          status: "filled",
        });
      } else {
        matchOrder.status = "partially_filled";
        await matchOrder.save();
        broadcastOrderUpdate("orderPartialFilled", {
          id: matchOrder._id.toString(),
          userId: matchOrder.userId,
          asset: matchOrder.asset,
          type: matchOrder.type,
          side: matchOrder.side,
          amount: matchOrder.amount,
          originalAmount: matchOrder.originalAmount,
          filledAmount: matchOrder.filledAmount,
          limitPrice: matchOrder.limitPrice,
          status: "partially_filled",
        });
      }

      console.log(
        `  ✓ Matched ${matchAmount} ${order.asset} at ${executionPrice}`
      );
    }

    // Update the new limit order
    const filledAmount = order.originalAmount - remainingAmount;
    order.filledAmount = filledAmount;
    order.amount = remainingAmount;

    if (filledAmount > 0) {
      order.executionPrice = totalExecutionValue / totalExecutedAmount;
      order.status = remainingAmount === 0 ? "filled" : "partially_filled";
      await order.save();

      if (order.status === "filled") {
        console.log(
          `✅ Limit order completely filled at avg price ${order.executionPrice}`
        );
        broadcastOrderUpdate("orderFilled", {
          id: order._id.toString(),
          userId: order.userId,
          asset: order.asset,
          type: order.type,
          side: order.side,
          amount: order.originalAmount,
          filledAmount: order.filledAmount,
          limitPrice: order.limitPrice,
          executionPrice: order.executionPrice,
          status: "filled",
        });
        return;
      } else {
        console.log(
          `📋 Limit order partially filled: ${filledAmount}/${order.originalAmount} at avg price ${order.executionPrice}`
        );
        broadcastOrderUpdate("orderPartialFilled", {
          id: order._id.toString(),
          userId: order.userId,
          asset: order.asset,
          type: order.type,
          side: order.side,
          amount: order.amount,
          originalAmount: order.originalAmount,
          filledAmount: order.filledAmount,
          limitPrice: order.limitPrice,
          executionPrice: order.executionPrice,
          status: "partially_filled",
        });
      }
    }
  }

  // Add remaining amount to order book
  if (order.status === "open" || order.status === "partially_filled") {
    addToOrderBook(order);
    console.log(
      `📋 Added to order book - waiting for ${order.amount} ${order.asset} at ${order.limitPrice}`
    );
  }
}

/**
 * Check all open limit orders against current market prices
 */
export async function checkLimitOrders(prices: Prices) {
  const assets: Array<keyof Prices> = ["BTC", "ETH", "SOL", "BNB"];

  for (const asset of assets) {
    const currentPrice = parseFloat(prices[asset]);
    if (!currentPrice) continue;

    const book = orderBook[asset];
    if (!book) continue;

    // Check buy limit orders (execute if market price <= limit price)
    for (let i = book.buy.length - 1; i >= 0; i--) {
      const order = book.buy[i];
      if ((order.limitPrice || 0) >= currentPrice) {
        console.log(
          `\n💰 Buy limit order triggered for ${order.asset} at ${currentPrice}`
        );

        order.status = "filled";
        order.filledAmount = order.originalAmount;
        order.executionPrice = currentPrice;
        await order.save();
        removeFromOrderBook(order._id.toString(), order.asset, order.side);

        broadcastOrderUpdate("orderFilled", {
          id: order._id.toString(),
          userId: order.userId,
          asset: order.asset,
          type: order.type,
          side: order.side,
          amount: order.originalAmount,
          filledAmount: order.filledAmount,
          limitPrice: order.limitPrice,
          executionPrice: currentPrice,
          status: "filled",
        });
      }
    }

    // Check sell limit orders (execute if market price >= limit price)
    for (let i = book.sell.length - 1; i >= 0; i--) {
      const order = book.sell[i];
      if ((order.limitPrice || 0) <= currentPrice) {
        console.log(
          `\n💰 Sell limit order triggered for ${order.asset} at ${currentPrice}`
        );

        order.status = "filled";
        order.filledAmount = order.originalAmount;
        order.executionPrice = currentPrice;
        await order.save();
        removeFromOrderBook(order._id.toString(), order.asset, order.side);

        broadcastOrderUpdate("orderFilled", {
          id: order._id.toString(),
          userId: order.userId,
          asset: order.asset,
          type: order.type,
          side: order.side,
          amount: order.originalAmount,
          filledAmount: order.filledAmount,
          limitPrice: order.limitPrice,
          executionPrice: currentPrice,
          status: "filled",
        });
      }
    }
  }
}

/**
 * Cancel an order and remove it from the order book
 */
export async function cancelOrder(orderId: string): Promise<boolean> {
  const order = await Order.findById(orderId);
  if (!order || order.status !== "open") return false;

  order.status = "cancelled";
  await order.save();

  if (order.type === "limit") {
    removeFromOrderBook(orderId, order.asset, order.side);
  }

  broadcastOrderUpdate("orderCancelled", {
    id: orderId,
    userId: order.userId,
    asset: order.asset,
    status: "cancelled",
  });

  console.log(`❌ Order ${orderId} cancelled`);
  return true;
}

/**
 * Log current order book state
 */
export function logOrderBook() {
  console.log("\n📊 Current Order Book:");
  for (const [asset, book] of Object.entries(orderBook)) {
    const buyCount = book.buy.length;
    const sellCount = book.sell.length;
    if (buyCount > 0 || sellCount > 0) {
      console.log(
        `  ${asset}: ${buyCount} buy orders, ${sellCount} sell orders`
      );
    }
  }
  console.log();
}

/**
 * Get current order book snapshot for API
 * @param asset - Optional asset filter (BTC, ETH, SOL, BNB)
 */
export function getOrderBook(asset?: string) {
  // If asset is specified, return only that asset's order book
  if (asset && orderBook[asset]) {
    return {
      asset,
      bids: orderBook[asset].buy.map((order) => ({
        id: order._id.toString(),
        price: order.limitPrice || 0,
        amount: order.amount,
        remainingAmount: order.amount, // amount IS the remaining amount
        side: "buy" as const,
        asset: order.asset,
      })),
      asks: orderBook[asset].sell.map((order) => ({
        id: order._id.toString(),
        price: order.limitPrice || 0,
        amount: order.amount,
        remainingAmount: order.amount, // amount IS the remaining amount
        side: "sell" as const,
        asset: order.asset,
      })),
    };
  }

  // Return all assets
  const snapshot: any = {};

  for (const [assetKey, book] of Object.entries(orderBook)) {
    snapshot[assetKey] = {
      asset: assetKey,
      bids: book.buy.map((order) => ({
        id: order._id.toString(),
        price: order.limitPrice || 0,
        amount: order.amount,
        remainingAmount: order.amount, // amount IS the remaining amount
        side: "buy" as const,
        asset: order.asset,
      })),
      asks: book.sell.map((order) => ({
        id: order._id.toString(),
        price: order.limitPrice || 0,
        amount: order.amount,
        remainingAmount: order.amount, // amount IS the remaining amount
        side: "sell" as const,
        asset: order.asset,
      })),
    };
  }

  return snapshot;
}

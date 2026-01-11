// Model files: define data schemas and interact with the database

import mongoose, { Schema, Document } from "mongoose";

export interface IOrder extends Document {
  userId: string;
  asset: "BTC" | "ETH" | "SOL" | "BNB";
  type: "market" | "limit";
  side: "buy" | "sell";
  amount: number;
  originalAmount: number; // Track original amount for partial fills
  limitPrice?: number;
  executionPrice?: number; // Actual price order was filled at
  status: "open" | "filled" | "partially_filled" | "cancelled";
  filledAmount: number; // Amount that has been filled
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema: Schema = new Schema(
  {
    userId: { type: String, required: true },

    asset: { type: String, enum: ["BTC", "ETH", "SOL", "BNB"], required: true },

    type: { type: String, enum: ["market", "limit"], required: true },
    side: { type: String, enum: ["buy", "sell"], required: true },

    amount: { type: Number, required: true },
    originalAmount: { type: Number, required: true },

    // Only for limit orders
    limitPrice: { type: Number, required: false },

    // Execution price (for filled orders)
    executionPrice: { type: Number, required: false },

    status: {
      type: String,
      enum: ["open", "filled", "partially_filled", "cancelled"],
      default: "open",
    },

    filledAmount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model<IOrder>("Order", OrderSchema);

// ---- Request / Response Types ----

export interface CreateOrderBody {
  asset: "BTC" | "ETH" | "SOL" | "BNB";
  type: "market" | "limit";
  side: "buy" | "sell";
  amount: number;
  limitPrice?: number;
}

export interface UpdateOrderBody {
  amount?: number;
  limitPrice?: number;
  status?: "open" | "filled" | "partially_filled" | "cancelled";
}

export interface OrderResponse {
  id: string;
  userId: string;
  asset: "BTC" | "ETH" | "SOL" | "BNB";
  type: "market" | "limit";
  side: "buy" | "sell";
  amount: number;
  originalAmount: number;
  filledAmount: number;
  remainingAmount: number;
  limitPrice?: number;
  executionPrice?: number;
  status: "open" | "filled" | "partially_filled" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

// Model files: define data schemas and interact with the database

import mongoose, { Schema, Document } from "mongoose";

export interface IOrder extends Document {
  userId: string;
  asset: "BTC" | "ETH" | "SOL" | "XRP";
  type: "market" | "limit";
  side: "buy" | "sell";
  amount: number;
  limitPrice?: number;
  status: "open" | "filled" | "cancelled";
}


const OrderSchema: Schema = new Schema(
  {
    userId: { type: String, required: true },

    asset: { type: String, enum: ["BTC", "ETH", "SOL", "XRP"], required: true },

    type: { type: String, enum: ["market", "limit"], required: true },
    side: { type: String, enum: ["buy", "sell"], required: true },

    amount: { type: Number, required: true },

    // Only for limit orders
    limitPrice: { type: Number, required: false },

    status: {
      type: String,
      enum: ["open", "filled", "cancelled"],
      default: "open",
    },
  },
  { timestamps: true }
);

export default mongoose.model<IOrder>("Order", OrderSchema);

// ---- Request / Response Types ----

export interface CreateOrderBody {
  asset: "BTC" | "ETH" | "SOL" | "XRP";
  type: "market" | "limit";
  side: "buy" | "sell";
  amount: number;
  limitPrice?: number;
}

export interface UpdateOrderBody {
  amount?: number;
  limitPrice?: number;
  status?: "open" | "filled" | "cancelled";
}

export interface OrderResponse {
  id: string;
  userId: string;
  asset: "BTC" | "ETH" | "SOL" | "XRP";
  type: "market" | "limit";
  side: "buy" | "sell";
  amount: number;
  limitPrice?: number;
  status: "open" | "filled" | "cancelled";
  
}

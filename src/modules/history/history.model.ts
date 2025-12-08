import { Schema, model, Document, Types } from "mongoose";

// can add stake and unstake if necessary
export type HistoryType = "BUY" | "SELL" | "DEPOSIT" | "WITHDRAW";

export interface HistoryDocument extends Document {
  account: Types.ObjectId;
  type: HistoryType;
  asset: string; // BTC, XRP ...
  amount: number;
  price?: number | null; // optional
  createdAt: Date;
  updatedAt: Date;
  status: string;
}

const historySchema = new Schema<HistoryDocument>(
  {
    account: {
      type: Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    type: {
      type: String,
      enum: ["BUY", "SELL", "DEPOSIT", "WITHDRAW"],
      required: true,
    },
    asset: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    price: {
      type: Number,
      required: false,
    },
    status: {
      type: String,
      enum: ["Filled", "Partially Filled", "Cancelled"],
      default: "Filled",
    },
  },
  { timestamps: true }
);

export const HistoryModel = model<HistoryDocument>("History", historySchema);

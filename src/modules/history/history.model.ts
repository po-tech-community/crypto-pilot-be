import { Schema, model, Document, Types } from "mongoose";

// 1. Define Enums to serve as the single source of truth
export enum HistoryType {
  BUY = "BUY",
  SELL = "SELL",
  DEPOSIT = "DEPOSIT",
  WITHDRAW = "WITHDRAW",
}

export enum HistoryStatus {
  FILLED = "FILLED",
  PARTIALLY_FILLED = "PARTIALLY_FILLED",
  CANCELLED = "CANCELLED",
}

export interface HistoryDocument extends Document {
  account: Types.ObjectId;
  type: HistoryType;
  asset: string;
  amount: number;
  price?: number | null;
  createdAt: Date;
  updatedAt: Date;
  status: HistoryStatus;
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
      enum: Object.values(HistoryType),
      required: true,
    },
    asset: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
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
      enum: Object.values(HistoryStatus),
      default: HistoryStatus.FILLED,
    },
  },
  { timestamps: true }
);

export const HistoryModel = model<HistoryDocument>("History", historySchema);

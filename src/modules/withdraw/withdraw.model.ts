import mongoose, { Schema } from "mongoose";
import { WithdrawDocs } from "./withdraw.types";

const WithdrawSchema = new Schema<WithdrawDocs>(
  {
    userId: { type: String, required: true, index: true, ref:'User' },
    asset: { type: String, required: true, trim: true },
    network: { type: String, required: true, trim: true, unique:false },
    address: { type: String, required: true, trim: true, unique:false },
    amount: { type: String, required: true, default: "0" },
    fee: {type: Number, required: true, default: 0},
    memo: {type: String, required: false, default: ""},
    txHash: { type: String, required: false, default: null },
    confirmations: { type: Number, required: true, default: 0 },
    status: {type: String, required: true, default: "PENDING"},
    processedAt: {type: Date},
    completedAt: {type: Date}
  },
  { timestamps: true }
);

WithdrawSchema.index({ userId: 1, createdAt: -1 });
WithdrawSchema.index({ network: 1, txHash: 1 }, { unique: true, sparse: true });

const Withdraw = mongoose.model<WithdrawDocs>("Withdraw", WithdrawSchema);

export default Withdraw
import mongoose from "mongoose";
import Withdraw from "./withdraw.model";
import type { CreateWithdrawInput, UpdateWithdrawQuery, WithdrawDocs, WithdrawQuery, WithdrawResponse } from "./withdraw.types";


export async function createWithdraw(userId: string, input: CreateWithdrawInput): Promise<WithdrawDocs>{
    const doc = await Withdraw.create({
        userId: userId,
        asset: input.asset,
        network: input.network,
        address: input.address,
        amount: input.amount ?? "0",
        fee: input.fee ?? "1",
        memo: input.memo ?? "",
        txHash: input.txHash ?? "",
        confirmations: 0,
        status: "PENDING",
      });
      return doc.toObject();
}

export async function getWithdraw(id: string): Promise<WithdrawDocs>{
    if (!mongoose.isValidObjectId(id)){
        throw new Error("Internal server")
    };
    const data = await Withdraw.findById(id).lean()
    if(!data){
        throw new Error("Could not find data")
    }
    return data
}

export async function getListWithDraw(query: WithdrawQuery, opts?: { limit?: number; offset?: number }): Promise<WithdrawDocs[]>{
    const limit = opts?.limit ?? 50;
    const offset = opts?.offset ?? 0;

    
    if (limit < 1 || limit > 200) throw new Error("limit must be between 1 and 200");
    if (offset < 0) throw new Error("offset must be >= 0");

    const data = await Withdraw.find(query).sort({ createdAt: -1 })
          .skip(offset)
          .limit(limit)
          .lean<WithdrawDocs[]>()
          .exec();

    return data
}

export async function findMany(query: WithdrawQuery){
    const data = await Withdraw.find(query).sort({ createdAt: -1 })
        .lean()
        .exec();
    return data
}

export async function updateWithDraw(id: string, patch: UpdateWithdrawQuery): Promise<WithdrawDocs | null>{
    if (!mongoose.isValidObjectId(id)) return null;
  
    const updated = await Withdraw.findByIdAndUpdate(
    id,
    { $set: patch },
    { new: true }
    )
    .lean<WithdrawDocs>()
    .exec();

    return updated ?? null;
}
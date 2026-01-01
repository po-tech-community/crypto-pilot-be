import mongoose from "mongoose";
import { NetworkKey } from "../constantAssets/asset.model";


export type WithdrawStatus  = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
  

export interface WithdrawDocs {
    _id: mongoose.Types.ObjectId;
    userId: string;
    asset: string;
    network: NetworkKey;
    address: string;
    amount: string;
    fee: number;
    memo?: string | null;
    txHash?: string | null;
    confirmations: number;
    status: string;
    createdAt: Date;
    processedAt?: Date | null;
    completedAt?: Date | null;
}

export interface WithdrawResponse{
  asset: string;
  network: NetworkKey;
  address: string;
  amount: string;
  fee: number;
  memo?: string | null;
  txHash?: string | null;
  confirmations: number;
  status: string;
  createdAt: Date;
  processedAt?: Date | null;
  completedAt?: Date | null;
}
export interface CreateWithdrawInput {
  userId: string;
  asset: string;
  network: NetworkKey;
  address: string;
  amount: string;
  fee: number;
  memo?: string | null;
  txHash?: string | null;
  confirmations: number;
  status: string;
  createdAt: Date;
  processedAt?: Date | null;
  completedAt?: Date | null;
}

export type WithdrawQuery = Partial<{
  userId: string;
  asset?: string;
  network?: string;
  status?: WithdrawStatus;
}>;

export type UpdateWithdrawQuery = Partial<{
  asset: string;
  network: string;
  address: string;
  amount: string;
  fee: string;
  memo?: string | null;
  txHash: string | null;
  confirmations: number;
  status: WithdrawStatus;
  processedAt?: Date | null;
  completedAt?: Date | null;
}>;
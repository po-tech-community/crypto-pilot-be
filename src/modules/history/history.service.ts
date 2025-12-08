// functions that represent use cases:

import { Types } from "mongoose";
import { HistoryModel, HistoryDocument, HistoryType } from "./history.model";

interface CreateHistoryDa {
  accountId: string;
  type: HistoryType;
  asset: string;
  amount: number;
  price?: number | null;
}

interface UpdateHistoryDa {
  type?: HistoryType;
  asset?: string;
  amount?: number;
  price?: number | null;
}
export async function seedMockHistory(): Promise<HistoryDocument[]> {
  //  two fake accounts
  const account1 = new Types.ObjectId("65e3c60dc1a5f43ecff11111");
  const account2 = new Types.ObjectId("65e3c60dc1a5f43ecff22222");

  const mockData = [
    {
      account: account1,
      type: "BUY" as HistoryType,
      asset: "BTC",
      amount: 0.015,
      price: 120000,
      status: "Filled",
    },
    {
      account: account1,
      type: "SELL" as HistoryType,
      asset: "ETH",
      amount: 0.8,
      price: 4230.5,
      status: "Partially Filled",
    },
    {
      account: account2,
      type: "BUY" as HistoryType,
      asset: "SOL",
      amount: 12,
      price: 210.3,
      status: "Filled",
    },
    {
      account: account2,
      type: "SELL" as HistoryType,
      asset: "BTC",
      amount: 0.01,
      price: 96900,
      status: "Cancelled",
    },
  ];

  await HistoryModel.deleteMany({});

  const inserted = await HistoryModel.insertMany(mockData);
  return inserted;
}

export async function createHistoryEntry(
  data: CreateHistoryDa
): Promise<HistoryDocument> {
  if (data.amount <= 0) {
    throw new Error("Amount must be positive");
  }
  if (!Types.ObjectId.isValid(data.accountId)) {
    throw new Error("Invalid accountId");
  }

  const entry = await HistoryModel.create({
    account: data.accountId,
    type: data.type,
    asset: data.asset,
    amount: data.amount,
    price: data.price ?? undefined,
  });

  return entry;
}

export async function listHistory(
  accountId?: string
): Promise<HistoryDocument[]> {
  const query: any = {};
  if (accountId) {
    if (!Types.ObjectId.isValid(accountId)) {
      throw new Error("Invalid accountId");
    }
    query.account = accountId;
  }
  //sort newest to return the promise
  return HistoryModel.find(query).sort({ createdAt: -1 }).exec();
}

export async function getHistoryEntry(
  id: string
): Promise<HistoryDocument | null> {
  if (!Types.ObjectId.isValid(id)) return null;
  return HistoryModel.findById(id).exec();
}

export async function updateHistoryEntry(
  id: string,
  data: UpdateHistoryDa
): Promise<HistoryDocument | null> {
  if (!Types.ObjectId.isValid(id)) return null;

  const update: any = {};
  if (data.type) update.type = data.type;
  if (data.asset) update.asset = data.asset;
  if (typeof data.amount === "number") update.amount = data.amount;
  if (typeof data.price === "number" || data.price === null)
    update.price = data.price;

  const entry = await HistoryModel.findByIdAndUpdate(id, update, {
    new: true,
  }).exec();
  return entry;
}

export async function deleteHistoryEntry(id: string): Promise<boolean> {
  if (!Types.ObjectId.isValid(id)) return false;
  const res = await HistoryModel.findByIdAndDelete(id).exec();
  return !!res;
}

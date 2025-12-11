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

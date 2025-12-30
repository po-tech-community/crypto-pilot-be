import mongoose, { Schema } from "mongoose";

/**
 * Domain types (still OK to define here)
 * The MODEL layer is allowed to define data shapes and persistence details.
 */
export type DepositStatus = "PENDING" | "COMPLETED" | "FAILED";

export type DepositDoc = {
  _id: mongoose.Types.ObjectId;
  userId: string;
  asset: string;
  network: string;
  address: string;
  amount: string;
  txHash?: string | null;
  confirmations: number;
  status: DepositStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateDepositInput = {
  userId: string;
  asset: string;
  network: string;
  address: string;
  amount?: string;
};

export type UpdateDepositInput = Partial<{
  asset: string;
  network: string;
  address: string;
  amount: string;
  txHash: string | null;
  confirmations: number;
  status: DepositStatus;
}>;

export type DepositQuery = Partial<{
  userId: string;
  asset: string;
  network: string;
  status: DepositStatus;
}>;


type FindDepositQuery = Partial<{
  userId: string;
  asset: string;
  network: string;
  address: string;
  txHash: string;
  status: DepositStatus;
}>;

const DepositSchema = new Schema<DepositDoc>(
  {
    userId: { type: String, required: true, index: true, ref:'User' },
    asset: { type: String, required: true, trim: true },
    network: { type: String, required: true, trim: true, unique:false },
    address: { type: String, required: true, trim: true, unique:false },
    amount: { type: String, required: true, default: "0" },
    txHash: { type: String, required: false, default: null },
    confirmations: { type: Number, required: true, default: 0 },
    status: {
      type: String,
      required: true,
      enum: ["PENDING", "COMPLETED", "FAILED"],
      default: "PENDING",
    },
  },
  { timestamps: true }
);

DepositSchema.index({ userId: 1, createdAt: -1 });
DepositSchema.index({ network: 1, txHash: 1 }, { unique: true, sparse: true });

const Deposit = mongoose.model<DepositDoc>("Deposit", DepositSchema);

export const depositModel = {
  async create(input: CreateDepositInput): Promise<DepositDoc> {
    const doc = await Deposit.create({
      userId: input.userId,
      asset: input.asset,
      network: input.network,
      address: input.address,
      amount: input.amount ?? "0",
      confirmations: 0,
      status: "PENDING",
    });
    return doc.toObject();
  },

  async findById(id: string): Promise<DepositDoc | null> {
    if (!mongoose.isValidObjectId(id)) return null;
    const doc = await Deposit.findById(id).lean<DepositDoc>().exec();
    return doc ?? null;
  },

  async findByOne(
    query: FindDepositQuery
  ): Promise<DepositDoc | null> {
    const doc = await Deposit.findOne(query)
      .lean<DepositDoc>()
      .exec();
  
    return doc ?? null;
  },
  
  async findMany(
    query: FindDepositQuery
  ): Promise<DepositDoc[]> {
    return Deposit.find(query).lean().exec();
  },
  

  async list(
    query: DepositQuery,
    limit = 50,
    offset = 0
  ): Promise<DepositDoc[]> {
    const mongoQuery: Record<string, any> = {};

    if (query.userId) {
      if (!query.userId){
        return []
      };
      mongoQuery.userId = query.userId;
    }
    if (query.asset) mongoQuery.asset = query.asset;
    if (query.network) mongoQuery.network = query.network;
    if (query.status) mongoQuery.status = query.status;

    return Deposit.find(mongoQuery)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .lean<DepositDoc[]>()
      .exec();
  },

  async updateById(
    id: string,
    patch: UpdateDepositInput
  ): Promise<DepositDoc | null> {
    if (!mongoose.isValidObjectId(id)) return null;

    const updated = await Deposit.findByIdAndUpdate(
      id,
      { $set: patch },
      { new: true }
    )
      .lean<DepositDoc>()
      .exec();

    return updated ?? null;
  },

  async deleteById(id: string): Promise<boolean> {
    if (!mongoose.isValidObjectId(id)) return false;
    const res = await Deposit.deleteOne({ _id: id }).exec();
    return res.deletedCount === 1;
  },
};

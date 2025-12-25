import { CreateDepositInput, DepositDoc, DepositQuery, UpdateDepositInput, depositModel } from "./deposit.model";


export class NotFoundError extends Error {
  constructor(message = "Not found") {
    super(message);
    this.name = "NotFoundError";
  }
}
export class ValidationError extends Error {
  constructor(message = "Validation error") {
    super(message);
    this.name = "ValidationError";
  }
}


function isPositiveDecimalString(v: string): boolean {
  
  return /^(?:0|[1-9]\d*)(?:\.\d+)?$/.test(v);
}


export const depositService = {
  async createDeposit(input: CreateDepositInput): Promise<DepositDoc> {
    if (!input.userId) throw new ValidationError("userId is required");
    if (!input.asset) throw new ValidationError("asset is required");
    if (!input.network) throw new ValidationError("network is required");
    if (!input.address) throw new ValidationError("address is required");

    if (input.amount !== undefined && !isPositiveDecimalString(input.amount)) {
      throw new ValidationError("amount must be a positive decimal string");
    }

    
    return depositModel.create(input);
  },

  async getDeposit(id: string): Promise<DepositDoc> {
    const dep = await depositModel.findById(id);
    if (!dep) throw new NotFoundError("Deposit not found");
    return dep;
  },

  async listDeposits(query: DepositQuery, opts?: { limit?: number; offset?: number }): Promise<DepositDoc[]> {
    const limit = opts?.limit ?? 50;
    const offset = opts?.offset ?? 0;

    
    if (limit < 1 || limit > 200) throw new ValidationError("limit must be between 1 and 200");
    if (offset < 0) throw new ValidationError("offset must be >= 0");

    return depositModel.list(query, limit, offset);
  },

  async updateDeposit(id: string, patch: UpdateDepositInput): Promise<DepositDoc> {
    
    if (patch.amount !== undefined && !isPositiveDecimalString(patch.amount)) {
      throw new ValidationError("amount must be a positive decimal string");
    }
    if (patch.confirmations !== undefined && patch.confirmations < 0) {
      throw new ValidationError("confirmations must be >= 0");
    }
    if (patch.status === "COMPLETED" && !patch.txHash) {
      throw new ValidationError("txHash is required to mark deposit COMPLETED");
    }

    
    const existing = await this.getDeposit(id);
    if (existing.status === "COMPLETED") {
      
      throw new ValidationError("COMPLETED deposits cannot be modified");
    }

    const updated = await depositModel.updateById(id, patch);
    if (!updated) throw new NotFoundError("Deposit not found");
    return updated;
  },

  async deleteDeposit(id: string): Promise<void> {
    
    await this.getDeposit(id);

    const ok = await depositModel.deleteById(id);
    if (!ok) throw new NotFoundError("Deposit not found");
  },
};

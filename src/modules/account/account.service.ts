// Service files: interact with the database

import Account, {
  IAccount,
  CreateAccountBody,
  UpdateAccountBody,
  AccountResponse,
} from "./account.model";

const toResponse = (doc: IAccount): AccountResponse => ({
  id: doc._id.toString(),
  name: doc.name,
  email: doc.email,
});

export const getAllAccounts = async (): Promise<AccountResponse[]> => {
  const accounts = await Account.find();
  return accounts.map(toResponse);
};

export const getAccountById = async (
  id: string
): Promise<AccountResponse | null> => {
  const account = await Account.findById(id);
  return account ? toResponse(account) : null;
};

export const createAccount = async (
  data: CreateAccountBody
): Promise<AccountResponse> => {
  const account = new Account(data);
  const saved = await account.save();
  return toResponse(saved);
};

export const updateAccount = async (
  id: string,
  data: UpdateAccountBody
): Promise<AccountResponse | null> => {
  const updated = await Account.findByIdAndUpdate(id, data, { new: true });
  return updated ? toResponse(updated) : null;
};

export const deleteAccount = async (id: string): Promise<boolean> => {
  const deleted = await Account.findByIdAndDelete(id);
  return !!deleted;
};

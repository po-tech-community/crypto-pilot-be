// Model files: define data schemas and interact with the database

import mongoose, { Schema, Document } from "mongoose";

export interface IAccount extends Document {
  name: string;
  email: string;
}

const AccountSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

export default mongoose.model<IAccount>("Account", AccountSchema);

// ---- Request/Response Types ----

export interface CreateAccountBody {
  name: string;
  email: string;
}

export interface UpdateAccountBody {
  name?: string;
  email?: string;
}

export interface AccountResponse {
  id: string;
  name: string;
  email: string;
}

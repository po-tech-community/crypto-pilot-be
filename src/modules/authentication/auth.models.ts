import mongoose, { Schema, Document } from "mongoose";
export enum ERole {
  user = "user",
  admin = "admin",
}
export interface IUser extends Document {
  userId: string;
  name: string;
  email: string;
  password: string;
  role: ERole;
  emailConfirm?: boolean;
  refreshToken?: string;
  isActive?: boolean;
  updatedBy?: string;
}

const UserSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, unique: true },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    role: {
      type: String,
      enum: Object.values(ERole),
      default: ERole.user,
    },
    emailConfirm: { type: Boolean, required: false, default: false },
    refreshToken: { type: String, required: false },
    isActive: { type: Boolean, require: false, default: true },
    updatedBy: { type: String, required: false },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", UserSchema);

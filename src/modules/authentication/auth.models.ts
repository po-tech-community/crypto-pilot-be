import mongoose, { Schema, Document } from "mongoose";
export interface IUser extends Document {
  userId: string;
  email: string;
  password: string;
  role: "user" | "admin";
  emailConfirm?: boolean;
  refreshToken:string;
  resetPasswordToken:string | undefined;
  resetPasswordExpire:number | undefined;

}

const UserSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role:{type:String,required: true, default: "user"},
    emailConfirm:{type:Boolean,required: false, default: false},
    refreshToken: { type: String, required: false },
    resetPasswordToken: { type: String, required: false },
    resetPasswordExpire: { type: Number,required: false },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", UserSchema);
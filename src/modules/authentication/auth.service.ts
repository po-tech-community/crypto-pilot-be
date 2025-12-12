import mongoose from "mongoose";
import User, { IUser } from "./auth.models";
import { RegisterRequest } from "./auth.types";

export const FindAccount = async (
  fields: Record<string, any>
): Promise<IUser | null> => {
  try {
    const user = await User.findOne({ ...fields, isActive: true });
    return user;
  } catch (err) {
    throw new Error("Failed to get user");
  }
};

export const RegisterAccount = async (
  data: RegisterRequest,
  session?: mongoose.ClientSession
): Promise<IUser> => {
  try {
    const new_user = new User(data);
    if (session) {
      await new_user.save({ session });
    } else {
      await new_user.save();
    }
    return new_user;
  } catch (err) {
    throw new Error("Failed to create user");
  }
};

export const UpdateAccount = async (
  userId: string,
  updateData: Partial<IUser>
): Promise<IUser | null> => {
  return await User.findOneAndUpdate({ userId }, updateData, { new: true });
};

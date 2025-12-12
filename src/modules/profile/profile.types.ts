import mongoose from "mongoose";
import { IProfile } from "./profile.model";

export interface ProfileRequest {
  userId: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  joinDate: Date;
  phone?: string;
  countryId?: mongoose.Types.ObjectId;
}

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  avatar?: string;
  phone?: string;
  countryId?: mongoose.Types.ObjectId;
}


export interface ProfileResponse {
  userId: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  avatar?: string;
  joinDate: Date;
  phone?: string;
  countryId?: mongoose.Types.ObjectId;
}

export const toResponseProfile = (doc: IProfile): ProfileResponse => ({
  userId: doc.userId,
  firstName: doc.firstName,
  lastName: doc.lastName,
  avatar: doc.avatar,
  joinDate: doc.joinDate,
  phone: doc.phone,
  countryId: doc.countryId,
});

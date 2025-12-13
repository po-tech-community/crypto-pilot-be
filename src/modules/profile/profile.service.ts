import { PopulateOptions } from "mongoose";
import Profile, { IProfile } from "./profile.model";
import {
  ProfileRequest,
  ProfileResponse,
  UpdateProfileRequest,
} from "./profile.types";

export const AddProfile = async (data: ProfileRequest): Promise<IProfile> => {
  try {
    const newProfile = await new Profile(data);
    await newProfile.save();
    return newProfile;
  } catch (err) {
    console.error(err);
    throw new Error("Failed to create user");
  }
};

export const FindProfile = async (
  fields: Record<string, any>,
  pop?: PopulateOptions | PopulateOptions[] | null
): Promise<IProfile | null> => {
  try {
    let query = Profile.findOne(fields);
    if (pop) {
      query = query.populate(pop);
    }
    const profile = await query.exec();
    return profile;
  } catch (err) {
    throw new Error("Failed to get profile");
  }
};

export const UpdatedProfile = async (
  userId: string,
  data: UpdateProfileRequest
): Promise<ProfileResponse | null> => {
  const updated = await Profile.findOneAndUpdate({ userId: userId }, data, {
    new: true,
  });
  return updated;
};

export const GetAll = async (
  pop?: PopulateOptions | PopulateOptions[] | null
): Promise<IProfile[]> => {
  try {
    let query = Profile.find({});

    if (pop) {
      query = query.populate(pop);
    }

    const profiles = await query.exec();
    return profiles;
  } catch (err) {
    throw new Error("Failed to get profiles");
  }
};

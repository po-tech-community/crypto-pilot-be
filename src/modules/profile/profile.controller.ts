import { Request, Response } from "express";
import {
  ProfileResponse,
} from "./profile.types";
import { FindProfile, GetAll, UpdatedProfile } from "./profile.service";
import { PopulateOptions, Types } from "mongoose";
import { toProfileDTO } from "./profile.utils";
import { AuthRequest } from "../authentication/auth.types";

const PHONE_REGREX = /^(\d{3})-(\d{3})-(\d{4})$/;

const popOptions: PopulateOptions[] = [
  {
    path: "userId",
    model: "User",
    select: "email",
    foreignField: "userId",
    localField: "userId",
  },
  {
    path: "countryId",
    model: "Country",
    select: "name code",
  },
];
export const GetAllProfile = async (
  req: AuthRequest,
  res: Response<{}, ProfileResponse[]>
) => {
  try {
    
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const profiles = await GetAll(popOptions);

    return res.status(200).json({ data: profiles });
  } catch {
    return res.status(500).json({ message: "Server Error" });
  }
};

export const GetProfile = async (
  req: AuthRequest,
  res: Response<{}, ProfileResponse>
) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const profile = await FindProfile({ userId }, popOptions);
    if (!profile) {
      return res.status(404).json({ message: "Not Found" });
    }

    return res.status(200).json({ data: toProfileDTO(profile) });
  } 
  catch {
    return res.status(500).json({ message: "Server Error" });
  }
};

export const UpdateProfile = async (
  req: AuthRequest,
  res: Response<{}, ProfileResponse>
) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const profile_ = await FindProfile({ userId });
    if (!profile_) {
      return res.status(404).json({ message: "Not Found" });
    }

    const { firstName, lastName, avatar, phone, countryId } = req.body;

    if (!firstName || !lastName) {
      return res
        .status(400)
        .json({ message: "first name or last name cannot be empty" });
    }

    if (phone && !PHONE_REGREX.test(phone)) {
      return res
        .status(400)
        .json({ message: "invalid phone format" });
    }

    const data = {
      userId,
      firstName,
      lastName,
      avatar: avatar ?? undefined,
      phone,
      countryId,
    };

    await UpdatedProfile(userId, data);

    const profile = await FindProfile({ userId }, popOptions);

    return res.status(200).json({ data: toProfileDTO(profile) });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server Error" });
  }
};

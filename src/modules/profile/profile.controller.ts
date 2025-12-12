import { Request, Response } from "express";
import {
  ProfileRequest,
  ProfileResponse,
  UpdateProfileRequest,
} from "./profile.types";
import { verifyToken } from "../authentication/auth.utils";
import {
  AddProfile,
  FindProfile,
  GetAll,
  UpdatedProfile,
} from "./profile.service";
import { PopulateOptions, Types } from "mongoose";
import { toProfileDTO } from "./profile.utils";
import { ERole } from "../authentication/auth.models";

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
  req: Request<{}, {}, ProfileRequest>,
  res: Response<{}, ProfileResponse[]>
) => {
  try {
    const token = req.cookies.access_token;
    if (!token) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    const decoded = await verifyToken(token);
    if (!decoded || !decoded.userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: Invalid or expired token." });
    }
    if (!decoded || decoded.role != ERole.admin) {
      return res.status(403).json({ message: "Access denied" });
    }

    const profile = await GetAll(popOptions);

    res.status(200).json({ data: profile });
  } catch (err) {
    return res.status(500).json({ message: "Server Error" });
  }
};

export const CreateProfile = async (
  req: Request<{}, {}, ProfileRequest>,
  res: Response<{}, ProfileResponse>
) => {
  try {
    const token = req.cookies.access_token;
    if (!token) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    const decoded = await verifyToken(token);
    if (!decoded || !decoded.userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: Invalid or expired token." });
    }
    const profile = await FindProfile({ userId: decoded.userId });
    if (profile) {
      return res.status(400).json({ message: "Profile already created" });
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
        .json({ message: "Invalid phone number" });
    }
    const data = {
      userId: decoded.userId,
      firstName: firstName,
      lastName: lastName,
      avatar: avatar ?? undefined,
      joinDate: new Date(Date.now()),
      phone: phone,
      countryId: (countryId === null || countryId?.toString() === "") ? new Types.ObjectId("69365d89d6ebcc3c6f4affa9") : countryId,
    };
    const addNew = await AddProfile(data);

    res.status(200).json({ data: addNew, message: "Created" });
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: "Server Error" });
  }
};

export const GetProfile = async (
  req: Request<{}, {}, ProfileRequest>,
  res: Response<{}, ProfileResponse>
) => {
  try {
    const token = req.cookies.access_token;
    if (!token) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    const decoded = await verifyToken(token);
    if (!decoded || !decoded.userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: Invalid or expired token." });
    }


    const profile = await FindProfile(
      { userId: decoded.userId},
      popOptions
    );
    if (!profile) {
      return res.status(404).json({ message: "Not Found" });
    }
    res.status(200).json({ data: toProfileDTO(profile) });
  } catch (err) {
    return res.status(500).json({ message: "Server Error" });
  }
};

export const UpdateProfile = async (
  req: Request<{}, {}, UpdateProfileRequest>,
  res: Response<{}, ProfileResponse>
) => {
  try {
    const token = req.cookies.access_token;
    if (!token) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    const decoded = await verifyToken(token);
    if (!decoded || !decoded.userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: Invalid or expired token." });
    }
  
    const profile_ = await FindProfile({
      userId: decoded.userId
    });
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
        .json({ message: "first name or last name cannot be empty" });
    }
    const data = {
      userId: decoded.userId,
      firstName: firstName,
      lastName: lastName,
      avatar: avatar ?? undefined,
      joinDate: new Date(Date.now()),
      phone: phone,
      countryId: countryId,
    };
    await UpdatedProfile(decoded.userId, data);

    const profile = await FindProfile(
      { userId: decoded.userId},
      popOptions
    );

    res.status(200).json({ data: toProfileDTO(profile) });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server Error" });
  }
};



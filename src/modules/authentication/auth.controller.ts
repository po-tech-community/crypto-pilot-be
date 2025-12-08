import { Request, Response } from "express";
import {
  RegisterResponse,
  RegisterRequest,
  LoginRequest,
  LoginResponse,
  AuthRequest,
  ForgotRequest,
  ForgotResponse,
  ResetRequest,
  ResetResponse,
} from "./auth.types";
import {
  hashedString,
  htmlTemplate,
  isValidEmail,
  refreshToken,
  signToken,
  verifyHashedString,
  verifyRefreshToken,
} from "./auth.utils";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";
import { sendEmail } from "../../utils/sendemail";
import jwt from "jsonwebtoken";
import { FindAccount, RegisterAccount, UpdateAccount } from "./auth.service";

export const SignUp = async (
  req: Request<RegisterRequest>,
  res: Response<RegisterResponse>
) => {
  const { email, password, confirmPassword, role } = req.body;
  if(!email || !password){
    return res.status(400).json({ message: "Missing email or password" });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ message: "Invalid email" });
  }
  const user = await FindAccount({email:email})
  if (user) {
    return res.status(400).json({ message: "Email already exists" });
  }
  if(typeof password ==="string" && password.length < 6){
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  }
  try {
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    } else {
      const hashedPassword = await hashedString(password);

      const data = {
        userId: uuidv4(),
        email: email,
        password: hashedPassword,
        role: role ?? "user",
      };

      const new_user = await RegisterAccount(data);

      const token = signToken({
        userId: new_user.userId,
        role: new_user.role,
      });

      res.status(200).json({ message: "User Created", token: token });
    }
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

export const SignIn = async (
  req: Request<LoginRequest>,
  res: Response<LoginResponse>
) => {
  const { email, password } = req.body;
  if (!isValidEmail(email)) {
    return res.status(400).json({ message: "Invalid email" });
  }
  try {
    const user = await FindAccount({email:email})
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const match = await verifyHashedString(user.password, password);
    if (!match) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const token = signToken({
      userId: user.userId,
      role: user.role,
    });
    const refreshToken_ = refreshToken({
      userId: user.userId,
      role: user.role,
    });
        user.refreshToken = await hashedString(refreshToken_);
    await user.save();

    res.cookie("access_token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refresh_token", refreshToken_, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 1000,
    });

    return res.status(200).json({
      token,
      message: "Login success",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const RefreshTokenHandler = async (req: Request, res: Response) => {
  const refresh_token = req.cookies.refresh_token;
  if (!refresh_token) {
    return res.status(401).json({ message: "No refresh token" });
  }
  try {
    const decoded: any = verifyRefreshToken(refresh_token);

    const user = await FindAccount({userId: decoded.userId});
    if(user){
      const userRefreshToken = await verifyHashedString(user!.refreshToken as string, refresh_token)
      if (!userRefreshToken) {
        return res.status(403).json({ message: "Invalid refresh token" });
      }
  
      const newAccessToken = signToken({
        userId: user!.userId,
        role: user!.role,
      });
  
      res.cookie("access_token", newAccessToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 15 * 60 * 1000,
      });
  
      res.status(200).json({ message: "Access token refreshed" });
    }
    else{
      return res.status(400).json({ message: "Invalid access token refreshed" });
    }
    
    
  } catch (err) {
    console.log(err);
    return res
      .status(403)
      .json({ message: "Expired or invalid refresh token" });
  }
};

export const ForgotPassword = async (
  req: Request<ForgotRequest>,
  res: Response<ForgotResponse>
) => {
  const { email } = req.body;
  if (!isValidEmail(email)) {
    return res.status(400).json({ message: "Invalid email" });
  }
  const existedUser = await FindAccount({email:email})
  if (!existedUser) {
    return res.status(400).json({ message: "Invalid email" });
  }
  try {

    //* Create random reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashed = crypto.createHash("sha256").update(resetToken).digest("hex");
   
    //* store hased random reset token with expiration to force the link lives only 5 minutes
    existedUser.resetPasswordToken = hashed;
    existedUser.resetPasswordExpire = Date.now() + 1000 * 60 * 5

    await existedUser.save();

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    await sendEmail(
      existedUser.email,
      "Reset your CryptoPilot password",
      htmlTemplate(resetLink)
    );
    res.status(200).json({ message: "Password reset link sent to email" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const ResetPassword = async (
  req: Request<ResetRequest>,
  res: Response<ResetResponse>
) => {
  const { token, password } = req.body;
  if(typeof password === "string" && password.length < 6){
    
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  }
  //* we need this hashed token here because we are comparing the token which getting from cookie and database (hashed)
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
 
  const user = await FindAccount({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({ message: "Invalid email" });
  }

  try {
    user.password = await hashedString(password);

    user.refreshToken = undefined;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined

    user.emailConfirm = true;

    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};


export const Profile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await FindAccount({userId:req.user!.userId})
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({
      message: "Successfully",
      data: {
        email: user.email,
        userId: user.userId,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const Logout = async (req: Request, res: Response) => {
  try{
    const token = req.cookies.refresh_token;
    if (token) {
      const decoded: any = jwt.decode(token);
      if (decoded?.userId) {
        await UpdateAccount(decoded.userId,{refreshToken: undefined})
      }
    }

    res.clearCookie("access_token");
    res.clearCookie("refresh_token");

    res.status(204).send();
  }
  catch(err){
    return res.status(500).json({ message: "Server error" })
  }
  
};

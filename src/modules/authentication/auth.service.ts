import {Request, Response} from 'express';
import User from './auth.models'
import { RegisterResponse, RegisterRequest, LoginRequest, LoginResponse, AuthRequest, ForgotRequest, ForgotResponse, ResetRequest, ResetResponse } from './auth.types';
import { hashPassword, isValidEmail, refreshToken, signToken, verifyRefreshToken } from './auth.utils';
import { v4 as uuidv4 } from "uuid";
import { verify as verifyPassword } from "argon2";
import crypto from "crypto";
import { sendEmail } from '../../utils/sendemail';
import jwt from "jsonwebtoken";

export const SignUp = async (req: Request<RegisterRequest>,res: Response<RegisterResponse>) =>{

    const {email,password,confirmPassword,role} = req.body
    if(!isValidEmail(email)){
        return res.status(400).json({ message: "Invalid email" });
    }
    const user = await User.findOne({email})
    if (user){
      return res.status(400).json({ message: "Email already exists" });
    }
    try{
      if(password!== confirmPassword){
       
        return res.status(400).json({ message: "Passwords do not match" });
      }
      else{
        const hashedPassword = await hashPassword(password);
        const new_user = new User({userId:uuidv4(),email: email, password: hashedPassword, role: role===null ? 'user' : role})
        await new_user.save();

        const token = signToken({
            userId: new_user.userId,
            role: new_user.role
        })
        res.status(200).json({message: "User Created",token:token})
      }
    }
    catch (err){
        console.error(err)
      return res.status(500).json({ message: "Server error" })
    }
    
}

export const SignIn = async (req: Request<LoginRequest>,res: Response<LoginResponse>)=>{
    const { email, password } = req.body;
    if(!isValidEmail(email)){
        return res.status(400).json({ message: "Invalid email" });
    }
    try{
        const user = await User.findOne({email})
        if(!user){
            return res.status(400).json({ message: "Invalid credentials" });
        }
        const match = await verifyPassword(user.password, password);
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
        user.refreshToken = refreshToken_;
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
            message: "Login success"
        });

    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" })
  }
}

export const RefreshTokenHandler = async (req: Request,res: Response) =>{
    const refresh_token = req.cookies.refresh_token;
    if (!refresh_token){
        return res.status(401).json({ message: "No refresh token" })
    }
    try {
        const decoded: any = verifyRefreshToken(refresh_token);

        const user = await User.findOne({ userId: decoded.userId });
        

        if (!user || user.refreshToken !== refresh_token) {
            return res.status(403).json({ message: "Invalid refresh token" });
        }

        const newAccessToken = signToken({
            userId: user.userId,
            role: user.role,
        });

        res.cookie("access_token", newAccessToken, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 15 * 60 * 1000,
        });

        res.status(200).json({ message: "Access token refreshed" });

    } catch (err) {
        console.log(err)
        return res.status(403).json({ message: "Expired or invalid refresh token" });
    }
}

export const Profile = async (req: AuthRequest,res: Response) =>{
    try{
        const user = await User.findOne({userId: req.user!.userId}).select("-password")
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
        res.status(200).json({
        message: "Successfully",
        data: {
                email:user.email,
                userId: user.userId,
                role: user.role
            }
        });
    }
    catch(err){
        res.status(500).json({ message: "Server error" });
    }
    
}

export const ForgotPassword = async (req:Request<ForgotRequest>,res:Response<ForgotResponse>)=>{

    const {email} = req.body;
    if(!isValidEmail(email)){
        return res.status(400).json({ message: "Invalid email" });
    }
    const existedUser = await User.findOne({email})
    if(!existedUser){
        return res.status(400).json({ message: "Invalid email" })
    }
    try{
        const resetToken = crypto.randomBytes(32).toString("hex")
        const hashed = crypto.createHash("sha256").update(resetToken).digest("hex")
        existedUser.resetPasswordToken = hashed
        existedUser.resetPasswordExpire = Date.now() + 1000 * 60 * 5 //5 minutes
        await existedUser.save();

        const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`

        await sendEmail(
            existedUser.email,
            "Reset your CryptoPilot password",
            htmlTemplate(resetLink)
        )
        res.status(200).json({ message: "Password reset link sent to email" });


    }
    catch(err){
        console.log(err)
        res.status(500).json({ message: "Server error" });
    }
    
}

export const Logout = async (req:Request, res:Response)=>{
    const token = req.cookies.refresh_token;
    if (token) {
        const decoded: any = jwt.decode(token);
        if (decoded?.userId) {
            await User.updateOne({ userId: decoded.userId }, { $set: { refreshToken: null } });
        }
    }

    res.clearCookie("access_token");
    res.clearCookie("refresh_token");

    return res.status(204).json({ message: "Logged out" });

}

export const ResetPassword = async (req:Request<ResetRequest>, res:Response<ResetResponse>) =>{
    const {token, password} = req.body;

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex")

    const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpire: { $gt: Date.now() }
    })

    if(!user){
        return res.status(400).json({ message: "Invalid email" })
    }

    try{
        user.password = await hashPassword(password)

        user.resetPasswordToken = undefined

        user.resetPasswordExpire = undefined

        user.emailConfirm=true

        await user.save()

        res.status(200).json({ message: "Password reset successful" })
    }
    catch(err){
        res.status(500).json({ message: "Server error" })
    }
}

const htmlTemplate = (resetLink:string)=>{
    const html = `
        <h2>Password Reset Request</h2>
        <p>You requested to reset your password.</p>
        <p>Click the button below:</p>
        <a href="${resetLink}" 
        style="padding: 10px 20px; background: #007bff; color: white; text-decoration: none;">
        Reset Password
        </a>
        <p>If you didn’t request this, just ignore this email.</p>
    `
    return html
}
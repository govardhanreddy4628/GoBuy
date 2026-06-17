// TODO : initiate background job to delete unverified users after 24 hours of registration.     initiate background job to send successful registration email. initiate background job to notify customer to verify email if not verified within 24 hours of registration.
import bcrypt from "bcryptjs";
import crypto, { verify } from "crypto";
import jwt from "jsonwebtoken";
import UserModel from "../models/userModel.js";
import { ApiError } from "../utils/ApiError.js";
import {
  ACCESS_EXPIRES_SEC,
  generateAccessToken,
  generateRefreshToken,
  REFRESH_EXPIRES_SEC,
} from "../utils/generateToken.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Request, Response, NextFunction, CookieOptions } from "express";
import fs from "fs";
import cloudinary from "../config/cloudinary.js";
import validator from "validator";
import redisClient from "../config/connectRedis.js";
import {
  storeSession,
  findSessionByRawToken,
  blacklistRawToken,
  clearAllSessionsForUser,
} from "../utils/redisSessions.js";
import logger from "../utils/logger.js";
import { hashToken } from "../utils/hash.js";
import { sendVerificationEmailUsingNodeMailer } from "../utils/sendEmailUsingNodeMailer.js";
import { getAuthCookieOptions } from "../config/cookies.js";
import { sendVerificationEmailUsingResend } from "../utils/sendVerificationEmailUsingResend.js";
import productModel, { IProduct } from "../models/productModel.js";
import mongoose from "mongoose";
import Order from "../models/orderModel.js";

// ===================== registration =======================
export const registerController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void | any> => {
  try {
    // console.log("BODY:", req.body);
    console.log("FILE:", req.file);

    const { email, password, fullName, confirmPassword, inviteToken } =
      req.body;
    const avatar = req.file?.path || undefined; // Assuming you're using multer for file uploads
    console.log(avatar);

    if (!email || !validator.isEmail(email)) {
      return res.status(400).json({ message: "Valid email is required" });
    }

    if (!password) {
      return res
        .status(400)
        .json(new ApiResponse(400, "Password is Required", null)); //Ensure status codes align with typical conventions (400 for bad requests, avoid using 404 for validation errors).
    }
    // if (!validator.isStrongPassword(password, { minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1, returnScore: false, pointsPerUnique: 1, pointsPerRepeat: 0.5, pointsForContainingLower: 10, pointsForContainingUpper: 10, pointsForContainingNumber: 10, pointsForContainingSymbol: 10 })) {
    //   throw new Error(
    //     "Password must be at least 8 characters long and include uppercase, lowercase, numbers, and symbols"
    //   );
    // }
    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }
    //add validations for remaining fields

    /**
     * -----------------------------------------
     * 🧠 INVITE HANDLING (ADMIN / VENDOR)
     * -----------------------------------------
     */
    let role: "user" | "admin" | "super-admin" = "user";
    let isVerified = false;
    let mfaRequired = false;
    let invitedBy: any = null;

    if (inviteToken) {
      const inviteKey = `admin:invite:${inviteToken}`;
      const inviteRaw = await redisClient.get(inviteKey);
      if (!inviteRaw) {
        return res
          .status(400)
          .json({ message: "Invalid or expired invite link" });
      }

      const invite = JSON.parse(inviteRaw);

      if (invite.email !== email) {
        return res.status(403).json({ message: "Invite email mismatch" });
      }

      role = invite.role; // admin / vendor
      isVerified = true; // email ownership already proven
      mfaRequired = true;
      invitedBy = invite.invitedBy;

      // single-use invite
      await redisClient.del(inviteKey);
    }

    //existing user check (by email)
    const existingUser = await UserModel.findOne({ email }).select(
      "+otp +otpExpiresAt",
    );

    //const verificationToken = crypto.randomBytes(32).toString("hex");
    const otp = crypto.randomInt(100000, 999999).toString();
    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");
    const otpExpiryMs = 10 * 60 * 1000; // 10 minutes

    if (existingUser) {
      if (existingUser.isVerified) {
        // Case 1: User exists and is verified → block registration
        throw new ApiError(400, "User already exists");
      } else {
        // Case 2: User exists but is NOT verified → resend verification email

        // const lastSent = existingUser.otpExpiresAt;
        // const oneMinuteAgo = new Date(Date.now() - 60 * 1000);

        // // Simple throttle: disallow resend more than once per minute.
        // if (lastSent && lastSent > oneMinuteAgo) {
        //   return res
        //     .status(429)
        //     .json({ message: "OTP recently sent. Try again in a minute." });
        // }

        // 🔐 Do NOT allow re-register via invite if user already exists
        if (inviteToken) {
          return res.status(409).json({
            message: "Account already exists. Contact support.",
          });
        }

        existingUser.otp = hashedOtp;
        existingUser.otpExpiresAt = new Date(Date.now() + otpExpiryMs);
        await existingUser.save();

        // intent token to bind OTP verification action (short lived)
        const intentToken = jwt.sign(
          { email: existingUser.email, userId: existingUser.id.toString() }, //actually here no need to use toString() method because mongoose.Document has a built-in getter for .id, and it returns a string by default. ✅ existingUser.id is already a string. ❌ existingUser._id is an ObjectId, and would need .toString()
          process.env.LOGIN_INTENT_SECRET!,
          { expiresIn: "15m" },
        );

        //await sendVerificationEmailUsingResend(existingUser.email, otp);
        await sendVerificationEmailUsingNodeMailer(existingUser.email, otp);

        return res.status(200).json({
          message:
            "User already exists but is not verified. Verification email resent.",
          intentToken,
        });
      }
    }

    // Case 3: New user → create and send verification
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await UserModel.create({
      fullName,
      email,
      password: hashedPassword,
      avatar,
      role,
      invitedBy,
      mfaRequired,
      isVerified,
      otp: inviteToken ? undefined : hashedOtp,
      otpExpiresAt: inviteToken
        ? undefined
        : new Date(Date.now() + otpExpiryMs),
    });

    if (inviteToken) {
      return res.status(201).json({
        message: "Admin account created. Please setup MFA to continue.",
        success: true,
      });
    }

    const intentToken = jwt.sign(
      { email: newUser.email, userId: newUser.id.toString() },
      process.env.LOGIN_INTENT_SECRET!,
      { expiresIn: "15m" },
    );

    await sendVerificationEmailUsingResend(newUser.email, otp);

    return res.status(201).json({
      message: "New user created. Check your email to verify.",
      intentToken,
      success: true,
      error: false,
      isVerified: false,
    });
  } catch (err) {
    next(err);
  }
};

//=====================verify email=====================
export const verifyEmailController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void | any> => {
  try {
    const { otp, intentToken } = req.body;

    if (!otp || !intentToken) {
      throw new ApiError(400, " OTP and intent token are required");
    }

    const decoded = jwt.verify(
      intentToken,
      process.env.LOGIN_INTENT_SECRET!,
    ) as { email: string; userId: string };

    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    const user = await UserModel.findOne({
      email: decoded.email,
      otp: hashedOtp,
      otpExpiresAt: { $gt: Date.now() },
    }).select("+otp +otpExpiresAt +password");

    if (!user) throw new ApiError(400, "Invalid or expired OTP");

    user.isVerified = true;
    user.otp = null;
    user.otpExpiresAt = null;
    await user.save();

    // auto-login after verify: create tokens and session
    const accessToken = generateAccessToken(user.id, user.role);
    //const refreshToken = generateRefreshToken(user.id);
    const { token: refreshToken, sid } = generateRefreshToken(user.id);

    // store hashed refresh in redis & metadata
    await storeSession({
      rawRefreshToken: refreshToken,
      userId: user.id,
      sid,
      meta: { ip: req.ip, ua: req.get("user-agent") },
    });

    // await UserModel.findByIdAndUpdate(user.id, {
    //   last_login_date: new Date(),
    // });

    // res.cookie("accessToken", accessToken, {
    //   ...cookieOptionsBase,
    //   maxAge: ACCESS_EXPIRES_SEC * 1000,
    // });

    res.cookie("refreshToken", refreshToken, {
      ...getAuthCookieOptions(req),
      maxAge: REFRESH_EXPIRES_SEC * 1000,
    });

    res.status(200).json({
      success: true,
      message: "Email verified and login successful",
      data: {
        accessToken,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ==============================login=======================
export const loginController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    console.log("BODY:", req.body);
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
      return;
    }

    const user = await UserModel.findOne({ email }).select(
      "+password +otp +otpExpiresAt",
    );

    if (!user) {
      throw new ApiError(400, "Invalid credentials.");
    }

    if (user.status !== "ACTIVE") {
      throw new ApiError(403, "Contact admin - account is not active.");
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      throw new ApiError(400, "Invalid credentials.");
    }

    // case 1: If email not verified — resend OTP and return intent token
    if (!user.isVerified) {
      // 🛑 OTP cooldown check (ADD THIS HERE)
      if (user.otpExpiresAt && user.otpExpiresAt > new Date()) {
        throw new ApiError(429, "OTP already sent. Please wait.");
      }

      //const verificationToken = crypto.randomBytes(32).toString("hex");
      const otp = crypto.randomInt(100000, 999999).toString();
      const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

      user.otp = hashedOtp;

      user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      await user.save();

      await sendVerificationEmailUsingResend(user.email, otp);

      const intentToken = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.LOGIN_INTENT_SECRET!,
        { expiresIn: "15m" },
      );

      res.status(200).json({
        success: false,
        message: "Please verify your email with the OTP sent to your email.",
        intentToken: intentToken,
        needVerify: true,
      });
      return;
    }

    /* ✅ ADD MFA CHECK RIGHT HERE */

    // 🔐 Admin MFA enforcement
    // if (
    //   ["ADMIN", "SUPER-ADMIN"].includes(user.role) &&
    //   (!user.mfa?.enabled || !user.mfa?.verified)
    // ) {
    //   res.status(403).json({
    //     success: false,
    //     message: "MFA_SETUP_REQUIRED",
    //     mfaRequired: true,
    //   });
    //   return;
    // }

    // case 2: Email verified, generate tokens
    const accessToken = generateAccessToken(user.id, user.role);
    const { token: refreshToken, sid } = generateRefreshToken(user.id);

    // store refresh in redis for revocation & rotation
    await storeSession({
      rawRefreshToken: refreshToken,
      userId: user.id,
      sid,
      meta: { ip: req.ip, ua: req.get("user-agent") },
    });

    await UserModel.findByIdAndUpdate(user.id, {
      last_login_date: new Date(),
    });

    // Access Token
    // res.cookie("accessToken", accessToken, {
    //   ...cookieOptionsBase,
    //   maxAge: ACCESS_EXPIRES_SEC * 1000, // 15 minutes
    // });

    // Refresh Token
    res.cookie("refreshToken", refreshToken, {
      ...getAuthCookieOptions(req),
      maxAge: REFRESH_EXPIRES_SEC * 1000,
    });

    // ✅ Access token ONLY in response
    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        accessToken,
        user: {
          id: user.id,
          role: user.role,
          email: user.email,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

//========================regenerate new accessToken and refreshToken==============
export const getNewAccessToken = async (req: Request, res: Response) => {
  try {
    const rawRefresh =
      (req.cookies?.refresh_token as string) ||
      (req.cookies?.refreshToken as string);

    if (!rawRefresh) {
      return res.status(401).json({ message: "No refresh token provided" });
    }

    // hash the incoming raw refresh token (must match how you stored it)
    const hashed = hashToken(rawRefresh);
    const redisKey = `refresh:${hashed}`;

    const storedJson = await redisClient.get(redisKey);
    if (!storedJson) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    // if you stored JSON like { userId, sid }, parse it
    let stored: { userId: string; sid?: string } | string = storedJson;
    try {
      stored = JSON.parse(storedJson);
    } catch {
      // if older code stored plain string userId
      stored = storedJson;
    }

    // verify refresh JWT
    const decoded = jwt.verify(rawRefresh, process.env.JWT_REFRESH_SECRET!) as {
      id: string;
      sid?: string;
    };

    const storedUserId =
      typeof stored === "string" ? stored : (stored as any).userId;
    if (decoded.id !== storedUserId) {
      return res.status(403).json({ message: "Token user mismatch" });
    }

    const user = await UserModel.findById(decoded.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // rotate: delete old entry and create a new refresh token + store hashed mapping
    await redisClient.del(redisKey);

    const { token: newRefreshToken, sid: newSid } = generateRefreshToken(
      decoded.id,
    );

    // store new refresh token (use your storeSession helper to ensure same format/hashing)
    await storeSession({
      rawRefreshToken: newRefreshToken,
      userId: decoded.id,
      sid: newSid,
      meta: { ip: req.ip, ua: req.get("user-agent") || "" },
    });

    // set new cookie names consistent with above
    res.cookie("refresh_token", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite:
        process.env.NODE_ENV === "production"
          ? ("none" as const)
          : ("lax" as const),
      path: "/",
      maxAge: REFRESH_EXPIRES_SEC * 1000,
    });

    const newAccessToken = generateAccessToken(user.id, user.role);
    res.json({ accessToken: newAccessToken });
  } catch (err: any) {
    console.error("getNewAccessToken error:", err);
    if (err?.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Refresh token expired" });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};

// =====================currentUserController=========================
export const getCurrentUserController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user;

    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized: Missing user ID" });
    }

    const user = await UserModel.findById(userId).select(
      "-password -otp -otpExpiresAt -refresh_token",
    );

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    res.status(200).json({
      success: true,
      message: "User fetched successfully",
      user,
    });
  } catch (err) {
    next(err);
  }
};


export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { fullName, email, phoneNumber } = req.body;

    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      {
        fullName,
        email,
        phoneNumber, // now string
      },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
};


// --- controllers/auth/logoutController.ts ---
const getUserSessionKey = (userId: string) => `user_sessions:${userId}`;
const getBlacklistKey = (token: string) => `bl_refresh:${token}`;

export async function logoutController(req: Request, res: Response) {
  const rawRefreshToken = req.cookies?.refreshToken;

  if (!rawRefreshToken) {
    return res.status(200).json({ message: "Logged out" });
  }

  // Decode just to get sid
  const payload = jwt.decode(rawRefreshToken) as { sid?: string };

  // Blacklist token
  await blacklistRawToken(rawRefreshToken);

  // 🔥 REMOVE SESSION META (THIS IS WHAT MATTERS)
  if (payload?.sid) {
    await redisClient.del(`session_meta:${payload.sid}`);
  }

  res.clearCookie("refreshToken", getAuthCookieOptions(req));

  return res.status(200).json({ message: "Logout successful" });
}

//================forgot password======================
export const forgotPasswordController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email } = req.body;

    if (!email) throw new ApiError(400, "Email is required");

    const user = await UserModel.findOne({ email }).select(
      "+otp +otpExpiresAt",
    );

    // Always respond with success message to avoid email enumeration
    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If the email exists, an OTP has been sent",
      });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    user.otp = hashedOtp;
    user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min
    await user.save();

    await sendVerificationEmailUsingResend(user.email, otp); // Secure email utility

    return res.status(200).json({
      success: true,
      message: "If the email exists, an OTP has been sent",
    });
  } catch (err) {
    next(err);
  }
};

export const resetPasswordController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(" ")[1];

    if (!token) throw new ApiError(401, "Reset token missing");

    const { userId, email } = jwt.verify(
      token,
      process.env.LOGIN_INTENT_SECRET!,
    ) as { userId: string; email: string };

    const { newPassword, confirmPassword } = req.body;

    if (!newPassword || !confirmPassword) {
      throw new ApiError(400, "Both password fields are required");
    }

    if (newPassword !== confirmPassword) {
      throw new ApiError(400, "Passwords do not match");
    }

    const user = await UserModel.findById(userId).select(
      "+password +otp +otpExpiresAt",
    );

    if (!user || user.email !== email) {
      throw new ApiError(404, "User not found");
    }

    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(newPassword, salt);

    user.otp = "";
    user.otpExpiresAt = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message:
        "Password reset successful. Please log in with your new password.",
    });
  } catch (err) {
    next(err);
  }
};

export const verifyForgotPasswordOtpController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { otp, email } = req.body;

    if (!otp || !email) {
      throw new ApiError(400, "Email and OTP are required");
    }

    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    const user = await UserModel.findOne({
      email,
      otp: hashedOtp,
      otpExpiresAt: { $gt: Date.now() },
    }).select("+otp +otpExpiresAt");

    if (!user) throw new ApiError(400, "Invalid or expired OTP");

    // Clear OTP
    user.otp = "";
    user.otpExpiresAt = undefined;
    await user.save();

    // Issue short-lived reset password token
    const intentToken = jwt.sign(
      { userId: user.id.toString(), email: user.email },
      process.env.LOGIN_INTENT_SECRET!,
      { expiresIn: "10m" },
    );

    res.status(200).json({
      success: true,
      message: "OTP verified. Proceed to reset password.",
      intentToken,
    });
  } catch (err) {
    next(err);
  }
};

//=================upload images==================
export const userAvatarController = async (req: Request, res: Response) => {
  try {
    const userId = req.user; // Ensure this comes from your auth middleware
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }
    // Validate userId
    if (!userId || typeof userId !== "string") {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    const user = await UserModel.findOne({ _id: userId });
    if (!user) {
      return res.status(500).json({
        message: "User not found",
        error: true,
        success: false,
      });
    }

    // first remove image from cloudinary
    const imgUrl = user.avatar;
    const urlArr = imgUrl.split("/");
    const avatar_image = urlArr[urlArr.length - 1];

    const imageName = avatar_image.split(".")[0];

    if (imageName) {
      const res = await cloudinary.uploader.destroy(
        imageName,
        (error, result) => {},
      );
    }

    // Validate file types
    const validMimeTypes = ["image/jpeg", "image/png", "image/gif"];
    for (const file of files) {
      if (!validMimeTypes.includes(file.mimetype)) {
        return res.status(400).json({ message: "Invalid file type" });
      }
    }

    const options = {
      folder: "avatar_uploads",
      transformation: [{ width: 500, height: 500, crop: "limit" }],
      resource_type: "image" as "image",
      format: "jpg",
      public_id: `user_${userId}`,
      use_filename: true,
      unique_filename: false,
      overwrite: true, // Set to true if you want to replace existing avatar
      secure: true,
    };

    const uploadPromises = files.map((file) =>
      cloudinary.uploader.upload(file.path, options),
    );

    const uploadResults = await Promise.all(uploadPromises);

    // Cleanup local files
    const deletePromises = files.map((file) =>
      fs.promises
        .unlink(file.path)
        .catch((err) =>
          console.error(`Error deleting file ${file.path}:`, err),
        ),
    );
    await Promise.all(deletePromises);

    const imageUrls = uploadResults.map((result) => result.secure_url);

    user.avatar = imageUrls[0];
    await user.save();

    return res.status(200).json({
      _id: userId,
      avatar: imageUrls[0],
      message: "Images uploaded successfully",
    });
  } catch (error: any) {
    console.error("Upload failed:", error);
    return res
      .status(500)
      .json({ message: "Upload failed", error: error.message });
  }
};

export const removeImgFromCloudinary = async (req: Request, res: Response) => {
  try {
    const imgUrl = req.query.img as string;

    if (!imgUrl) {
      return res.status(400).json({ error: "Image URL is required." });
    }

    const urlSegments = imgUrl.split("/");
    const imageWithExtension = urlSegments[urlSegments.length - 1];
    const publicId = imageWithExtension.split(".")[0]; // Assumes image name doesn't include extra dots

    // Optional: if your images are in a folder like 'profile_pics/abc123', preserve the full path
    const folderSegments = urlSegments.slice(urlSegments.indexOf("upload") + 1);
    const fullPublicId = folderSegments.join("/").split(".")[0];

    const result = await cloudinary.uploader.destroy(fullPublicId);

    if (result.result === "ok") {
      return res
        .status(200)
        .json({ success: true, message: "Image deleted successfully." });
    } else {
      return res
        .status(404)
        .json({ error: "Image not found or already deleted." });
    }
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    return res
      .status(500)
      .json({ error: "Failed to delete image from Cloudinary." });
  }
};

// PUT /api/user/profile-pic
export const updateUserProfilePic = async (req: Request, res: Response) => {
  try {
    const userId = req.user; // Assuming you have auth middleware that adds user to req
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "No image file provided" });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(file.path, {
      folder: "profile_pics",
    });

    // Update user in DB
    await UserModel.findByIdAndUpdate(userId, {
      profilePic: result.secure_url,
    });

    res.json({
      success: true,
      message: "Profile picture updated",
      imageUrl: result.secure_url,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update profile picture" });
  }
};

//===================update user===================
export async function updateUserDetails(req: Request, res: Response) {
  try {
    const userId = req.user;
    const { name, email, mobile, password } = req.body;

    const userExist = await UserModel.findById(userId);
    if (!userExist) return res.status(400).send("The user cannot be updated");

    let otp = "";
    if (email !== userExist.email) {
      otp = Math.floor(100000 * Math.random() * 900000).toString();
    }

    let hashedPassword = "";
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
    } else {
      hashedPassword = userExist.password;
    }

    const updateUser = await UserModel.findByIdAndUpdate(
      userId,
      {
        fullName: name,
        mobile,
        email,
        verify_email: email ? false : true,
        password: hashedPassword,
        otp: otp !== "" ? otp : null,
        otpExpires: otp !== "" ? Date.now() + 600000 : "",
      },
      { new: true },
    );

    if (email !== userExist.email) {
      await sendVerificationEmailUsingResend(userExist.email, otp);
    }

    return res.json({
      message: "user Updated successfully",
      error: false,
      success: true,
      user: updateUser,
    });
  } catch (error) {
    res.status(500).json({
      message: error,
      error: true,
      success: false,
    });
  }
}

export const resendOtpController = async (req: Request, res: Response) => {
  try {
    const { intentToken } = req.body;

    if (!intentToken) {
      return res.status(400).json({
        success: false,
        message: "intentToken is required",
      });
    }

    // 1️⃣ Decode JWT
    let decoded: any;
    try {
      decoded = jwt.verify(intentToken, process.env.LOGIN_INTENT_SECRET!);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired intent token",
      });
    }

    const { email, userId } = decoded;

    // 2️⃣ Fetch user
    const user = await UserModel.findById(userId).select("+otp +otpExpiresAt");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Email already verified",
      });
    }

    // 3️⃣ Generate new OTP
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiration = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    // 🔐 Hash OTP before saving (IMPORTANT)
    const hashedOtp = crypto.createHash("sha256").update(newOtp).digest("hex");

    user.otp = hashedOtp;
    user.otpExpiresAt = otpExpiration;

    await user.save();

    // 4️⃣ Send email using Resend
    try {
      await sendVerificationEmailUsingResend(email, newOtp); // send plain OTP
    } catch (error) {
      console.error("OTP RESEND EMAIL FAILED:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP email",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }

    // 5️⃣ Respond
    return res.json({
      success: true,
      message: "OTP resent successfully",
    });
  } catch (error) {
    console.error("RESEND OTP ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// export const refreshController = async (
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ) => {
//   try {
//     const rawRefreshToken = req.cookies?.refreshToken;
//     if (!rawRefreshToken) throw new ApiError(401, "No refresh token");

//     let payload: { id: string; sid: string };
//     try {
//       payload = jwt.verify(
//         rawRefreshToken,
//         process.env.JWT_REFRESH_SECRET!,
//       ) as any;
//     } catch (err) {
//       throw new ApiError(401, "Expired or invalid refresh token");
//     }

//     const session = await findSessionByRawToken(rawRefreshToken);

//     // 🛡️ REUSE DETECTION
//     const hashed = hashToken(rawRefreshToken);
//     const isBlacklisted = await redisClient.get(`bl_refresh:${hashed}`);

//     if (!session && isBlacklisted) {
//       await clearAllSessionsForUser(payload.id);
//       res.clearCookie("refreshToken", getAuthCookieOptions(req));
//       throw new ApiError(403, "Token reuse detected");
//     }

//     if (!session) {
//       throw new ApiError(401, "Session expired");
//     }

//     // 🔁 ROTATION
//     await blacklistRawToken(rawRefreshToken);

//     const user = await UserModel.findById(payload.id).select("role");
//     if (!user) throw new ApiError(401, "User not found");

//     const accessToken = generateAccessToken(payload.id, user.role);

//     const { token: newRefreshToken, sid: newSid } = generateRefreshToken(
//       payload.id,
//     );

//     await storeSession({
//       rawRefreshToken: newRefreshToken,
//       userId: payload.id,
//       sid: newSid,
//       meta: { ip: req.ip, ua: req.get("user-agent") },
//     });

//     res.cookie("refreshToken", newRefreshToken, {
//       ...getAuthCookieOptions(req),
//       maxAge: REFRESH_EXPIRES_SEC * 1000,
//     });

//     res.status(200).json({ success: true, accessToken });
//   } catch (err) {
//     next(err);
//   }
// };

const sessionMetaKey = (sid: string) => `session_meta:${sid}`;

interface RefreshJwtPayload {
  id: string;
  sid: string;
  role: string;
}

export async function refreshController(req: Request, res: Response) {
  const rawRefreshToken = req.cookies?.refreshToken;

  if (!rawRefreshToken) {
    return res.status(401).json({ message: "Refresh token missing" });
  }

  let payload: { id: string; sid: string };

  // 1️⃣ Verify refresh JWT
  try {
    payload = jwt.verify(rawRefreshToken, process.env.JWT_REFRESH_SECRET!) as {
      id: string;
      sid: string;
    };
  } catch {
    return res.status(401).json({ message: "Invalid refresh token" });
  }

  // 2️⃣ Redis validation
  const session = await findSessionByRawToken(rawRefreshToken);
  if (!session) {
    return res.status(401).json({ message: "Session expired or revoked" });
  }

  // 3️⃣ ROTATE
  await blacklistRawToken(rawRefreshToken);

  // 4️⃣ Load user (ROLE SOURCE OF TRUTH)
  const user = await UserModel.findById(payload.id);
  if (!user || user.status !== "ACTIVE") {
    return res.status(403).json({ message: "Account inactive" });
  }

  // 5️⃣ Issue new tokens
  const accessToken = generateAccessToken(user.id, user.role);
  const { token: newRefreshToken, sid: newSid } = generateRefreshToken(user.id);

  await storeSession({
    rawRefreshToken: newRefreshToken,
    userId: user.id,
    sid: newSid,
    meta: {
      ip: req.ip,
      ua: req.get("user-agent"),
    },
  });

  res.cookie("refreshToken", newRefreshToken, getAuthCookieOptions(req));

  return res.status(200).json({
    success: true,
    accessToken,
  });
}





export const getCustomers = async (req: Request, res: Response) => {
  try {
    const users = await UserModel.find({ role: "USER" }).lean();

    const customers = await Promise.all(
      users.map(async (user) => {
        const orders = await Order.find({ userId: user._id }).lean();

        const totalOrders = orders.length;

        const totalSpend = orders.reduce(
          (acc, o) => acc + (o.totalAmount || 0),
          0
        );

        const lastOrder =
          orders.length > 0
            ? orders.sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime()
              )[0].createdAt
            : null;

        return {
          id: user._id,
          name: user.fullName,
          avatar: user.avatar,
          email: user.email,
          phone: user.phoneNumber,
          address: "", // optional (you can improve later)
          joined: user.createdAt,
          orders: totalOrders,
          totalSpend,
          lastOrder,
          status: user.status === "ACTIVE" ? "Active" : "Inactive",
          role: user.role,
        };
      })
    );

    res.json({ data: customers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch customers" });
  }
};


export const createCustomer = async (req: Request, res: Response) => {
  try {
    const user = await UserModel.create({
      fullName: req.body.name,
      email: req.body.email,
      phoneNumber: req.body.phone,
      avatar: req.body.avatar,
      role: "USER",
      status: req.body.status === "Active" ? "ACTIVE" : "INACTIVE",
    });

    res.json({ data: user });
  } catch (err) {
    res.status(500).json({ message: "Failed to create customer" });
  }
};


export const updateCustomer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const updated = await UserModel.findByIdAndUpdate(
      id,
      {
        fullName: req.body.name,
        email: req.body.email,
        phoneNumber: req.body.phone,
        avatar: req.body.avatar,
        status: req.body.status === "Active" ? "ACTIVE" : "INACTIVE",
      },
      { new: true }
    );

    res.json({ data: updated });
  } catch {
    res.status(500).json({ message: "Update failed" });
  }
};


export const deleteCustomer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await UserModel.findByIdAndDelete(id);

    res.json({ message: "Deleted successfully" });
  } catch {
    res.status(500).json({ message: "Delete failed" });
  }
};


export const deleteCustomers = async (req: Request, res: Response) => {
  try {
    // // ✅ assuming req.user is set by auth middleware
    // if (req.user?.role !== "SUPER-ADMIN") {
    //   return res.status(403).json({
    //     success: false,
    //     message: "Only super admin can delete customers",
    //   });
    // }
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No customer IDs provided",
      });
    }

    await UserModel.deleteMany({ _id: { $in: ids } });

    res.status(200).json({
      success: true,
      message: "Customers deleted successfully",
    });
  } catch (error) {
    console.error("Delete customers error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting customers",
    });
  }
};
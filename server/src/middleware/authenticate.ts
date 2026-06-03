import jwt from "jsonwebtoken";
import { RequestHandler } from "express";
//import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError.js";
import UserModel, { IUserDocument } from "../models/userModel.js";

// Extend Express Request type
// interface AuthenticatedRequest extends Request {
//   userId: string;
//   userRole: string;
// }

interface DecodedToken {
  id: string;
  role: string;
}

export const authenticate = (roles?: string[]): RequestHandler => {
  return async (req, res, next) => {
    try {
      console.log(req.cookies);
      const accessToken =
        req.cookies?.access_token ||
        req.cookies?.accessToken ||
        (req.headers.authorization?.startsWith("Bearer ")
          ? req.headers.authorization.split(" ")[1]
          : null);

      if (!accessToken) {
        res.status(401).json({ message: "Provide Token" });
        return;
      }

      if (!process.env.JWT_ACCESS_SECRET) {
        throw new Error(
          "JWT_ACCESS_SECRET is not defined in environment variables"
        );
      }

      const decoded = jwt.verify(
        accessToken,
        process.env.JWT_ACCESS_SECRET!
      ) as DecodedToken;
      //console.log("Decoded Token:", decoded);
      if (!decoded?.id) {
        res.status(401).json({
          message: "unauthorized access",
          error: true,
          success: false,
        });
        return;
      }
      // if (roles && !roles.includes(decoded?.role)) {
      //   res.status(403).json({ message: "Forbidden: insufficient role" });
      //   return;
      // }
      const user: IUserDocument | null = await UserModel.findById(
        decoded.id
      ).select("-password -otp -otpExpiresAt");

      if (!user) {
        res.status(401).json({ message: "User not found" });
        return;
      }

      // after loading user from DB
      if (user.status !== "ACTIVE") {
        res.status(403).json({
          message: `Account is ${user.status.toLowerCase()}. Contact support.`,
        });
        return;
      }

      req.user = user;
      // (req as AuthenticatedRequest).userId = decoded.id;
      // (req as AuthenticatedRequest).userRole = decoded.role;
      next();
    } catch (error: any) {
      if (error?.name === "TokenExpiredError") {
        res.status(401).json({
          message: "Access token expired",
          error: true,
          success: false,
        });
        return;
      }
      if (error?.name === "JsonWebTokenError") {
        res.status(401).json({
          message: "Invalid access token",
          error: true,
          success: false,
        });
        return;
      }
      res.status(500).json({
        message: "Authentication error",
        error: true,
        success: false,
      });
      return;
    }
  };
};


// export const socketAuthenticator = async (err, socket, next) => {
//   try {
//     if (err) return next(err);

//     const authToken = socket.request.cookies[CHATTU_TOKEN];

//     if (!authToken)
//       return next(new ApiError(401, "Please login to access this route"));

//     const decodedData = jwt.verify(authToken, process.env.JWT_SECRET);

//     const user = await UserModel.findById(decodedData._id);

//     if (!user)
//       return next(new ApiError(401, "Please login to access this route"));

//     socket.user = user;

//     return next();
//   } catch (error) {
//     console.log(error);
//     return next(new ApiError(401, "Please login to access this route"));
//   }
// };




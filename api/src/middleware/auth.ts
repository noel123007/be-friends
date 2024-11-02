import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../common/errors/AppError";
import { User, type UserWithoutPassword } from "../models/User";

interface JwtPayload {
  userId: string;
}

export async function auth(req: Request, _res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return next();
    }

    const token = authHeader.split(" ")[1];
    if (!token) return next();

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new AppError(500, "JWT secret not configured");
    }

    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
    if (!decoded?.userId) {
      throw AppError.unauthorized("Invalid token");
    }

    const user = await User.findById(decoded.userId)
      .select("-password")
      .lean() as UserWithoutPassword;

    if (!user) {
      throw AppError.unauthorized("User not found");
    }

    req.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      avatar: user.avatar
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(AppError.unauthorized("Invalid token"));
    } else {
      next(error);
    }
  }
}

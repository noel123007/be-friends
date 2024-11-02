import jwt from "jsonwebtoken";
import { Types } from "mongoose";
import { AppError } from "../common/errors/AppError";
import {
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  type LoginInput,
  type RegisterInput,
  type ResetPasswordInput,
} from "../schema/validation/auth";
import { Context } from "../types";
import { NotificationType } from '../types/enums';
import { logger } from "../util/logger";
import { sendNotification } from '../util/notification';
import { validate } from "../util/validate";

function generateToken(userId: string): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new AppError(500, "JWT secret not configured");

  return jwt.sign({ userId }, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

export const authResolvers = {
  Query: {
    currentUser: async (_: unknown, __: unknown, { models, user }: Context) => {
      if (!user?.id) throw AppError.unauthorized()

      try {
        const currentUser = await models.User.findById(user.id)
          .select('-password')
          .lean()

        if (!currentUser) throw AppError.notFound('User not found')

        return {
          id: currentUser._id.toString(),
          name: currentUser.name,
          email: currentUser.email,
          avatar: currentUser.avatar,
          createdAt: currentUser.createdAt.toISOString(),
          updatedAt: currentUser.updatedAt.toISOString(),
          lastLoginAt: currentUser.lastLoginAt.toISOString()
        }
      } catch (error) {
        logger.error('Get current user error:', error)
        throw error
      }
    },

    validateResetToken: async (_: unknown, { token }: { token: string }) => {
      try {
        const secret = process.env.JWT_SECRET;
        if (!secret) throw new AppError(500, "JWT secret not configured");

        jwt.verify(token, secret);
        return { valid: true, message: "Token is valid" };
      } catch (error) {
        return { valid: false, message: "Token is invalid or expired" };
      }
    },
  },

  Mutation: {
    login: async (
      _: unknown,
      { input }: { input: LoginInput },
      { models }: Context
    ) => {
      try {
        const validatedInput = await validate(loginSchema, input);
        const { email, password } = validatedInput;

        const user = await models.User.findOne({ email });
        if (!user) throw AppError.unauthorized("Invalid credentials");

        const isValid = await user.comparePassword(password);
        if (!isValid) throw AppError.unauthorized("Invalid credentials");

        await user.updateLastLogin();

        const token = generateToken(user.id);

        logger.info("User logged in successfully", { userId: user.id });

        return {
          token,
          user: {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString(),
            lastLoginAt: user.lastLoginAt.toISOString()
          }
        };
      } catch (error) {
        logger.error("Login error:", error);
        throw error;
      }
    },

    register: async (
      _: unknown,
      { input }: { input: RegisterInput },
      { models, pubsub }: Context
    ) => {
      try {
        const validatedInput = await validate(registerSchema, input);

        const existingUser = await models.User.findOne({
          email: validatedInput.email,
        });

        if (existingUser) {
          throw AppError.badRequest("Email already registered");
        }

        const user = await models.User.create(validatedInput);
        const token = generateToken(user.id);

        await models.Profile.create({
          _id: new Types.ObjectId(),
          userId: user.id,
          name: validatedInput.name,
        });

        // Send welcome notification
        await sendNotification({
          userId: user.id,
          type: NotificationType.SYSTEM,
          title: 'Welcome to BeFriends!',
          message: 'Thanks for joining. Start by completing your profile and finding friends.',
          data: { userId: user.id }
        }, { models, pubsub })

        logger.info("User registered successfully", { userId: user.id });

        return {
          token,
          user,
        };
      } catch (error) {
        logger.error("Registration error:", error);
        throw error;
      }
    },

    resetPassword: async (
      _: unknown,
      { input }: { input: ResetPasswordInput },
      { models, pubsub }: Context
    ) => {
      try {
        const validatedInput = await validate(resetPasswordSchema, input);
        const { token, password } = validatedInput;

        const secret = process.env.JWT_SECRET;
        if (!secret) throw new AppError(500, "JWT secret not configured");

        const decoded = jwt.verify(token, secret) as { userId: string };
        const user = await models.User.findById(decoded.userId);

        if (!user) throw AppError.badRequest("Invalid token");

        user.password = password;
        await user.save();

        const newToken = generateToken(user.id);

        // Send password changed notification
        await sendNotification({
          userId: user.id,
          type: NotificationType.SYSTEM,
          title: 'Password Changed',
          message: 'Your password has been successfully reset.',
          data: { userId: user.id }
        }, { models, pubsub })

        logger.info("Password reset successfully", { userId: user.id });

        return {
          success: true,
          message: "Password reset successfully",
          token: newToken,
          user,
        };
      } catch (error) {
        logger.error("Password reset error:", error);
        if (error instanceof jwt.JsonWebTokenError) {
          throw AppError.badRequest("Invalid or expired token");
        }
        throw error;
      }
    },
  },
};

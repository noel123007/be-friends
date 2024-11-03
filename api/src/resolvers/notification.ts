import { Types } from "mongoose";
import { AppError } from "../common/errors/AppError";
import { NotificationPreferencesInput, notificationPreferencesSchema } from "../schema/validation/notification";
import { Context } from "../types";
import { logger } from "../util/logger";
import { validate } from "../util/validate";

export const notificationResolvers = {
  Query: {
    notifications: async (
      _: unknown,
      { filters }: { filters?: { type?: string[]; isRead?: boolean } },
      { models, user }: Context
    ) => {
      if (!user) throw AppError.unauthorized();

      try {
        const query: any = { userId: user.id };

        if (filters?.type?.length) {
          query.type = { $in: filters.type };
        }

        if (typeof filters?.isRead === "boolean") {
          query.isRead = filters.isRead;
        }

        const notifications = await models.Notification
          .find(query)
          .sort({ createdAt: -1 })
          .lean();

        return notifications.map(notification => ({
          id: notification._id.toString(),
          type: notification.type,
          title: notification.title,
          message: notification.message,
          isRead: notification.isRead,
          createdAt: notification.createdAt,
          data: notification.data
        }));
      } catch (error) {
        logger.error("Fetch notifications error:", error);
        throw error;
      }
    },

    notificationPreferences: async (_: unknown, __: unknown, { models, user }: Context) => {
      if (!user) throw AppError.unauthorized();

      try {
        let preferences = await models.NotificationPreferences.findOne({ userId: user.id });

        if (!preferences) {
          // Create default preferences if none exist
          preferences = await models.NotificationPreferences.create({
            userId: user.id,
            friendRequests: true, 
            system: true, 
          });
        }

        return preferences;
      } catch (error) {
        logger.error("Fetch notification preferences error:", error);
        throw error;
      }
    }
  },

  Mutation: {
    markNotificationRead: async (
      _: unknown,
      { id }: { id: string },
      { models, user, pubsub }: Context
    ) => {
      if (!user) throw AppError.unauthorized();

      try {
        const notification = await models.Notification.findOneAndUpdate(
          {
            _id: new Types.ObjectId(id),
            userId: user.id
          },
          { $set: { isRead: true } },
          { new: true }
        );

        if (!notification) {
          throw AppError.notFound("Notification not found");
        }

        pubsub.publish(`NOTIFICATION_UPDATED_${user.id}`, {
          notificationUpdated: {
            id: notification._id.toString(),
            isRead: notification.isRead
          }
        });

        return notification;
      } catch (error) {
        logger.error("Mark notification read error:", error);
        throw error;
      }
    },

    markAllNotificationsRead: async (_: unknown, __: unknown, { models, user }: Context) => {
      if (!user) throw AppError.unauthorized();

      try {
        const result = await models.Notification.updateMany(
          { userId: user.id, isRead: false },
          { $set: { isRead: true } }
        );

        return {
          success: true,
          message: `Marked ${result.modifiedCount} notifications as read`
        };
      } catch (error) {
        logger.error("Mark all notifications read error:", error);
        throw error;
      }
    },

    updateNotificationPreferences: async (
      _: unknown,
      { input }: { input: NotificationPreferencesInput },
      { models, user }: Context
    ) => {
      if (!user) throw AppError.unauthorized();

      try {
        const validatedInput = await validate(
          notificationPreferencesSchema,
          input
        );

        // Get existing preferences
        const existingPrefs = await models.NotificationPreferences.findOne({
          userId: user.id,
        });
        const mergedInput = {
          friendRequests: existingPrefs?.friendRequests ?? true, 
          system: existingPrefs?.system ?? true, 
          ...validatedInput,
        };

        const preferences =
          await models.NotificationPreferences.findOneAndUpdate(
            { userId: user.id },
            { $set: mergedInput },
            { new: true, upsert: true }
          );

        return preferences;
      } catch (error) {
        logger.error("Update notification preferences error:", error);
        throw error;
      }
    },
  },

  Subscription: {
    notificationReceived: {
      subscribe: (_: unknown, __: unknown, { user, pubsub }: Context) => {
        if (!user) throw AppError.unauthorized();
        return pubsub.asyncIterator([`NOTIFICATION_RECEIVED_${user.id}`]);
      }
    },

    notificationUpdated: {
      subscribe: (_: unknown, __: unknown, { user, pubsub }: Context) => {
        if (!user) throw AppError.unauthorized();
        return pubsub.asyncIterator([`NOTIFICATION_UPDATED_${user.id}`]);
      }
    }
  }
};

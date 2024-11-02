import { Types } from "mongoose";
import { AppError } from "../common/errors/AppError";
import { IActivity } from "../models/Activity";
import { ActivityPagination, activityPaginationSchema } from "../schema/validation/activity";
import { Context } from "../types";
import { logger } from "../util/logger";
import { validate } from "../util/validate";

interface PopulatedActivity extends Omit<IActivity, 'userId'> {
  userId: {
    _id: Types.ObjectId;
    name: string;
    email: string;
    avatar?: string;
  };
}

export const activityResolvers = {
  Query: {
    activities: async (
      _: unknown,
      args: unknown,
      { models, user }: Context
    ) => {
      if (!user) throw AppError.unauthorized();

      try {
        const { cursor, limit = 10, type } = await validate(
          activityPaginationSchema,
          args
        );

        const query: any = {};

        if (cursor) {
          query._id = { $lt: new Types.ObjectId(cursor) };
        }

        if (type?.length) {
          query.type = { $in: type };
        }

        const activities = await models.Activity
          .find(query)
          .sort({ _id: -1 })
          .limit(limit + 1)
          .populate('userId', '-password')
          .lean<PopulatedActivity[]>();

        const hasNextPage = activities.length > limit;
        const edges = activities.slice(0, limit).map((activity) => ({
          node: {
            id: activity._id.toString(),
            type: activity.type,
            message: activity.message,
            data: activity.data,
            createdAt: activity.createdAt,
            user: {
              id: activity.userId._id.toString(),
              name: activity.userId.name,
              email: activity.userId.email,
              avatar: activity.userId.avatar
            }
          },
          cursor: activity._id.toString()
        }));

        return {
          edges,
          pageInfo: {
            hasNextPage,
            endCursor: edges[edges.length - 1]?.cursor
          }
        };
      } catch (error) {
        logger.error('Fetch activities error:', error);
        throw error;
      }
    },

    userActivities: async (
      _: unknown,
      args: unknown,
      { models, user }: Context
    ) => {
      if (!user) throw AppError.unauthorized();

      try {
        const { userId, type, cursor, limit } = await validate(
          activityPaginationSchema,
          args
        ) as ActivityPagination;

        const query: any = { userId: new Types.ObjectId(userId) };

        if (type?.length) {
          query.type = { $in: type };
        }

        if (cursor) {
          query._id = { $lt: new Types.ObjectId(cursor) };
        }

        const activities = await models.Activity
          .find(query)
          .sort({ _id: -1 })
          .limit(limit + 1)
          .populate('userId', '-password')
          .lean<PopulatedActivity[]>();

        const hasNextPage = activities.length > limit;
        const edges = activities.slice(0, limit).map((activity) => ({
          node: {
            id: activity._id.toString(),
            type: activity.type,
            message: activity.message,
            data: activity.data,
            createdAt: activity.createdAt,
            user: {
              id: activity.userId._id.toString(),
              name: activity.userId.name,
              email: activity.userId.email,
              avatar: activity.userId.avatar
            }
          },
          cursor: activity._id.toString()
        }));

        return {
          edges,
          pageInfo: {
            hasNextPage,
            endCursor: edges[edges.length - 1]?.cursor
          }
        };
      } catch (error) {
        logger.error('Fetch user activities error:', error);
        throw error;
      }
    },
  },

  Subscription: {
    activityCreated: {
      subscribe: (_: unknown, __: unknown, { pubsub }: Context) =>
        pubsub.asyncIterator(['ACTIVITY_CREATED']),
    },

    userActivityCreated: {
      subscribe: (_: unknown, { userId }: { userId: string }, { pubsub }: Context) =>
        pubsub.asyncIterator([`USER_ACTIVITY_CREATED_${userId}`]),
    },
  },

  Activity: {
    user: async (parent: any, _: unknown, { models }: Context) => {
      try {
        return await models.User.findById(parent.userId).select("-password");
      } catch (error) {
        logger.error("Fetch activity user error:", error);
        throw error;
      }
    },
  },
};

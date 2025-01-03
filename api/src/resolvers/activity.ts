import { Types } from "mongoose";
import { AppError } from "../common/errors/AppError";
import { IActivity } from "../models/Activity";
import { ActivityPagination, activityPaginationSchema } from "../schema/validation/activity";
import { Context } from "../types";
import { FriendStatus } from "../types/enums";
import { logger } from "../util/logger";
import { validate } from "../util/validate";

interface PopulatedActivity extends Omit<IActivity, 'userId'> {
  userId: {
    userId: {
      _id: Types.ObjectId;
    name: string;
    email: string;
    };
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

        // Find all friends of the user
        const friendships = await models.Friend
          .find({
            $or: [
              { senderId: user.id, status: FriendStatus.FRIENDS },
              { receiverId: user.id, status: FriendStatus.FRIENDS } 
            ]
          })
          .lean();

        // Extract friend IDs
        const friendIds = friendships.map(friendship => 
          friendship.senderId.toString() === user.id 
            ? friendship.receiverId 
            : friendship.senderId
        );

        // Build query to include user's and friends' activities
        const query: any = {
          userId: { $in: [new Types.ObjectId(user.id), ...friendIds] }
        };

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
          .populate({
            path: 'userId',
            select: 'avatar',
            model: 'Profile',
            foreignField: 'userId',
            localField: '_id',
            populate: {
              path: 'userId', 
              model: 'User', 
              select: 'name email', 
              foreignField: '_id', 
              localField: 'userId', 
              strictPopulate: false
            }
          }) as unknown as PopulatedActivity[]
        
        const hasNextPage = activities.length > limit;
        const edges = activities.slice(0, limit).map((activity) => ({
          node: {
            id: activity._id.toString(),
            type: activity.type,
            message: activity.message,
            data: activity.data,
            createdAt: activity.createdAt,
            user: {
              id: activity.userId.userId._id.toString(),
              name: activity.userId.userId.name,
              email: activity.userId.userId.email,
              avatar: activity.userId.avatar
            }
          },
          cursor: activity._id.toString()
        }));

        logger.info('Fetch user and friends activities', {
          userId: user.id,
          friendsCount: friendIds.length,
          activitiesCount: edges.length,
          hasNextPage
        });

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
          .populate({ 
            path: 'userId',
            select: 'avatar',
            model: 'Profile',
            foreignField: 'userId',
            localField: '_id',
            populate: {
              path: 'userId', 
              model: 'User', 
              select: 'name email', 
              foreignField: '_id', 
              localField: 'userId', 
              strictPopulate: false
            }}) as unknown as PopulatedActivity[]
          

        const hasNextPage = activities.length > limit;
        const edges = activities.slice(0, limit).map((activity) => ({
          node: {
            id: activity._id.toString(),
            type: activity.type,
            message: activity.message,
            data: activity.data,
            createdAt: activity.createdAt,
            user: {
              id: activity.userId.userId._id.toString(),
              name: activity.userId.userId.name,
              email: activity.userId.userId.email,
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

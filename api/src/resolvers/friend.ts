import { withFilter } from "graphql-subscriptions";
import { Types } from "mongoose";
import { AppError } from "../common/errors/AppError";
import { pubsub } from "../lib/pubsub";
import { IFriend } from "../models";
import {
  friendPaginationSchema,
  searchUsersSchema,
} from "../schema/validation/friend";
import { Context, Models } from "../types";
import { ActivityType, FriendStatus, NotificationType } from "../types/enums";
import { logger } from "../util/logger";
import { sendNotification } from '../util/notification';
import { validate } from "../util/validate";

interface PopulatedUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  avatar?: string;
}

interface PopulatedFriend {
  _id: Types.ObjectId;
  senderId: PopulatedUser;
  receiverId: PopulatedUser;
  status: FriendStatus;
  createdAt: Date;
  updatedAt: Date;
}

interface PopulatedFriendRequest extends Omit<IFriend, 'senderId' | 'receiverId'> {
  senderId: {
    _id: Types.ObjectId
    name: string
    email: string
    avatar?: string
  }
  receiverId: {
    _id: Types.ObjectId
    name: string
    email: string
    avatar?: string
  }
}

interface PopulatedDocument {
  _id: Types.ObjectId
  senderId: {
    _id: Types.ObjectId
    name: string
    email: string
    avatar?: string
  }
  receiverId: Types.ObjectId
  status: FriendStatus
  createdAt: Date
}

export const friendResolvers = {
  Query: {
    friends: async (_: unknown, args: unknown, { models, user }: Context) => {
      if (!user) throw AppError.unauthorized();

      try {
        const { cursor, limit = 10 } = await validate(
          friendPaginationSchema,
          args
        );

        const query: any = {
          $or: [
            { senderId: user.id, status: FriendStatus.FRIENDS },
            { receiverId: user.id, status: FriendStatus.FRIENDS },
          ],
        };

        if (cursor) {
          query._id = { $lt: new Types.ObjectId(cursor) };
        }

        const friends = await models.Friend.find(query)
          .sort({ _id: -1 })
          .limit(limit + 1)
          .populate([
            { path: "senderId", select: "-password" },
            { path: "receiverId", select: "-password" },
          ])
          .lean<PopulatedFriend[]>();

        const hasNextPage = friends.length > limit;
        const edges = friends.slice(0, limit).map((friend) => ({
          node: {
            id: friend._id.toString(),
            senderId: friend.senderId._id.toString(),
            receiverId: friend.receiverId._id.toString(),
            status: friend.status,
            createdAt: friend.createdAt,
            updatedAt: friend.updatedAt,
            sender: {
              id: friend.senderId._id.toString(),
              name: friend.senderId.name,
              email: friend.senderId.email,
              avatar: friend.senderId.avatar
            },
            receiver: {
              id: friend.receiverId._id.toString(),
              name: friend.receiverId.name,
              email: friend.receiverId.email,
              avatar: friend.receiverId.avatar
            },
            user:
              friend.senderId._id.toString() === user.id
                ? friend.receiverId
                : friend.senderId,
          },
          cursor: friend._id.toString(),
        }));

        logger.info("Fetched friends list", {
          userId: user.id,
          count: edges.length,
        });

        return {
          edges,
          pageInfo: {
            hasNextPage,
            endCursor: edges[edges.length - 1]?.cursor,
          },
        };
      } catch (error) {
        logger.error("Fetch friends error:", error);
        throw error;
      }
    },

    sentRequests: async (_: unknown, args: unknown, { models, user }: Context) => {
      if (!user) throw AppError.unauthorized()

      try {
        const { cursor, limit = 10 } = await validate(friendPaginationSchema, args)

        const query: any = {
          senderId: user.id,
          status: FriendStatus.PENDING
        }

        if (cursor) {
          query._id = { $lt: new Types.ObjectId(cursor) }
        }

        const requests = await models.Friend
          .find(query)
          .sort({ _id: -1 })
          .limit(limit + 1)
          .populate('receiverId', '-password')
          .lean<PopulatedFriendRequest[]>()   

        const hasNextPage = requests.length > limit
        const edges = requests.slice(0, limit).map((request) => ({
          node: {
            id: request._id.toString(),
            senderId: request.senderId._id.toString(),
            receiverId: request.receiverId._id.toString(),
            status: request.status,
            createdAt: request.createdAt,
            receiver: {
              id: request.receiverId._id.toString(),
              name: request.receiverId.name,
              email: request.receiverId.email,
              avatar: request.receiverId.avatar
            }
          },
          cursor: request._id.toString()
        })) 

        logger.info('Fetch sent requests', {
          userId: user.id,
          count: edges.length,
          hasNextPage,
        })

        return {
          edges,
          pageInfo: {
            hasNextPage,
            endCursor: edges[edges.length - 1]?.cursor
          }
        }
      } catch (error) {
        logger.error('Fetch sent requests error:', error)
        throw error
      } 
    },

    friendRequests: async (
      _: unknown,
      args: unknown,
      { models, user }: Context
    ) => {
      if (!user) throw AppError.unauthorized()
      if (!models?.Friend) throw new Error('Friend model not initialized')

      try {
        const { cursor, limit = 10 } = await validate(friendPaginationSchema, args)

        const query: any = {
          receiverId: user.id,
          status: FriendStatus.PENDING
        }

        if (cursor) {
          query._id = { $lt: new Types.ObjectId(cursor) }
        }

        const requests = await models.Friend
          .find(query)
          .sort({ _id: -1 })
          .limit(limit + 1)
          .populate('senderId', '-password')
          .populate('receiverId', '-password')
          .lean<PopulatedFriendRequest[]>()

        const hasNextPage = requests.length > limit
        const edges = requests.slice(0, limit).map((request) => ({
          node: {
            id: request._id.toString(),
            senderId: request.senderId._id.toString(),
            receiverId: request.receiverId._id.toString(),
            status: request.status,
            createdAt: request.createdAt,
            sender: {
              id: request.senderId._id.toString(),
              name: request.senderId.name,
              email: request.senderId.email,
              avatar: request.senderId.avatar
            },
            receiver: {
              id: request.receiverId._id.toString(),
              name: request.receiverId.name,
              email: request.receiverId.email,
              avatar: request.receiverId.avatar
            }
          },
          cursor: request._id.toString()
        }))

        logger.info("Fetch friend requests", {
          userId: user.id,
          count: edges.length,
          hasNextPage,
        });

        return {
          edges,
          pageInfo: {
            hasNextPage,
            endCursor: edges[edges.length - 1]?.cursor
          }
        }
      } catch (error) {
        logger.error('Fetch friend requests error:', error)
        throw error
      }
    },

    searchUsers: async (
      _: unknown,
      args: { query: string },
      { models, user }: { models: Models; user: Context["user"] }
    ) => {
      if (!user) throw AppError.unauthorized();

      try {
        const { query } = await validate(searchUsersSchema, args);

        const users = await models.User.find({
          $and: [
            { _id: { $ne: user.id } },
            {
              $or: [
                { name: { $regex: query, $options: "i" } },
                { email: { $regex: query, $options: "i" } },
              ],
            },
          ],
        }).select("-password");

        const usersWithStatus = await Promise.all(
          users.map(async (foundUser) => {
            const status = await models.Friend.getFriendStatus(
              user.id,
              foundUser._id.toString()
            );

            return {
              id: foundUser._id.toString(),
              name: foundUser.name,
              email: foundUser.email,
              avatar: foundUser.avatar,
              friendStatus: status,
            };
          })
        );

        logger.info("User search completed", {
          userId: user.id,
          query,
          resultsCount: usersWithStatus.length,
        });

        return usersWithStatus;
      } catch (error) {
        logger.error("Search users error:", error);
        throw error;
      }
    },
  },

  Mutation: {
    sendFriendRequest: async (
      _: unknown,
      { userId }: { userId: string },
      { models, user, pubsub }: Context
    ) => {
      if (!user) throw AppError.unauthorized()

      try {
        // Check if request already exists
        const existingRequest = await models.Friend.findOne({
          $or: [
            { senderId: user.id, receiverId: userId },
            { senderId: userId, receiverId: user.id }
          ]
        })

        if (existingRequest) {
          throw AppError.badRequest('Friend request already exists')
        }

        const friendRequest = await models.Friend.create({
          senderId: user.id,
          receiverId: userId,
          status: FriendStatus.PENDING
        }) 

        const request = await models.Friend
            .findOne({ _id: friendRequest._id })
            .populate('receiverId', '-password')
            .populate('senderId', '-password')
            .lean<PopulatedFriendRequest>()

        if (!request) {
          throw AppError.notFound('Friend request not found')
        }

        // Create activity
        await models.Activity.create({
          userId: user.id,
          type: ActivityType.FRIEND_REQUEST,
          message: 'sent a friend request',
          data: { targetUserId: userId }
        })

        // Format the response to match the GraphQL schema
        const response = {
          id: friendRequest._id.toString(),
          senderId: friendRequest.senderId._id.toString(), // Convert ObjectId to string
          receiverId: friendRequest.receiverId.toString(),
          status: friendRequest.status,
          createdAt: friendRequest.createdAt,
          sender: {
            id: request.senderId._id.toString(),
            name: request.senderId.name,
            email: request.senderId.email,
            avatar: request.senderId.avatar
          },
          receiver: {
            id: request.receiverId._id.toString(),
            name: request.receiverId.name,
            email: request.receiverId.email,
            avatar: request.receiverId.avatar
          }
        }

        pubsub.publish('FRIEND_UPDATED', { friendUpdated: response })

        logger.info('Friend request sent:', {
          senderId: user.id,
          receiverId: userId,
          requestId: friendRequest._id
        })

        // Send notification to receiver
        await sendNotification({
          userId: userId,
          type: NotificationType.FRIEND_REQUEST,
          title: 'New Friend Request',
          message: `${user.name} sent you a friend request`,
          data: {
            userId: user.id,
            requestId: friendRequest._id.toString()
          }
        }, { models, pubsub })

        return response
      } catch (error) {
        logger.error('Send friend request error:', error)
        throw error
      }
    },

    acceptFriendRequest: async (
      _: unknown,
      { requestId }: { requestId: string },
      { models, user, pubsub }: Context
    ) => {
      if (!user) throw AppError.unauthorized()

      try {
        const request = await models.Friend.findOne({
          _id: new Types.ObjectId(requestId),
          receiverId: user.id,
          status: FriendStatus.PENDING
        })
        .populate<PopulatedDocument>('senderId', '-password')

        if (!request) {
          throw AppError.notFound('Friend request not found')
        }

        request.status = FriendStatus.FRIENDS
        await request.save()

        // Format the response with sender information
        const response = {
          id: request._id.toString(),
          senderId: request.senderId._id.toString(),
          receiverId: request.receiverId.toString(),
          status: request.status,
          createdAt: request.createdAt,
          sender: {
            id: request.senderId._id.toString(),
            name: request.senderId.name,
            email: request.senderId.email,
            avatar: request.senderId.avatar
          }
        }

        // Create activity
        await models.Activity.create({
          userId: user.id,
          type: ActivityType.FRIEND_ACCEPT,
          message: 'accepted friend request',
          data: { targetUserId: request.senderId._id }
        })

        pubsub.publish('FRIEND_UPDATED', { friendUpdated: response })

        // Send notification to sender
        await sendNotification({
          userId: request.senderId._id.toString(),
          type: NotificationType.FRIEND_ACCEPT,
          title: 'Friend Request Accepted',
          message: `${user.name} accepted your friend request`,
          data: {
            userId: user.id,
            requestId: request._id.toString()
          }
        }, { models, pubsub })

        return response
      } catch (error) {
        logger.error('Accept friend request error:', error)
        throw error
      }
    },

    rejectFriendRequest: async (
      _: unknown,
      { requestId }: { requestId: string },
      { models, user, pubsub }: Context
    ) => {
      if (!user) throw AppError.unauthorized()

      try {
        const request = await models.Friend.findOne({
          _id: new Types.ObjectId(requestId),
          receiverId: user.id,
          status: FriendStatus.PENDING
        }).populate('senderId', '-password')

        if (!request) {
          throw AppError.notFound('Friend request not found')
        }

        // Instead of deleting, we'll remove the relationship
        await request.deleteOne()

        pubsub.publish('FRIEND_UPDATED', { 
          friendUpdated: {
            ...request.toObject(),
            status: FriendStatus.NONE
          }
        })

        return {
          success: true,
          message: 'Friend request rejected'
        }
      } catch (error) {
        logger.error('Reject friend request error:', error)
        throw error
      }
    },

    removeFriend: async (
      _: unknown,
      { friendId }: { friendId: string },
      { models, user, pubsub }: Context
    ) => {
      if (!user) throw AppError.unauthorized()

      try {
        const friendship = await models.Friend.findOne({
          _id: new Types.ObjectId(friendId),
          $or: [
            { senderId: user.id },
            { receiverId: user.id }
          ],
          status: FriendStatus.FRIENDS
        }).populate(['senderId', 'receiverId'])

        if (!friendship) {
          throw AppError.notFound('Friendship not found')
        }

        // Remove the friendship
        await friendship.deleteOne()

        // Publish subscription update
        pubsub.publish('FRIEND_UPDATED', {
          friendUpdated: {
            ...friendship.toObject(),
            status: FriendStatus.NONE
          }
        })

        return {
          success: true,
          message: 'Friend removed successfully'
        }
      } catch (error) {
        logger.error('Remove friend error:', error)
        throw error
      }
    },

    unsendFriendRequest: async (
      _: unknown,
      { requestId }: { requestId: string },
      { models, user, pubsub }: Context
    ) => {
      if (!user) throw AppError.unauthorized()

      try {
        const request = await models.Friend.findOne({
          _id: new Types.ObjectId(requestId),
          senderId: user.id,
          status: FriendStatus.PENDING
        }).populate('receiverId')

        if (!request) {
          throw AppError.notFound('Friend request not found')
        }

        // Start a session for transaction
        const session = await models.Friend.startSession()
        await session.withTransaction(async () => {
          // Remove the friend request
          await request.deleteOne({ session })

          // Remove related notifications
          await models.Notification.deleteMany({
            type: NotificationType.FRIEND_REQUEST, 
            userId: request.receiverId._id
          }, { session })
        })
        await session.endSession()

        // Publish subscription update
        pubsub.publish('FRIEND_UPDATED', {
          friendUpdated: {
            ...request.toObject(),
            status: FriendStatus.NONE
          }
        })

        return {
          success: true,
          message: 'Friend request cancelled'
        }
      } catch (error) {
        logger.error('Unsend friend request error:', error)
        throw error
      }
    }
  },

  Subscription: {
    friendUpdated: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(["FRIEND_UPDATED"]),
        (payload, _, context) => {
          if (!context.user) return false;

          const friend = payload.friendUpdated;
          // Only send updates to users who are part of the friendship
          return (
            friend.senderId === context.user.id ||
            friend.receiverId === context.user.id
          );
        }
      ),
      resolve: (payload: any) => {
        return payload.friendUpdated;
      },
    },
  },

  FriendRequest: {
    sender: async (parent: any, _: unknown, { models }: Context) => {
      try {
        if (parent.sender) return parent.sender

        const user = await models.User.findById(parent.senderId).select('-password')
        if (!user) throw new Error('Sender not found')

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          avatar: user.avatar
        }
      } catch (error) {
        logger.error('Resolve friend request sender error:', error)
        throw error
      }
    },
    receiver: async (parent: any, _: unknown, { models }: Context) => {
      try {
        if (parent.receiver) return parent.receiver

        const user = await models.User.findById(parent.receiverId).select('-password')
        if (!user) throw new Error('Receiver not found')

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          avatar: user.avatar
        }
      } catch (error) {
        logger.error('Resolve friend request receiver error:', error)
        throw error
      }
    }
  },

  Friend: {
    sender: async (parent: any, _: unknown, { models }: Context) => {
      if (parent.sender) return parent.sender

      const user = await models.User.findById(parent.senderId).select('-password')
      if (!user) throw new Error('Sender not found')

      return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        avatar: user.avatar
      }
    },
    receiver: async (parent: any, _: unknown, { models }: Context) => {
      if (parent.receiver) return parent.receiver

      const user = await models.User.findById(parent.receiverId).select('-password')
      if (!user) throw new Error('Receiver not found')

      return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        avatar: user.avatar
      }
    }
  }
};

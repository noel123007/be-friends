import { AppError } from "../common/errors/AppError";
import { Context } from "../types";
import { logger } from "../util/logger";

export const userResolvers = {
  Query: {
    searchUsers: async (
      _: unknown,
      { query }: { query: string },
      { models, user }: Context
    ) => {
      if (!user) throw AppError.unauthorized();

      try {
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

        return usersWithStatus;
      } catch (error) {
        logger.error("Search users error:", error);
        throw error;
      }
    },
  },

  User: {
    profile: async (parent: any, _: any, { models }: Context) => {
      try {
        if (!parent?.id) {
          logger.error("Invalid parent user in profile resolver", { parent });
          return null;
        }
        return await models.Profile.findOne({ userId: parent.id });
      } catch (error) {
        logger.error("Fetch user profile error:", error);
        throw error;
      }
    },
  },
};

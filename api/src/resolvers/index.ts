import { GraphQLDateTime, resolvers as scalarResolvers } from "graphql-scalars";
import { GraphQLUpload } from "graphql-upload-minimal";
import { activityResolvers } from "./activity";
import { authResolvers } from "./auth";
import { friendResolvers } from "./friend";
import { notificationResolvers } from "./notification";
import { profileResolvers } from "./profile";
import { tweetResolvers } from "./tweet";
import { userResolvers } from "./user";

export const resolvers = {
  ...scalarResolvers,

  Upload: GraphQLUpload,

  DateTime: GraphQLDateTime,

  Query: {
    ...authResolvers.Query,
    ...userResolvers.Query,
    ...friendResolvers.Query,
    ...activityResolvers.Query,
    ...notificationResolvers.Query,
    ...profileResolvers.Query,
    ...tweetResolvers.Query,
  },

  Mutation: {
    ...authResolvers.Mutation,
    ...friendResolvers.Mutation,
    ...notificationResolvers.Mutation,
    ...profileResolvers.Mutation,
    ...tweetResolvers.Mutation,
  },

  Subscription: {
    ...friendResolvers.Subscription,
    ...activityResolvers.Subscription,
    ...notificationResolvers.Subscription,
    ...profileResolvers.Subscription,
  },

  User: {
    ...userResolvers.User,
  },
};

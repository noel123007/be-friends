import { typeDefs as scalarTypeDefs } from "graphql-scalars";
import { GraphQLUpload } from "graphql-upload-minimal";

const baseTypeDefs = `
  scalar Upload

  enum ImageType {
    AVATAR
    COVER
  }

  input UploadImageInput {
    file: Upload!
    type: ImageType!
  }

  type User {
    id: ID!
    name: String!
    email: String!
    avatar: String
    lastLoginAt: DateTime!
    createdAt: DateTime!
    updatedAt: DateTime!
    profile: Profile
    friendStatus: FriendStatus
  }

  type Profile {
    id: ID!
    userId: ID!
    name: String!
    bio: String
    location: String
    website: String
    avatar: String
    coverImage: String
    socialLinks: SocialLinks
    stats: ProfileStats
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type SocialLinks {
    twitter: String
    github: String
    linkedin: String
  }

  type ProfileStats {
    friendsCount: Int!
    postsCount: Int!
    activitiesCount: Int!
  }

  type Activity {
    id: ID!
    type: ActivityType!
    message: String!
    createdAt: DateTime!
    user: User!
    data: JSON
  }

  type ActivityEdge {
    node: Activity!
    cursor: String!
  }

  type ActivityConnection {
    edges: [ActivityEdge!]!
    pageInfo: PageInfo!
  }

  type Friend {
    id: ID!
    senderId: ID!
    receiverId: ID!
    status: FriendStatus!
    createdAt: DateTime!
    sender: User!
    receiver: User!
  }

  type FriendRequest {
    id: ID!
    senderId: ID!
    receiverId: ID!
    status: FriendStatus!
    createdAt: DateTime!
    sender: User!
    receiver: User!
  }

  type Notification {
    id: ID!
    type: NotificationType!
    title: String!
    message: String!
    isRead: Boolean!
    createdAt: DateTime!
    data: NotificationData
  }

  type NotificationData {
    userId: ID
    requestId: ID
    messageId: ID
  }

  type NotificationPreferences {
    friendRequests: Boolean! 
    system: Boolean! 
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type PageInfo {
    hasNextPage: Boolean!
    endCursor: String
  }

  type FriendEdge {
    node: Friend!
    cursor: String!
  }

  type FriendConnection {
    edges: [FriendEdge!]!
    pageInfo: PageInfo!
  }

  type FriendRequestEdge {
    node: FriendRequest!
    cursor: String!
  }

  type FriendRequestConnection {
    edges: [FriendRequestEdge!]!
    pageInfo: PageInfo!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input RegisterInput {
    name: String!
    email: String!
    password: String!
  }

  input UpdateProfileInput {
    name: String
    bio: String
    location: String
    website: String
    socialLinks: SocialLinksInput
  }

  input SocialLinksInput {
    twitter: String
    github: String
    linkedin: String
  }

  input NotificationPreferencesInput {
    friendRequests: Boolean 
    system: Boolean 
  }

  enum ActivityType {
    FRIEND_REQUEST
    FRIEND_ACCEPT
    PROFILE_UPDATE
    SYSTEM
  }

  enum FriendStatus {
    NONE
    PENDING
    FRIENDS
    BLOCKED
  }

  enum NotificationType {
    FRIEND_REQUEST
    FRIEND_ACCEPT
    SYSTEM
    MESSAGE
  }

  scalar DateTime
  scalar JSON

  type Query {
    currentUser: User!
    profile(userId: ID): Profile!
    searchUsers(query: String!): [User!]!
    friends(cursor: String, limit: Int): FriendConnection!
    friendRequests(cursor: String, limit: Int): FriendRequestConnection!
    activities(
      cursor: String
      limit: Int
      type: [ActivityType]
    ): ActivityConnection!
    userActivities(
      userId: ID!
      type: [ActivityType]
      cursor: String
      limit: Int
    ): ActivityConnection!
    notifications(filters: NotificationFilters): [Notification!]!
    notificationPreferences: NotificationPreferences!
    validateResetToken(token: String!): ResetTokenValidation!
  }

  type Mutation {
    login(input: LoginInput!): AuthPayload!
    register(input: RegisterInput!): AuthPayload!
    updateProfile(input: UpdateProfileInput!): Profile!
    uploadProfileImage(input: UploadImageInput!): Profile!
    sendFriendRequest(userId: ID!): FriendRequest!
    acceptFriendRequest(requestId: ID!): FriendRequest!
    rejectFriendRequest(requestId: ID!): FriendRequest!
    blockUser(userId: ID!): Friend!
    unblockUser(userId: ID!): Friend!
    markNotificationRead(id: ID!): Notification!
    markAllNotificationsRead: SuccessResponse!
    updateNotificationPreferences(
      input: NotificationPreferencesInput!
    ): NotificationPreferences!
    forgotPassword(input: ForgotPasswordInput!): SuccessResponse!
    resetPassword(input: ResetPasswordInput!): AuthPayload!
  }

  type Subscription {
    activityCreated: Activity!
    userActivityCreated(userId: ID!): Activity!
    friendUpdated: Friend!
    notificationReceived: Notification!
    notificationUpdated: Notification!
    profileUpdated(userId: ID!): Profile!
  }

  input NotificationFilters {
    type: [NotificationType!]
    isRead: Boolean
  }

  input ForgotPasswordInput {
    email: String!
  }

  input ResetPasswordInput {
    token: String!
    password: String!
  }

  type ResetTokenValidation {
    valid: Boolean!
    message: String!
  }

  type SuccessResponse {
    success: Boolean!
    message: String!
  }
`;

export const resolvers = {
  Upload: GraphQLUpload,
  // ... other resolvers
};

export const typeDefs = [...scalarTypeDefs, baseTypeDefs];

import mongoose, { Document, Model, Schema } from "mongoose";
import { FriendStatus } from "../types/enums";

export interface IFriend extends Document {
  _id: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  receiverId: mongoose.Types.ObjectId;
  status: FriendStatus;
  createdAt: Date;
  updatedAt: Date;
}

interface IFriendModel extends Model<IFriend> {
  getFriendship(userId1: string, userId2: string): Promise<IFriend | null>;
  getFriendStatus(userId1: string, userId2: string): Promise<FriendStatus>;
  getPendingRequests(userId: string): Promise<IFriend[]>;
}

const friendSchema = new Schema<IFriend, IFriendModel>(
  {
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(FriendStatus),
      default: FriendStatus.PENDING,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for unique relationships
friendSchema.index(
  { senderId: 1, receiverId: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $ne: FriendStatus.BLOCKED } },
  }
);

// Indexes for common queries
friendSchema.index({ receiverId: 1, status: 1 });
friendSchema.index({ senderId: 1, status: 1 });

// Static methods for common operations
friendSchema.statics.getFriendship = async function (
  this: IFriendModel,
  userId1: string,
  userId2: string
): Promise<IFriend | null> {
  return this.findOne({
    $or: [
      { senderId: userId1, receiverId: userId2 },
      { senderId: userId2, receiverId: userId1 },
    ],
  });
};

friendSchema.statics.getFriendStatus = async function (
  this: IFriendModel,
  userId1: string,
  userId2: string
): Promise<FriendStatus> {
  const friendship = await this.getFriendship(userId1, userId2);
  return friendship ? friendship.status : FriendStatus.NONE;
};

friendSchema.statics.getPendingRequests = async function (
  this: IFriendModel,
  userId: string
): Promise<IFriend[]> {
  return this.find({
    receiverId: userId,
    status: FriendStatus.PENDING,
  })
    .populate("senderId", "-password")
    .sort({ createdAt: -1 });
};

export const Friend = mongoose.model<IFriend, IFriendModel>(
  "Friend",
  friendSchema
);

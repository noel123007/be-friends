import mongoose, { Document, Schema } from "mongoose";

export interface INotificationPreferences extends Document {
  userId: mongoose.Types.ObjectId;
  friendRequests: boolean; 
  system: boolean; 
}

const notificationPreferencesSchema = new Schema<INotificationPreferences>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    friendRequests: {
      type: Boolean,
      default: true,
    }, 
    system: {
      type: Boolean,
      default: true,
    }, 
  },
  {
    timestamps: true,
  }
);

export const NotificationPreferences = mongoose.model<INotificationPreferences>(
  "NotificationPreferences",
  notificationPreferencesSchema
);

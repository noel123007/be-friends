import mongoose, { Document, Schema } from "mongoose";
import { ActivityType } from "../types/enums";

export interface IActivity extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  type: ActivityType;
  message: string;
  data?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  user?: mongoose.Types.ObjectId;
}

const activitySchema = new Schema<IActivity>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(ActivityType),
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    data: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

activitySchema.virtual("user", {
  ref: "User",
  localField: "userId",
  foreignField: "_id",
  justOne: true,
});

activitySchema.index({ userId: 1, type: 1 });
activitySchema.index({ createdAt: -1 });

export const Activity = mongoose.model<IActivity>("Activity", activitySchema);

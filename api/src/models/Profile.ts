import mongoose, { Document, Schema, Types } from "mongoose";

export interface ISocialLinks {
  twitter?: string;
  github?: string;
  linkedin?: string;
}

export interface IProfile extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  name: string;
  bio?: string;
  location?: string;
  website?: string;
  avatar?: string;
  coverImage?: string;
  socialLinks?: ISocialLinks;
  createdAt: Date;
  updatedAt: Date;
}

const profileSchema = new Schema<IProfile>(
  {
    _id: {
      type: Schema.Types.ObjectId,
      auto: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    bio: String,
    location: String,
    website: String,
    avatar: String,
    coverImage: String,
    socialLinks: {
      twitter: String,
      github: String,
      linkedin: String,
    },
  },
  {
    timestamps: true,
  }
);

profileSchema.pre('save', function(next) {
  if (this._id?.equals(this.userId)) {
    this._id = new Types.ObjectId();
  }
  next();
});

export const Profile = mongoose.model<IProfile>("Profile", profileSchema);

import { Request } from "express";
import { PubSub } from "graphql-subscriptions";
import { Activity } from "../models/Activity";
import { Friend } from "../models/Friend";
import { Notification } from "../models/Notification";
import { NotificationPreferences } from "../models/NotificationPreferences";
import { Profile } from "../models/Profile";
import { User } from "../models/User";
import { Tweet } from "../models/tweet";

// Define model types
export interface Models {
  Friend: typeof Friend;
  User: typeof User;
  Activity: typeof Activity;
  Profile: typeof Profile;
  Notification: typeof Notification;
  NotificationPreferences: typeof NotificationPreferences;
  Tweet: typeof Tweet;
}

export interface Context {
  models: Models;
  user?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  req?: Request;
  pubsub: PubSub;
}

declare global {
  namespace Express {
    interface Request {
      user?: Context["user"];
    }
  }
}

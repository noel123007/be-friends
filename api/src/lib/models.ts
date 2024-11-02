import { Activity } from "../models/Activity"
import { Friend } from "../models/Friend"
import { Notification } from "../models/Notification"
import { NotificationPreferences } from "../models/NotificationPreferences"
import { Profile } from "../models/Profile"
import { User } from "../models/User"
import { Models } from "../types"

export function getTypedModels(): Models {
  // Initialize all models
  const models: Models = {
    Friend,
    User,
    Activity,
    Profile,
    Notification,
    NotificationPreferences
  }

  return models
}

// Export models for direct use
export const models = getTypedModels() 
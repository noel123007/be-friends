import { INotificationPreferences } from "@/models"
import { Context } from "../types"
import { NotificationType } from "../types/enums"
import { logger } from "./logger"

interface SendNotificationOptions {
  userId: string
  type: NotificationType
  title: string
  message: string
  data?: Record<string, unknown>
}

export async function sendNotification(
  { userId, type, title, message, data }: SendNotificationOptions,
  { models, pubsub }: Context
) {
  try {
    // Check notification preferences
    const preferences = await models.NotificationPreferences.findOne({ userId })
    
    // Map notification type to preference field
    const preferenceMap: Record<NotificationType, keyof INotificationPreferences> = {
      [NotificationType.FRIEND_REQUEST]: 'friendRequests',
      [NotificationType.FRIEND_ACCEPT]: 'friendRequests', 
      [NotificationType.SYSTEM]: 'system'
    }

    const preferenceField = preferenceMap[type]
    if (!preferences || !preferences[preferenceField]) {
      return null
    }

    const notification = await models.Notification.create({
      userId,
      type,
      title,
      message,
      data
    })

    // Publish notification
    pubsub.publish(`NOTIFICATION_RECEIVED_${userId}`, {
      notificationReceived: {
        id: notification._id.toString(),
        type: notification.type,
        title: notification.title,
        message: notification.message,
        isRead: notification.isRead,
        createdAt: notification.createdAt,
        data: notification.data
      }
    })

    return notification
  } catch (error) {
    logger.error('Send notification error:', error)
    return null
  }
} 
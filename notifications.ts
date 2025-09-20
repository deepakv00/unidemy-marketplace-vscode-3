export interface Notification {
  id: number
  userId: number
  title: string
  message: string
  type: "message" | "product" | "system"
  isRead: boolean
  timestamp: string
  actionUrl?: string
}

// Mock notifications database
const notifications: Notification[] = []

export function getNotificationsByUserId(userId: number): Notification[] {
  return notifications
    .filter((notif) => notif.userId === userId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

export function addNotification(notification: Omit<Notification, "id">): Notification {
  const newNotification: Notification = {
    ...notification,
    id: notifications.length + 1,
  }
  notifications.push(newNotification)
  return newNotification
}

export function markNotificationAsRead(notificationId: number): void {
  const notification = notifications.find((notif) => notif.id === notificationId)
  if (notification) {
    notification.isRead = true
  }
}

export function getUnreadNotificationCount(userId: number): number {
  return notifications.filter((notif) => notif.userId === userId && !notif.isRead).length
}

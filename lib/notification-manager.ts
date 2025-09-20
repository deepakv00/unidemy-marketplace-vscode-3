import { getUnreadMessageCount } from '@/lib/api/messages'
import { getWishlistCount } from '@/lib/api/wishlist'

interface NotificationCounts {
  messages: number
  wishlist: number
}

class NotificationManager {
  private static instance: NotificationManager
  private refreshCallbacks: Set<(counts: NotificationCounts) => void> = new Set()
  private lastRefreshTime: number = 0
  private refreshCooldown: number = 500 // 500ms cooldown between refreshes

  static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager()
    }
    return NotificationManager.instance
  }

  subscribe(callback: (counts: NotificationCounts) => void): () => void {
    this.refreshCallbacks.add(callback)
    return () => this.refreshCallbacks.delete(callback)
  }

  async refresh(userId: string): Promise<void> {
    const now = Date.now()
    
    // Implement cooldown to prevent excessive refreshes
    if (now - this.lastRefreshTime < this.refreshCooldown) {
      console.log('Notification refresh skipped due to cooldown')
      return
    }
    
    this.lastRefreshTime = now

    try {
      console.log(`Refreshing notifications for user ${userId}`)
      
      const [messagesCount, wishlistCount] = await Promise.all([
        getUnreadMessageCount(userId),
        getWishlistCount(userId)
      ])

      const counts: NotificationCounts = {
        messages: messagesCount,
        wishlist: wishlistCount
      }

      console.log('Notification counts updated:', counts)
      
      // Notify all subscribers
      this.refreshCallbacks.forEach(callback => {
        try {
          callback(counts)
        } catch (error) {
          console.error('Error in notification callback:', error)
        }
      })
    } catch (error) {
      console.error('Error refreshing notifications:', error)
    }
  }

  async refreshWithDelay(userId: string, delay: number = 200): Promise<void> {
    setTimeout(() => this.refresh(userId), delay)
  }

  // Force refresh without cooldown (use sparingly)
  async forceRefresh(userId: string): Promise<void> {
    this.lastRefreshTime = 0
    await this.refresh(userId)
  }
}

export const notificationManager = NotificationManager.getInstance()
export type { NotificationCounts }

import { useState, useEffect, createContext, useContext } from 'react'
import { createClient } from '@/lib/supabase-client'
import { getWishlistCount } from '@/lib/api/wishlist'
import { getUnreadMessageCount } from '@/lib/api/messages'

interface NotificationCounts {
  wishlistCount: number
  unreadMessagesCount: number
  refreshCounts: () => Promise<void>
  setWishlistCount: (count: number) => void
  setUnreadMessagesCount: (count: number) => void
}

const NotificationContext = createContext<NotificationCounts | null>(null)

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

export const useNotificationCounts = (userId: string | null) => {
  const [wishlistCount, setWishlistCount] = useState(0)
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0)
  const supabase = createClient()

  const refreshCounts = async () => {
    if (!userId) {
      setWishlistCount(0)
      setUnreadMessagesCount(0)
      return
    }

    try {
      const [wishlistCountData, messagesCountData] = await Promise.all([
        getWishlistCount(userId),
        getUnreadMessageCount(userId)
      ])
      
      setWishlistCount(wishlistCountData)
      setUnreadMessagesCount(messagesCountData)
    } catch (error) {
      console.error('Error refreshing notification counts:', error)
    }
  }

  useEffect(() => {
    refreshCounts()
  }, [userId])

  // Refresh counts periodically
  useEffect(() => {
    if (!userId) return

    const interval = setInterval(refreshCounts, 30000) // Every 30 seconds
    return () => clearInterval(interval)
  }, [userId])

  return {
    wishlistCount,
    unreadMessagesCount,
    refreshCounts,
    setWishlistCount,
    setUnreadMessagesCount
  }
}

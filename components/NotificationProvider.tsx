"use client"

import { createContext, useContext, ReactNode } from 'react'
import { useNotificationCounts } from '@/lib/hooks/useNotifications'

interface NotificationContextType {
  wishlistCount: number
  unreadMessagesCount: number
  refreshCounts: () => Promise<void>
  setWishlistCount: (count: number) => void
  setUnreadMessagesCount: (count: number) => void
}

const NotificationContext = createContext<NotificationContextType | null>(null)

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    return {
      wishlistCount: 0,
      unreadMessagesCount: 0,
      refreshCounts: async () => {},
      setWishlistCount: () => {},
      setUnreadMessagesCount: () => {}
    }
  }
  return context
}

interface NotificationProviderProps {
  children: ReactNode
  userId: string | null
}

export function NotificationProvider({ children, userId }: NotificationProviderProps) {
  const notificationCounts = useNotificationCounts(userId)

  return (
    <NotificationContext.Provider value={notificationCounts}>
      {children}
    </NotificationContext.Provider>
  )
}

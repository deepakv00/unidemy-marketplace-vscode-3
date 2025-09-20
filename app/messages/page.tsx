"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase-client"
import { getConversations, getMessages, sendMessage, createOrGetConversation, subscribeToMessages, markMessagesAsRead } from "@/lib/api/messages"
import { notificationManager } from "@/lib/notification-manager"
import { getProductById } from "@/lib/api/products"
import type { Database } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, Send, Search, User, Phone, MoreVertical, ImageIcon } from "lucide-react"

type ConversationWithDetails = {
  id: string
  buyer_id: string
  seller_id: string
  product_id: number
  last_message_at: string
  buyer: any
  seller: any
  product: any
  unread_count: number
}

type MessageWithSender = {
  id: string
  conversation_id: string
  sender_id: string
  receiver_id: string
  content: string
  created_at: string
  sender: any
}

const MessagesPage = () => {
  const supabase = createClient()
  const searchParams = useSearchParams()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [conversations, setConversations] = useState<ConversationWithDetails[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<MessageWithSender[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [sendingMessage, setSendingMessage] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Load user and conversations
  useEffect(() => {
    async function loadUserAndConversations() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
        
        if (user) {
          const conversationsData = await getConversations(user.id)
          setConversations(conversationsData)
        }
      } catch (error) {
        console.error('Error loading conversations:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadUserAndConversations()
  }, [])

  // Check for URL parameters to auto-start a conversation
  useEffect(() => {
    async function handleURLParams() {
      if (!user) return
      
      const sellerName = searchParams.get("seller")
      const productId = searchParams.get("product")

      if (sellerName && productId) {
        try {
          // Get product details to find seller ID
          const product = await getProductById(Number(productId))
          if (product && product.seller_id !== user.id) {
            // Create or get conversation
            const conversation = await createOrGetConversation(
              user.id, // buyer
              product.seller_id, // seller
              Number(productId)
            )
            
            if (conversation) {
              setSelectedConversation(conversation.id)
              setNewMessage(`Hi! I'm interested in your product "${product.title}". Is it still available?`)
              
              // Refresh conversations list to include the new conversation
              const updatedConversations = await getConversations(user.id)
              setConversations(updatedConversations)
            }
          }
        } catch (error) {
          console.error('Error creating conversation:', error)
        }
      }
    }
    
    handleURLParams()
  }, [user, searchParams])

  // Load messages for selected conversation
  useEffect(() => {
    async function loadMessages() {
      if (!selectedConversation) {
        setMessages([])
        return
      }
      
      try {
        setLoadingMessages(true)
        const messagesData = await getMessages(selectedConversation)
        setMessages(messagesData)
        
        // Mark messages as read when conversation is opened
        if (user) {
          await markMessagesAsRead(selectedConversation, user.id)
          
          // Update the conversations list to clear unread count for this conversation
          setConversations(prev => 
            prev.map(conv => 
              conv.id === selectedConversation 
                ? { ...conv, unread_count: 0 }
                : conv
            )
          )
          
          // Refresh header notification counts with a small delay to ensure DB is updated
          if (user) {
            notificationManager.refreshWithDelay(user.id, 200)
          }
        }
      } catch (error) {
        console.error('Error loading messages:', error)
      } finally {
        setLoadingMessages(false)
      }
    }
    
    loadMessages()
  }, [selectedConversation, user])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Subscribe to real-time messages
  useEffect(() => {
    if (!selectedConversation || !user) return
    
    const subscription = subscribeToMessages(selectedConversation, async (newMessage) => {
      // Only add message if it's not already in the list (avoid duplicates)
      setMessages(prev => {
        const messageExists = prev.some(msg => msg.id === newMessage.id)
        if (messageExists) return prev
        return [...prev, newMessage]
      })
      
      // Update conversations list with latest message time
      setConversations(prev =>
        prev.map(conv =>
          conv.id === selectedConversation
            ? { ...conv, last_message_at: newMessage.created_at }
            : conv
        )
      )
      
      // If the new message is received (not sent by current user), mark it as read immediately
      // since the user is actively viewing this conversation
      if (newMessage.receiver_id === user.id) {
        await markMessagesAsRead(selectedConversation, user.id)
        
        // Update conversations list to clear unread count
        setConversations(prev => 
          prev.map(conv => 
            conv.id === selectedConversation 
              ? { ...conv, unread_count: 0 }
              : conv
          )
        )
        
        // Refresh header notification counts with delay to ensure DB is updated
        if (user) {
          notificationManager.refreshWithDelay(user.id, 200)
        }
      }
    })
    
    return () => {
      subscription?.unsubscribe()
    }
  }, [selectedConversation, user])

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !user || sendingMessage) return
    
    const messageContent = newMessage.trim()
    setSendingMessage(true)
    setNewMessage("") // Clear input immediately for better UX
    
    try {
      const selectedConv = conversations.find(c => c.id === selectedConversation)
      if (!selectedConv) return
      
      const receiverId = selectedConv.buyer_id === user.id ? selectedConv.seller_id : selectedConv.buyer_id
      
      // Optimistically add message to UI immediately
      const optimisticMessage = {
        id: `temp-${Date.now()}`,
        conversation_id: selectedConversation,
        sender_id: user.id,
        receiver_id: receiverId,
        content: messageContent,
        created_at: new Date().toISOString(),
        sender: {
          id: user.id,
          name: user.user_metadata?.name || user.email,
          avatar: user.user_metadata?.avatar_url
        }
      }
      
      setMessages(prev => [...prev, optimisticMessage])
      
      const sentMessage = await sendMessage(
        selectedConversation,
        user.id,
        receiverId,
        messageContent,
        selectedConv.product_id
      )
      
      if (sentMessage) {
        // Replace optimistic message with real one
        setMessages(prev => 
          prev.map(msg => 
            msg.id === optimisticMessage.id ? sentMessage : msg
          )
        )
        
        // Update conversations list to show this as latest message
        setConversations(prev =>
          prev.map(conv =>
            conv.id === selectedConversation
              ? { ...conv, last_message_at: sentMessage.created_at }
              : conv
          )
        )
        
        // Refresh header notification counts with delay to ensure DB is updated
        if (user) {
          notificationManager.refreshWithDelay(user.id, 200)
        }
        
        // Also refresh immediately to prevent notification accumulation
        if (user) {
          notificationManager.refresh(user.id)
        }
      } else {
        // Remove optimistic message if send failed
        setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id))
        // Re-add the message to input
        setNewMessage(messageContent)
      }
    } catch (error) {
      console.error('Error sending message:', error)
      // Remove optimistic message and restore input on error
      setMessages(prev => prev.filter(msg => !msg.id.startsWith('temp-')))
      setNewMessage(messageContent)
    } finally {
      setSendingMessage(false)
    }
  }

  const filteredConversations = conversations.filter((conv) => {
    const otherUser = conv.buyer_id === user?.id ? conv.seller : conv.buyer
    const searchLower = searchQuery.toLowerCase()
    return (
      otherUser?.name?.toLowerCase().includes(searchLower) ||
      conv.product?.title?.toLowerCase().includes(searchLower)
    )
  })

  const selectedConv = conversations.find((c) => c.id === selectedConversation)
  const otherUser = selectedConv ? (selectedConv.buyer_id === user?.id ? selectedConv.seller : selectedConv.buyer) : null
  
  // Helper function to format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    } else if (diffDays === 1) {
      return 'Yesterday'
    } else {
      return `${diffDays} days ago`
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-6">
          <MessageCircle className="h-6 w-6 text-blue-500" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Messages</h1>
          {user && (
            <Badge variant="secondary" className="ml-2">
              {conversations.filter((c) => c.unread_count > 0).length} unread
            </Badge>
          )}
        </div>

        {loading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300">Loading messages...</h3>
              </div>
            </CardContent>
          </Card>
        ) : !user ? (
          <Card>
            <CardContent className="flex items-center justify-center py-16">
              <div className="text-center">
                <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-2">Sign in to view messages</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  You need to be signed in to access your messages
                </p>
                <Button onClick={() => (window.location.href = "/auth/login")}>Sign In</Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[700px]">
            {/* Conversations List */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg">Conversations</CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-1 max-h-[500px] overflow-y-auto">
                  {filteredConversations.length === 0 ? (
                    <div className="p-8 text-center">
                      <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">No conversations yet</p>
                    </div>
                  ) : (
                    filteredConversations.map((conversation) => {
                      const otherUser = conversation.buyer_id === user?.id ? conversation.seller : conversation.buyer
                      return (
                        <div
                          key={conversation.id}
                          onClick={() => setSelectedConversation(conversation.id)}
                          className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 border-b transition-colors ${
                            selectedConversation === conversation.id ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200" : ""
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <Avatar>
                                <AvatarImage src={otherUser?.avatar || "/placeholder.svg"} />
                                <AvatarFallback>
                                  {otherUser?.name?.charAt(0) || <User className="h-4 w-4" />}
                                </AvatarFallback>
                              </Avatar>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="font-medium truncate text-gray-900 dark:text-white">
                                  {otherUser?.name || 'Unknown User'}
                                </p>
                                {conversation.unread_count > 0 && (
                                  <Badge variant="destructive" className="text-xs">
                                    {conversation.unread_count}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                {conversation.last_message?.content || 'No messages yet'}
                              </p>
                              <p className="text-xs text-gray-400 dark:text-gray-500">
                                {conversation.product?.title || 'Product'} • {formatTime(conversation.last_message_at)}
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Chat Area */}
            <Card className="lg:col-span-2">
              {selectedConversation && selectedConv ? (
                <>
                  <CardHeader className="border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar>
                            <AvatarImage src={selectedConv.avatar || "/placeholder.svg"} />
                            <AvatarFallback>
                              <User className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                          {selectedConv.online && (
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                          )}
                        </div>
                        <div>
                          <CardTitle className="text-lg text-gray-900 dark:text-white">
                            {otherUser?.name || 'Unknown User'}
                          </CardTitle>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            About: {selectedConv.product?.title || 'Product'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col h-[500px]">
                    <div className="flex-1 overflow-y-auto space-y-4 py-4">
                      {loadingMessages ? (
                        <div className="flex justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                      ) : messages.length === 0 ? (
                        <div className="flex justify-center items-center h-full">
                          <p className="text-gray-500 dark:text-gray-400">No messages yet. Start the conversation!</p>
                        </div>
                      ) : (
                        messages.map((message) => {
                          const isOwn = message.sender_id === user?.id
                          return (
                            <div key={message.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                              <div
                                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                  isOwn
                                    ? "bg-blue-500 text-white"
                                    : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                                }`}
                              >
                                <p className="text-sm">{message.content}</p>
                                <p
                                  className={`text-xs mt-1 ${
                                    isOwn ? "text-blue-100" : "text-gray-500 dark:text-gray-400"
                                  }`}
                                >
                                  {formatTime(message.created_at)}
                                </p>
                              </div>
                            </div>
                          )
                        })
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                    <div className="flex gap-2 pt-4 border-t">
                      <Button variant="outline" size="icon" className="shrink-0 bg-transparent">
                        <ImageIcon className="h-4 w-4" />
                      </Button>
                      <Textarea
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="flex-1 min-h-[40px] max-h-[120px] resize-none"
                        onKeyPress={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault()
                            handleSendMessage()
                          }
                        }}
                      />
                      <Button
                        onClick={handleSendMessage}
                        size="icon"
                        disabled={!newMessage.trim() || sendingMessage}
                        className="shrink-0"
                      >
                        {sendingMessage ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </>
              ) : (
                <CardContent className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-2">Select a conversation</h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      Choose a conversation from the list to start messaging
                    </p>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

export default MessagesPage

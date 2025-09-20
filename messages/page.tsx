"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useSearchParams } from "next/navigation"
import { Search, Send, Phone, Video, MoreVertical, Paperclip, Smile } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useApp } from "@/lib/store"
import { getProductById } from "@/lib/products"

// Mock conversations data
const conversations = [
  {
    id: 1,
    name: "Sarah Johnson",
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "Is the iPhone still available?",
    timestamp: "2m ago",
    unread: 2,
    online: true,
    listing: {
      title: "iPhone 15 Pro Max",
      price: 65000,
      image: "/placeholder.svg?height=50&width=50",
    },
  },
  {
    id: 2,
    name: "Mike Davis",
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "Thanks for the quick response!",
    timestamp: "1h ago",
    unread: 0,
    online: false,
    listing: {
      title: 'MacBook Pro 16"',
      price: 180000,
      image: "/placeholder.svg?height=50&width=50",
    },
  },
  {
    id: 3,
    name: "Emily Chen",
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "Can we meet tomorrow?",
    timestamp: "3h ago",
    unread: 1,
    online: true,
    listing: {
      title: "Gaming Setup",
      price: 125000,
      image: "/placeholder.svg?height=50&width=50",
    },
  },
]

// Mock messages for selected conversation
const messages = [
  {
    id: 1,
    senderId: 2,
    content: "Hi! I'm interested in your iPhone 15 Pro Max. Is it still available?",
    timestamp: "10:30 AM",
    isOwn: false,
  },
  {
    id: 2,
    senderId: 1,
    content: "Yes, it's still available! It's in excellent condition, barely used.",
    timestamp: "10:32 AM",
    isOwn: true,
  },
  {
    id: 3,
    senderId: 2,
    content: "Great! Can you tell me more about the condition and reason for selling?",
    timestamp: "10:35 AM",
    isOwn: false,
  },
  {
    id: 4,
    senderId: 1,
    content:
      "It's in like-new condition. I'm upgrading to the latest model. Always used with a case and screen protector.",
    timestamp: "10:36 AM",
    isOwn: true,
  },
  {
    id: 5,
    senderId: 2,
    content: "Perfect! Would you be willing to meet in Mumbai? I can come to your location.",
    timestamp: "10:40 AM",
    isOwn: false,
  },
]

export default function MessagesPage() {
  const { state } = useApp()
  const searchParams = useSearchParams()
  const sellerParam = searchParams.get("seller")
  const productIdParam = searchParams.get("product")
  const [selectedConversation, setSelectedConversation] = useState(conversations[0])
  const [newMessage, setNewMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [conversationList, setConversationList] = useState([...conversations])

  // Handle URL parameters for new conversations
  useEffect(() => {
    if (!sellerParam || !productIdParam) return

    const product = getProductById(Number(productIdParam))
    if (!product) return

    let conv = conversationList.find((c) => c.name === sellerParam && c.listing.title === product.title)

    if (!conv) {
      conv = {
        id: conversationList.length + 1,
        name: sellerParam,
        avatar: "/placeholder.svg?height=40&width=40",
        lastMessage: "Start a conversation...",
        timestamp: "now",
        unread: 0,
        online: true,
        listing: {
          title: product.title,
          price: product.price,
          image: product.image,
        },
      }
      // add only once
      setConversationList((prev) => [...prev, conv])
    }

    // update selected conversation only if it changed
    setSelectedConversation((prev) => (prev?.id !== conv!.id ? conv : prev))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sellerParam, productIdParam])

  if (!state.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Sign in to view messages</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">You need to be signed in to access your messages.</p>
            <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // Handle sending message
      console.log("Sending message:", newMessage)
      setNewMessage("")
    }
  }

  const filteredConversations = conversationList.filter(
    (conv) =>
      conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.listing.title.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Conversations Sidebar */}
      <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-bold mb-4">Messages</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => setSelectedConversation(conversation)}
              className={`p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                selectedConversation.id === conversation.id
                  ? "bg-blue-50 dark:bg-blue-900/20 border-r-2 border-r-blue-500"
                  : ""
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="relative">
                  <Avatar>
                    <AvatarImage src={conversation.avatar || "/placeholder.svg"} alt={conversation.name} />
                    <AvatarFallback>{conversation.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  {conversation.online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium text-gray-900 dark:text-white truncate">{conversation.name}</h3>
                    <span className="text-xs text-gray-500">{conversation.timestamp}</span>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate mb-2">{conversation.lastMessage}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded overflow-hidden">
                        <Image
                          src={conversation.listing.image || "/placeholder.svg"}
                          alt={conversation.listing.title}
                          width={32}
                          height={32}
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-900 dark:text-white truncate max-w-24">
                          {conversation.listing.title}
                        </p>
                        <p className="text-xs text-green-600 font-medium">
                          ₹{conversation.listing.price.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {conversation.unread > 0 && (
                      <Badge className="bg-blue-500 text-white text-xs">{conversation.unread}</Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Avatar>
                  <AvatarImage
                    src={selectedConversation.avatar || "/placeholder.svg"}
                    alt={selectedConversation.name}
                  />
                  <AvatarFallback>{selectedConversation.name.charAt(0)}</AvatarFallback>
                </Avatar>
                {selectedConversation.online && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                )}
              </div>
              <div>
                <h2 className="font-semibold text-gray-900 dark:text-white">{selectedConversation.name}</h2>
                <p className="text-sm text-gray-500">{selectedConversation.online ? "Online" : "Last seen 2h ago"}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <Phone className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Video className="h-4 w-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>View Profile</DropdownMenuItem>
                  <DropdownMenuItem>Block User</DropdownMenuItem>
                  <DropdownMenuItem>Report</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Listing Info */}
          <Card className="mt-4">
            <CardContent className="p-3">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-lg overflow-hidden">
                  <Image
                    src={selectedConversation.listing.image || "/placeholder.svg"}
                    alt={selectedConversation.listing.title}
                    width={48}
                    height={48}
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 dark:text-white">{selectedConversation.listing.title}</h3>
                  <p className="text-lg font-bold text-green-600">
                    ₹{selectedConversation.listing.price.toLocaleString()}
                  </p>
                </div>
                <Button size="sm" variant="outline">
                  View Ad
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.isOwn ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                  message.isOwn ? "bg-blue-500 text-white" : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className={`text-xs mt-1 ${message.isOwn ? "text-blue-100" : "text-gray-500"}`}>
                  {message.timestamp}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-end space-x-2">
            <Button variant="ghost" size="sm" className="mb-2">
              <Paperclip className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <Textarea
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="min-h-[40px] max-h-32 resize-none"
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
              />
            </div>
            <Button variant="ghost" size="sm" className="mb-2">
              <Smile className="h-4 w-4" />
            </Button>
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="mb-2 bg-blue-500 hover:bg-blue-600"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

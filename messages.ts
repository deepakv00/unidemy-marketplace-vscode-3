export interface Message {
  id: number
  senderId: number
  receiverId: number
  content: string
  timestamp: string
  productId?: number
  isRead: boolean
}

export interface Conversation {
  id: number
  participants: number[]
  lastMessage: Message
  productId?: number
}

// Mock messages database
const messages: Message[] = []
const conversations: Conversation[] = []

export function getConversationsByUserId(userId: number): Conversation[] {
  return conversations.filter((conv) => conv.participants.includes(userId))
}

export function getMessagesByConversationId(conversationId: number): Message[] {
  return messages.filter((msg) => {
    const conversation = conversations.find((conv) => conv.id === conversationId)
    return (
      conversation &&
      conversation.participants.includes(msg.senderId) &&
      conversation.participants.includes(msg.receiverId)
    )
  })
}

export function sendMessage(senderId: number, receiverId: number, content: string, productId?: number): Message {
  const newMessage: Message = {
    id: messages.length + 1,
    senderId,
    receiverId,
    content,
    timestamp: new Date().toISOString(),
    productId,
    isRead: false,
  }

  messages.push(newMessage)

  // Find or create conversation
  let conversation = conversations.find(
    (conv) => conv.participants.includes(senderId) && conv.participants.includes(receiverId),
  )

  if (!conversation) {
    conversation = {
      id: conversations.length + 1,
      participants: [senderId, receiverId],
      lastMessage: newMessage,
      productId,
    }
    conversations.push(conversation)
  } else {
    conversation.lastMessage = newMessage
  }

  return newMessage
}

export function markMessageAsRead(messageId: number): void {
  const message = messages.find((msg) => msg.id === messageId)
  if (message) {
    message.isRead = true
  }
}

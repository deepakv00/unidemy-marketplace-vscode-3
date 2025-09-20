import { getSupabaseClient } from "../supabase-client"
import type { Database } from "../supabase"

type Conversation = Database["public"]["Tables"]["conversations"]["Row"]
type Message = Database["public"]["Tables"]["messages"]["Row"]
type User = Database["public"]["Tables"]["users"]["Row"]

export interface ConversationWithDetails extends Conversation {
  buyer: User
  seller: User
  product: {
    id: number
    title: string
    price: number
    image: string
  }
  last_message?: Message
  unread_count: number
}

export interface MessageWithSender extends Message {
  sender: User
}

export async function getConversations(userId: string): Promise<ConversationWithDetails[]> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from("conversations")
    .select(`
      *,
      buyer:users!conversations_buyer_id_fkey (
        id,
        name,
        avatar,
        verified
      ),
      seller:users!conversations_seller_id_fkey (
        id,
        name,
        avatar,
        verified
      ),
      products!conversations_product_id_fkey (
        id,
        title,
        price,
        images
      )
    `)
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
    .order("last_message_at", { ascending: false })

  if (error) {
    console.error("Error fetching conversations:", error)
    return []
  }

  // Get unread counts for each conversation
  const conversationsWithUnread = await Promise.all(
    (data || []).map(async (conv) => {
      const { count } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("conversation_id", conv.id)
        .eq("receiver_id", userId)
        .neq("sender_id", userId) // Don't count messages sent by the user themselves
        .is("read_at", null)

      return {
        ...conv,
        unread_count: count || 0,
        product: {
          id: conv.products.id,
          title: conv.products.title,
          price: conv.products.price,
          image: conv.products.images?.[0] || "/placeholder.svg",
        },
      }
    }),
  )

  return conversationsWithUnread
}

export async function getMessages(conversationId: string): Promise<MessageWithSender[]> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from("messages")
    .select(`
      *,
      sender:users!messages_sender_id_fkey (
        id,
        name,
        avatar
      )
    `)
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })

  if (error) {
    console.error("Error fetching messages:", error)
    return []
  }

  return data || []
}

export async function sendMessage(
  conversationId: string,
  senderId: string,
  receiverId: string,
  content: string,
  productId?: number,
): Promise<Message | null> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      receiver_id: receiverId,
      content,
      product_id: productId,
    })
    .select()
    .single()

  if (error) {
    console.error("Error sending message:", error)
    return null
  }

  // Update conversation's last_message_at
  await supabase.from("conversations").update({ last_message_at: new Date().toISOString() }).eq("id", conversationId)

  return data
}

export async function createOrGetConversation(
  buyerId: string,
  sellerId: string,
  productId: number,
): Promise<Conversation | null> {
  const supabase = getSupabaseClient()

  // First, try to find existing conversation
  const { data: existing } = await supabase
    .from("conversations")
    .select("*")
    .eq("buyer_id", buyerId)
    .eq("seller_id", sellerId)
    .eq("product_id", productId)
    .single()

  if (existing) {
    return existing
  }

  // Create new conversation
  const { data, error } = await supabase
    .from("conversations")
    .insert({
      buyer_id: buyerId,
      seller_id: sellerId,
      product_id: productId,
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating conversation:", error)
    return null
  }

  return data
}

export async function markMessagesAsRead(conversationId: string, userId: string): Promise<boolean> {
  const supabase = getSupabaseClient()

  console.log(`Marking messages as read for conversation ${conversationId}, user ${userId}`)

  const { data, error } = await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .eq("receiver_id", userId)
    .is("read_at", null)
    .select()

  if (error) {
    console.error("Error marking messages as read:", error)
    return false
  }

  console.log(`Marked ${data?.length || 0} messages as read`)
  return true
}

export async function getUnreadMessageCount(userId: string): Promise<number> {
  const supabase = getSupabaseClient()

  // Get unread messages count, ensuring we only count messages where the user is the receiver
  // and the message is not from themselves
  const { count, error } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .eq("receiver_id", userId)
    .neq("sender_id", userId) // Don't count messages sent by the user themselves
    .is("read_at", null)

  if (error) {
    console.error("Error getting unread message count:", error)
    return 0
  }

  console.log(`Unread message count for user ${userId}: ${count || 0}`)
  return count || 0
}

// Real-time subscription for new messages
export function subscribeToMessages(conversationId: string, callback: (message: MessageWithSender) => void) {
  const supabase = getSupabaseClient()

  return supabase
    .channel(`messages:${conversationId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${conversationId}`,
      },
      async (payload) => {
        // Fetch the full message with sender details
        const { data } = await supabase
          .from("messages")
          .select(`
            *,
            sender:users!messages_sender_id_fkey (
              id,
              name,
              avatar
            )
          `)
          .eq("id", payload.new.id)
          .single()

        if (data) {
          callback(data)
        }
      },
    )
    .subscribe()
}

// Real-time subscription for conversation updates
export function subscribeToConversations(userId: string, callback: (conversation: ConversationWithDetails) => void) {
  const supabase = getSupabaseClient()

  return supabase
    .channel(`conversations:${userId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "conversations",
        filter: `buyer_id=eq.${userId}`,
      },
      callback,
    )
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "conversations",
        filter: `seller_id=eq.${userId}`,
      },
      callback,
    )
    .subscribe()
}

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          avatar?: string
          phone?: string
          location?: string
          member_since: string
          rating: number
          verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          avatar?: string
          phone?: string
          location?: string
          member_since?: string
          rating?: number
          verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          avatar?: string
          phone?: string
          location?: string
          member_since?: string
          rating?: number
          verified?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: number
          title: string
          description: string
          price: number
          original_price?: number
          category: string
          condition: string
          location: string
          time_ago: string
          seller_id: string
          images: string[]
          specifications: Record<string, string>
          status: 'active' | 'sold' | 'draft'
          views: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          title: string
          description: string
          price: number
          original_price?: number
          category: string
          condition: string
          location: string
          time_ago?: string
          seller_id: string
          images?: string[]
          specifications?: Record<string, string>
          status?: 'active' | 'sold' | 'draft'
          views?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          title?: string
          description?: string
          price?: number
          original_price?: number
          category?: string
          condition?: string
          location?: string
          time_ago?: string
          seller_id?: string
          images?: string[]
          specifications?: Record<string, string>
          status?: 'active' | 'sold' | 'draft'
          views?: number
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: number
          name: string
          slug: string
          icon: string
          color: string
          description?: string
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          slug: string
          icon: string
          color: string
          description?: string
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          slug?: string
          icon?: string
          color?: string
          description?: string
          created_at?: string
        }
      }
      conversations: {
        Row: {
          id: string
          buyer_id: string
          seller_id: string
          product_id: number
          last_message_at: string
          created_at: string
        }
        Insert: {
          id?: string
          buyer_id: string
          seller_id: string
          product_id: number
          last_message_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          buyer_id?: string
          seller_id?: string
          product_id?: number
          last_message_at?: string
          created_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string
          receiver_id: string
          content: string
          product_id?: number
          read_at?: string
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          sender_id: string
          receiver_id: string
          content: string
          product_id?: number
          read_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          sender_id?: string
          receiver_id?: string
          content?: string
          product_id?: number
          read_at?: string
          created_at?: string
        }
      }
      wishlist: {
        Row: {
          id: string
          user_id: string
          product_id: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: number
          created_at?: string
        }
      }
      cart_items: {
        Row: {
          id: string
          user_id: string
          product_id: number
          quantity: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: number
          quantity: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: number
          quantity?: number
          created_at?: string
        }
      }
    }
  }
}

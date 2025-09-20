import { createClient } from "../supabase-client"
import type { Database } from "../supabase"

type WishlistItem = Database["public"]["Tables"]["wishlist"]["Row"]
type Product = Database["public"]["Tables"]["products"]["Row"]

function getSupabaseClient() {
  return createClient()
}

export async function getWishlist(userId: string): Promise<Product[]> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from("wishlist")
    .select(`
      *,
      products!wishlist_product_id_fkey (
        *,
        users!products_seller_id_fkey (
          id,
          name,
          rating,
          verified,
          avatar
        )
      )
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching wishlist:", error)
    return []
  }

  return (data?.map((item) => item.products).filter(Boolean) as Product[]) || []
}

export async function addToWishlist(userId: string, productId: number): Promise<boolean> {
  const supabase = getSupabaseClient()

  const { error } = await supabase.from("wishlist").insert({
    user_id: userId,
    product_id: productId,
  })

  if (error) {
    console.error("Error adding to wishlist:", error)
    return false
  }

  return true
}

export async function removeFromWishlist(userId: string, productId: number): Promise<boolean> {
  const supabase = getSupabaseClient()

  const { error } = await supabase.from("wishlist").delete().eq("user_id", userId).eq("product_id", productId)

  if (error) {
    console.error("Error removing from wishlist:", error)
    return false
  }

  return true
}

export async function isInWishlist(userId: string, productId: number): Promise<boolean> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from("wishlist")
    .select("id")
    .eq("user_id", userId)
    .eq("product_id", productId)
    .single()

  if (error && error.code !== "PGRST116") {
    // PGRST116 is "not found" error
    console.error("Error checking wishlist:", error)
    return false
  }

  return !!data
}

export async function getWishlistCount(userId: string): Promise<number> {
  const supabase = getSupabaseClient()

  const { count, error } = await supabase
    .from("wishlist")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)

  if (error) {
    console.error("Error getting wishlist count:", error)
    return 0
  }

  return count || 0
}

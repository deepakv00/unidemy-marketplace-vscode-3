import { createClient } from "../supabase-client"
import type { Database } from "../supabase"

type Product = Database["public"]["Tables"]["products"]["Row"]
type ProductInsert = Database["public"]["Tables"]["products"]["Insert"]
type ProductUpdate = Database["public"]["Tables"]["products"]["Update"]

const supabase = createClient()

export async function getAllProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      users!products_seller_id_fkey (
        id,
        name,
        rating,
        verified,
        avatar
      )
    `)
    .eq("status", "active")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching products:", error)
    return []
  }

  return data || []
}

export async function getProductById(id: number): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      users!products_seller_id_fkey (
        id,
        name,
        rating,
        verified,
        avatar,
        member_since
      )
    `)
    .eq("id", id)
    .single()

  if (error) {
    console.error("Error fetching product:", error)
    return null
  }

  return data
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      users!products_seller_id_fkey (
        id,
        name,
        rating,
        verified,
        avatar
      )
    `)
    .eq("category", category)
    .eq("status", "active")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching products by category:", error)
    return []
  }

  return data || []
}

export async function searchProducts(query: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      users!products_seller_id_fkey (
        id,
        name,
        rating,
        verified,
        avatar
      )
    `)
    .or(`title.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`)
    .eq("status", "active")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error searching products:", error)
    return []
  }

  return data || []
}

export async function getSellerProducts(sellerId: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      users!products_seller_id_fkey (
        id,
        name,
        rating,
        verified,
        avatar
      )
    `)
    .eq("seller_id", sellerId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching seller products:", error)
    return []
  }

  return data || []
}

export async function getProductsBySeller(sellerId: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      users!products_seller_id_fkey (
        id,
        name,
        rating,
        verified,
        avatar
      )
    `)
    .eq("seller_id", sellerId)
    .eq("status", "active")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching products by seller:", error)
    return []
  }

  return data || []
}

export async function createProduct(
  product: Omit<ProductInsert, "id" | "created_at" | "updated_at">,
): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .insert(product)
    .select(`
      *,
      users!products_seller_id_fkey (
        id,
        name,
        rating,
        verified,
        avatar
      )
    `)
    .single()

  if (error) {
    console.error("Error creating product:", error)
    return null
  }

  return data
}

export async function updateProduct(id: number, updates: ProductUpdate): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select(`
      *,
      users!products_seller_id_fkey (
        id,
        name,
        rating,
        verified,
        avatar
      )
    `)
    .single()

  if (error) {
    console.error("Error updating product:", error)
    return null
  }

  return data
}

export async function deleteProduct(id: number): Promise<boolean> {
  const { error } = await supabase.from("products").delete().eq("id", id)

  if (error) {
    console.error("Error deleting product:", error)
    return false
  }

  return true
}

export async function updateProductById(id: number, updates: Partial<ProductUpdate>): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select(`
      *,
      users!products_seller_id_fkey (
        id,
        name,
        rating,
        verified,
        avatar
      )
    `)
    .single()

  if (error) {
    console.error("Error updating product:", error)
    return null
  }

  return data
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      users!products_seller_id_fkey (
        id,
        name,
        rating,
        verified,
        avatar
      )
    `)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("Error fetching featured products:", error)
    return []
  }

  return data || []
}

export async function getDonateGiveawayProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      users!products_seller_id_fkey (
        id,
        name,
        rating,
        verified,
        avatar
      )
    `)
    .eq("category", "donate-giveaway")
    .eq("status", "active")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching donate/giveaway products:", error)
    return []
  }

  return data || []
}

export async function getMovingOutProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      users!products_seller_id_fkey (
        id,
        name,
        rating,
        verified,
        avatar
      )
    `)
    .eq("category", "moving-out")
    .eq("status", "active")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching moving out products:", error)
    return []
  }

  return data || []
}

export async function incrementProductViews(productId: number): Promise<boolean> {
  const { error } = await supabase.rpc("increment_product_views", {
    product_id: productId,
  })

  if (error) {
    console.error("Error incrementing product views:", error)
    return false
  }

  return true
}

import { createClient } from "../supabase-client"
import type { Database } from "../supabase"

type Product = Database["public"]["Tables"]["products"]["Row"]
type ProductInsert = Database["public"]["Tables"]["products"]["Insert"]
type ProductUpdate = Database["public"]["Tables"]["products"]["Update"]

const supabase = createClient()

export async function getAllProducts(userLocation?: string): Promise<Product[]> {
  try {
    console.log("[API] getAllProducts called with location:", userLocation)
    
    let query = supabase
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

    // If user location is provided, prioritize products from that location
    if (userLocation) {
      query = query.or(`location.ilike.%${userLocation}%,location.is.null`)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching products:", error)
      return []
    }

    console.log("[API] Query result:", data)
    console.log("[API] Result is array:", Array.isArray(data))
    console.log("[API] Result length:", data?.length || 0)

    // Sort results to prioritize local products first
    if (userLocation && data) {
      data.sort((a, b) => {
        const aIsLocal = a.location.toLowerCase().includes(userLocation.toLowerCase())
        const bIsLocal = b.location.toLowerCase().includes(userLocation.toLowerCase())
        
        if (aIsLocal && !bIsLocal) return -1
        if (!aIsLocal && bIsLocal) return 1
        return 0
      })
    }

    const result = data || []
    console.log("[API] Returning:", result)
    return result
  } catch (error) {
    console.error("[API] Exception in getAllProducts:", error)
    return []
  }
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

export async function searchProducts(query: string, userLocation?: string): Promise<Product[]> {
  let searchQuery = supabase
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

  const { data, error } = await searchQuery

  if (error) {
    console.error("Error searching products:", error)
    return []
  }

  // Sort results to prioritize local products first
  if (userLocation && data) {
    data.sort((a, b) => {
      const aIsLocal = a.location.toLowerCase().includes(userLocation.toLowerCase())
      const bIsLocal = b.location.toLowerCase().includes(userLocation.toLowerCase())
      
      if (aIsLocal && !bIsLocal) return -1
      if (!aIsLocal && bIsLocal) return 1
      return 0
    })
  }

  return data || []
}

// Get products by location
export async function getProductsByLocation(location: string): Promise<Product[]> {
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
    .ilike("location", `%${location}%`)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching products by location:", error)
    return []
  }

  return data || []
}

// Get nearby products (within a certain radius)
export async function getNearbyProducts(
  userLocation: string, 
  radiusKm: number = 50
): Promise<Product[]> {
  // For now, we'll use a simple text-based approach
  // In a production app, you'd use PostGIS for proper geographic queries
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
    .ilike("location", `%${userLocation}%`)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching nearby products:", error)
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

export async function getFeaturedProducts(limit = 8, userLocation?: string): Promise<Product[]> {
  let query = supabase
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
    .limit(limit * 2) // Get more results to filter and sort

  const { data, error } = await query

  if (error) {
    console.error("Error fetching featured products:", error)
    return []
  }

  if (!data) return []

  // If user location is provided, prioritize local products
  if (userLocation && data.length > 0) {
    data.sort((a, b) => {
      const aIsLocal = a.location.toLowerCase().includes(userLocation.toLowerCase())
      const bIsLocal = b.location.toLowerCase().includes(userLocation.toLowerCase())
      
      if (aIsLocal && !bIsLocal) return -1
      if (!aIsLocal && bIsLocal) return 1
      
      // If both are local or both are not local, sort by creation date
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
  }

  // Return limited results
  return data.slice(0, limit)
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

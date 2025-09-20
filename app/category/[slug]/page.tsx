"use client"

import { useState, useEffect, useMemo } from "react"
import * as React from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Filter, Grid, List } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { getProductsByCategory } from "@/lib/api/products"
import { getCategoryBySlug } from "@/lib/api/categories"
import type { Database } from "@/lib/supabase"
import ProductCard from "@/product-card"

type Product = Database["public"]["Tables"]["products"]["Row"] & {
  users: {
    id: string
    name: string
    rating: number
    verified: boolean
    avatar?: string
  }
}

const categoryNames: Record<string, string> = {
  electronics: "Electronics",
  vehicles: "Vehicles",
  "home-garden": "Home & Garden",
  fashion: "Fashion",
  gaming: "Gaming",
  books: "Books",
  sports: "Sports",
  "baby-kids": "Baby & Kids",
  "donate-giveaway": "Donate/Giveaway",
  "moving-out": "Moving Out",
}

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> | { slug: string } }) {
  const slug = React.useMemo(() => {
    if (params instanceof Promise) {
      return React.use(params).slug
    }
    return (params as { slug: string }).slug
  }, [params])

  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [categoryData, setCategoryData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState("newest")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  useEffect(() => {
    async function loadCategoryData() {
      try {
        setLoading(true)
        const [productsData, categoryInfo] = await Promise.all([getProductsByCategory(slug), getCategoryBySlug(slug)])
        setProducts(productsData)
        setCategoryData(categoryInfo)
      } catch (error) {
        console.error("Error loading category data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadCategoryData()
  }, [slug])

  const categoryProducts = useMemo(() => {
    return products.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price
        case "price-high":
          return b.price - a.price
        case "newest":
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
    })
  }, [products, sortBy])

  const categoryName = categoryData?.name || categoryNames[slug] || slug.replace("-", " ")

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4 -ml-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2 text-gray-900 dark:text-white">{categoryName}</h1>
              <p className="text-gray-600 dark:text-gray-300">{categoryProducts.length} items available</p>
            </div>

            <div className="flex items-center gap-4">
              {/* Sort Options */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>

              {/* View Mode Toggle */}
              <div className="flex border rounded-lg">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-r-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Special Category Badges */}
        {slug === "donate-giveaway" && (
          <div className="mb-6">
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              Free Items - Community Donations
            </Badge>
          </div>
        )}

        {slug === "moving-out" && (
          <div className="mb-6">
            <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
              Urgent Sales - Great Deals
            </Badge>
          </div>
        )}

        {/* Products Grid/List */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-700 rounded-lg p-4 animate-pulse">
                <div className="aspect-square bg-gray-200 dark:bg-gray-600 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-2/3 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : categoryProducts.length > 0 ? (
          <div
            className={
              viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "space-y-4"
            }
          >
            {categoryProducts.map((product: Product) => (
              <ProductCard key={product.id} product={product} viewMode={viewMode} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <Filter className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
              No items found in {categoryName}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">Be the first to list an item in this category!</p>
            <Button onClick={() => router.push("/sell")}>List Your Item</Button>
          </div>
        )}
      </div>
    </div>
  )
}
